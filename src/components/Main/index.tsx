import "./index.scss"

import React, {useEffect, useMemo, useRef, useState} from 'react';
import Icon from "../../Icons/Icon";
import {useLocation, useNavigate} from "react-router-dom";
import {Post as postType} from "../../declarations/feed/feed";
import {Empty, message, notification, Tooltip} from "antd";
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {rootPostApi} from "../../actors/root_bucket";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {shortenString} from "../Sider";
import {CloseOutlined} from "@ant-design/icons";
import {updateSelectPost, useSelectPostStore} from "../../redux/features/SelectPost";
import {getTime, isIn} from "../../utils/util";
import {CommentInput, ShowMoreTest} from "../Common";
import {Loading} from "../Loading";
import {LikeList} from "../LikeList";
import {Grant} from "../Modal/Grant";

const pageCount = 30

export const Main = ({scrollContainerRef}: { scrollContainerRef: React.MutableRefObject<null> }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const {userFeedCai, isAuth, principal} = useAuth()
  const [homeData, setHomeData] = useState<postType[]>()
  const [exploreData, setExploreData] = useState<postType[]>()
  const [page, setPage] = useState(0);
  const [isEnd, setIsEnd] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<Profile[]>()
  const {post: selectPost} = useSelectPostStore()
  const loader = useRef(null)


  const data = React.useMemo(() => {
    return location.pathname === "/explore" ? exploreData : homeData
  }, [homeData, exploreData])

  const change = () => {
    if (isAuth === false)
      navigate("/explore")
  }
  const Title = React.useMemo(() => {
    setHomeData(undefined)
    setExploreData(undefined)
    setProfiles([])
    setPage(0)
    setIsEnd(false)
    setShowLikeList(false)
    if (location.pathname === "/explore") return "Explore"
    return "Home"
  }, [location.pathname])

  useEffect(() => {
    !isAuth && change()
  }, [isAuth, Title])

  const getHomeData = React.useCallback(async () => {
    if (!userFeedCai || !principal) return 0
    const feedApi = new Feed(userFeedCai)
    const res = await feedApi.getHomeFeedByLength(principal, page * pageCount, pageCount)
    if (page === 0) return setHomeData(res);
    if (res.length < 30 || res.length === 0) setIsEnd(true)
    const newArr = [...(data ?? []), ...res]
    setHomeData(newArr);
  }, [page, userFeedCai, principal])

  const getExploreData = React.useCallback(async () => {
    const res = await rootPostApi.get_buckets_latest_feed_from_start(page * pageCount, pageCount)
    if (page === 0) return setExploreData(res);
    if (res.length < 30 || res.length === 0) setIsEnd(true)
    const newArr = [...(data ?? []), ...res]
    setExploreData(newArr);
  }, [page])

  useEffect(() => {
    data && userApi.batchGetProfile(data.map(v => v.user)).then(e => setProfiles(e))
  }, [data]);

  useEffect(() => {
    if (Title === "Explore") getExploreData()
  }, [Title, getExploreData])

  useEffect(() => {
    if (Title === "Home") getHomeData()
  }, [Title, getHomeData]);


  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1)
      }
    }, {threshold: 0})

    loader.current && ob.observe(loader.current)

    return () => {
      loader.current && ob.unobserve(loader.current)
    }
  }, [loader.current])


  return <>
    <LikeList style={{display: showLikeList ? "flex" : "none"}} backApi={() => {
      setShowLikeList(false)
      setLikeUsers(undefined)
    }}
              users={likeUsers}/>
    <div ref={scrollContainerRef} style={{display: showLikeList ? "none" : "flex"}} id={"content_main"}
         className={"main_wrap scroll_main"}>
      <div className={"title"}>{Title}</div>
      {data ? data.length === 0 ? <Empty style={{width: "100%"}}/>
        : data.map((v, k) => {
          return <Post setLikeUsers={setLikeUsers} key={k} profile={profiles[k]}
                       selectedID={selectPost ? selectPost.post_id : ""}
                       updateFunction={Title === "Explore" ? getExploreData : getHomeData}
                       post={v} setShowLikeList={setShowLikeList}/>
        }) : <Loading isShow={true} style={{width: "100%"}}/>}
      <div ref={loader} style={{width: "100%", display: data && !isEnd ? "" : "none"}}>
        <Loading isShow={true} style={{width: "100%"}}/>
      </div>
    </div>
  </>

}

export const Post = ({post, updateFunction, selectedID, profile, setShowLikeList, setLikeUsers}: {
  post: postType,
  updateFunction: Function,
  selectedID: string, profile?: Profile, setShowLikeList: Function, setLikeUsers: Function
}) => {
  const principal = post.user
  const navigate = useNavigate()
  const {principal: user_id, isDark} = useAuth()
  const [hoverOne, setHoverOne] = useState(-1)
  const [replyContent, setReplyContent] = useState("")
  const [open, setOpen] = useState(false)
  const {post: selectPost} = useSelectPostStore()
  const moreButton = useRef(null);
  const [showMore, setShowMore] = useState(false)
  const postRef = useRef(null)
  const [like, setLike] = useState(false)
  const [isLoad, setIsLoad] = useState(false)
  const [avatar, setAvatar] = useState("")
  const [openGrant, setOpenGrant] = useState(false)
  const [showSending, setShowSending] = useState(false)

  const arg = useMemo(() => {
    const res = {
      time: getTime(post.created_at),
      isLike: false, isRepost: false

    }
    if (!user_id) return res

    res.isLike = isIn(user_id.toText(), post.like.map(v => v.user.toText()))
    res.isRepost = isIn(user_id.toString(), post.repost.map(v => v.user.toText()))
    return res
  }, [post, user_id])

  const isMy = useMemo(() => {
    if (!user_id) return false
    return user_id.toText() === principal.toText()
  }, [user_id, principal])

  const sendReply = async () => {
    if (replyContent.length <= 0) return 0
    const feedApi = new Feed(post.feed_canister)
    try {
      setShowSending(true)
      setOpen(false)
      await feedApi.createComment(post.post_id, replyContent)
      const res = await feedApi.getPost(post.post_id)
      if (res.length !== 0) {
        updateSelectPost({post: res[0]})
      }
    } catch (e) {
      message.error('Send failed !')
    } finally {
      updateFunction()
      setShowSending(false)
    }
  }

  const getLikeUsers = async () => {
    const likes = post.like
    const ids = likes.map(v => v.user)
    const res = await userApi.batchGetProfile(ids)
    setLikeUsers(res)
  }

  const handleClick = async (index: number) => {
    const feedApi = new Feed(post.feed_canister)

    if (index === 1) {
      setOpen(true)
      return
    }
    if (index === 3) {
      getLikeUsers()
      setShowLikeList(true)
      return
    }
    if (index === 4) {
      const newStr = post.post_id.replace(/#/g, '_');
      navigate("/post/" + newStr)
    }
    if (index === 5) {
      setOpenGrant(true)
      return
    }
    try {
      if (index === 0) { // like
        setLike(true)
        await feedApi.createLike(post.post_id)
      } else if (index === 2) { // repost
        await feedApi.createRepost(post.post_id)
      }
      updateFunction()
    } catch (e) {
      message.error("failed !")
    }
  }

  const click = (event: any) => {
    //@ts-ignore
    if (!(moreButton.current && moreButton.current.contains(event.target))) {
      setShowMore(false)
    } else {
      setShowMore(true)
    }
  };

  useEffect(() => {
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('click', click);
    };
  }, []);

  useEffect(() => {
    setReplyContent("")
  }, [open])

  useEffect(() => {
    if (selectPost && selectPost.post_id === post.post_id) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting)
            updateSelectPost({})
        },
        {
          root: null, // 默认是视口
          rootMargin: '0px',
          threshold: 0.1, // 元素进入视口10%时触发
        }
      );

      if (postRef.current) {
        observer.observe(postRef.current);
      }

      // 清理
      return () => {
        if (postRef.current) {
          observer.unobserve(postRef.current);
        }
      };
    }
  }, [selectPost]);

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url) setAvatar(profile.avatar_url)
      else setAvatar("/img_3.png")
    }
  }, [profile])

  const deletePost = async () => {
    const feedApi = new Feed(post.feed_canister)
    try {
      await feedApi.deletePost(post.post_id)
      updateFunction()
    } catch (e) {
      message.error('failed !')
    }
  }

  const load = () => {
    setIsLoad(true)
  }

  return <>
    <Grant open={openGrant} setOpen={setOpenGrant}/>
    <div ref={postRef}
         className={`post_main ${isDark ? "dark_post_main" : ""} ${(selectedID === post.post_id) ? isDark ? "dark_selected_post" : "selected_post" : ""}`}
         onClick={(e) => {
           if ("className" in e.target && e.target.className === "show-more-less-clickable") {
             return 0
           }
           updateSelectPost({}).then(() => updateSelectPost({post}))
         }}
    >
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div className={"author"}>
          <div style={{position: "relative"}}>
            <Tooltip title={profile?.name}>
              <img className={"avatar"}
                   onClick={(e) => {
                     e.stopPropagation()
                     window.open(`/profile/${principal.toString()}`)
                   }}
                   src={avatar} alt="" onLoad={load}/>
            </Tooltip>
            <div className="skeleton skeleton-avatar" style={{display: !isLoad ? "block" : "none"}}/>
          </div>
          <div style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center"}}>
            {profile ? <div
                style={{fontSize: "2.1rem", fontWeight: "500", fontFamily: "Fredoka, sans-serif"}}>{profile.name}</div> :
              <div className="skeleton skeleton-title"/>
            }
            <div style={{display: "flex", alignItems: "center", fontSize: "2rem", gap: "1rem"}}>
              {profile ?
                <div style={{color: "rgb(132 137 168)"}}>{profile ? shortenString(profile.handle, 25) : ""}</div> :
                <div className="skeleton skeleton-text"/>
              }
              <span className="post_dot"/>
              <div style={{color: "rgb(132 137 168)"}}>
                {arg.time}
              </div>
            </div>
          </div>
        </div>
        <div style={{position: "relative"}}>
          <div ref={moreButton} className={"more_wrap"} onClick={e => {
            e.stopPropagation()
            setShowMore(true)
          }}>
            <div>
              <Icon name={"more"}/>
            </div>
          </div>
          <div className={"dropdown_wrap"} style={{display: showMore ? "flex" : "none", zIndex: '100'}}>
            {/* <div style={{cursor: "no-drop"}}>
              <Icon name={"pin"}/> Pin
            </div> */}
            <div onClick={deletePost} style={{display: isMy ? "flex" : "none"}}>
              <Icon name={"trash"}/>Delete
            </div>
          </div>
        </div>
      </div>
      <div className={"tweet"}>
        <ShowMoreTest content={post.content}/>
        <div className={"img_list"} style={{
          gridTemplateColumns: post.photo_url.length === 1 ? "1fr" : "repeat(2, 1fr)",
          height: post.photo_url.length === 0 ? "0" : "50rem",
          minHeight: post.photo_url.length === 0 ? "0" : "50rem",
        }}>
          {post.photo_url.map((v, k) => {
            return <ImagePreview key={k} src={v} imageCount={post.photo_url.length}/>
          })}
        </div>
      </div>
      <BottomButton post={post} like={like} arg={arg} handleClick={handleClick} hoverOne={hoverOne}
                    setHoverOne={setHoverOne} showSending={showSending}/>
      <CommentInput setOpen={setOpen} open={open} replyContent={replyContent} setReplyContent={setReplyContent}
                    callBack={sendReply}/>
    </div>
  </>
}

const ImagePreview = ({src, imageCount}: { src: string, imageCount: number }) => {

  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setIsFullScreen(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setIsFullScreen(false);
  };

  return (
    <>
      <div className="image-container">
        <img
          src={src}
          alt=""
          onClick={handleImageClick}
          style={{width: imageCount === 1 ? 'auto' : '100%'}}
        />
      </div>

      {isFullScreen && (
        <div className="image-overlay" onClick={handleOverlayClick}>
          <img
            src={src}
            alt=""
            className="full-screen-image"
          />
        </div>
      )}
    </>
  );
};

const BottomButton = React.memo(({handleClick, hoverOne, setHoverOne, arg, post, like, showSending}: {
  handleClick: Function,
  hoverOne: number,
  setHoverOne: Function,
  arg: { isLike: boolean, isRepost: boolean },
  post: postType,
  like: boolean,
  showSending: boolean
}) => {

  const {isAuth} = useAuth()

  const handleHover = (index: number) => {
    if (isAuth)
      setHoverOne(index)
    else setHoverOne(-1)
  }

  return <div className={"post_bottom"}>

    <Tooltip title={!isAuth ? "please login first" : ""}>
       <span onClick={(e) => {
         if (!isAuth) return 0
         e.stopPropagation()
         handleClick(0)
       }}
             style={{color: arg.isLike || hoverOne === 0 ? "red" : "black", cursor: !isAuth ? "no-drop" : ""}}
             onMouseEnter={e => handleHover(0)}
             onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={arg.isLike || hoverOne === 0 || like ? "like_click" : "like"}/>
         {like ? post.like.length + 1 : post.like.length}
      </span>
    </Tooltip>

    <Tooltip title={!isAuth ? "please login first" : ""}>

        <span onClick={(e) => {
          if (!isAuth) return 0
          e.stopPropagation()
          handleClick(1)
        }}
              style={{color: hoverOne === 1 ? "#1C9BEF" : "black", cursor: !isAuth ? "no-drop" : ""}}
              onMouseEnter={e => handleHover(1)}
              onMouseLeave={e => setHoverOne(-1)}>
           <Icon color={hoverOne === 1 ? "#1C9BEF" : "black"} name={"comment"}/>
          {post.comment.length}
          <span style={{
            display: showSending ? "block" : "none",
            background: "#D7E4FF",
            borderRadius: "2.1rem",
            fontFamily: "Fredoka , sans-serif",
            padding: "1rem 1.3rem"
          }}>Sending</span>
      </span>
    </Tooltip>

    <Tooltip title={!isAuth ? "please login first" : ""}>
         <span onClick={(e) => {
           if (!isAuth) return 0
           e.stopPropagation()
           handleClick(2)
         }}
               style={{
                 color: arg.isRepost || hoverOne === 2 ? "rgb(0,186,124,0.6)" : "black",
                 cursor: !isAuth ? "no-drop" : ""
               }}
               onMouseEnter={() => handleHover(2)}
               onMouseLeave={e => setHoverOne(-1)}>
           <Icon color={arg.isRepost || hoverOne === 2 ? "rgb(0,186,124,0.6)" : "black"} name={"repost"}/>
           {post.repost.length}
      </span>
    </Tooltip>
    <span onClick={(e) => {
      e.stopPropagation()
      handleClick(3)
    }}
          style={{
            background: hoverOne === 3 ? "#F0F4FF" : "",
            borderRadius: "50%",
            padding: "0.5rem 0.7rem"
          }}
          onMouseEnter={() => handleHover(3)}
          onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={"heartbeat"}/>
      </span>
    <span onClick={(e) => {
      e.stopPropagation()
      handleClick(4)
    }}
          style={{
            background: hoverOne === 4 ? "#F0F4FF" : "",
            borderRadius: "50%",
            padding: "0.5rem 0.7rem"
          }}
          onMouseEnter={() => handleHover(4)}
          onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={"share"}/>
      </span>
    <span onClick={(e) => {
      e.stopPropagation()
      handleClick(5)
    }}
          style={{
            background: hoverOne === 5 ? "#F0F4FF" : "",
            borderRadius: "50%",
            padding: "0.5rem 0.7rem"
          }}
          onMouseEnter={() => handleHover(5)}
          onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={"grant"}/>
      </span>
  </div>
})

