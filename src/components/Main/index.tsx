import "./index.scss"

import React, {useEffect, useMemo, useRef, useState} from 'react';
import Icon from "../../Icons/Icon";
import {useLocation, useNavigate} from "react-router-dom";
import {Post as postType} from "../../declarations/feed/feed";
import {Empty, notification, Spin, Tooltip} from "antd";
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {rootPostApi} from "../../actors/root_bucket";
import {updateAllData, useAllDataStore} from "../../redux";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {shortenString} from "../Sider";
import {CloseOutlined} from "@ant-design/icons";
import {updateSelectPost, useSelectPostStore} from "../../redux/features/SelectPost";
import {getTime, isIn, postSort} from "../../utils/util";

export const Main = ({scrollContainerRef}: { scrollContainerRef: React.MutableRefObject<null> }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState<postType[]>()
  const {userFeedCai, isAuth, principal} = useAuth()
  const {allPost, allFeed} = useAllDataStore()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const selectPost = useSelectPostStore()

  const HomeData = React.useMemo(() => {
    if (!allFeed || !allPost) return undefined
    const a = postSort([...allFeed, ...allPost])
    userApi.batchGetProfile(a.map(v => v.user)).then(e => setProfiles(e))
    return a
  }, [allFeed, allPost])


  const change = () => {
    if (isAuth === false)
      navigate("/explore")
  }

  const Title = React.useMemo(() => {
    setData(undefined)
    setProfiles([])
    updateAllData({allFeed: undefined, allPost: undefined})
    if (location.pathname === "/explore") return "Explore"
    return "Home"
  }, [location])

  useEffect(() => {
    !isAuth && change()
  }, [isAuth, Title])


  const getHomeData = async () => {
    if (!userFeedCai || !principal) return 0
    const feedApi = new Feed(userFeedCai)
    await Promise.all([feedApi.getAllPost(principal), feedApi.getLatestFeed(principal, 100)])
  }

  const getExploreData = async () => {
    const res = await rootPostApi.get_buckets_latest_feed(100)
    setData(res)

  }

  useEffect(() => {
    if (data)
      userApi.batchGetProfile(data.map(v => v.user)).then(e => setProfiles(e))
  }, [data]);

  useEffect(() => {
    if (Title == "Home") {
      getHomeData()
    } else {
      getExploreData()
    }
  }, [Title, userFeedCai, principal])

  if (Title === "Explore") {
    return <div ref={scrollContainerRef} className={"main_wrap scroll_main"}>
      <div className={"title"}>{Title}</div>
      {data ? data.length === 0 ? <Empty style={{width: "100%"}}/>
        : data.map((v, k) => {
          return <Post profile={profiles[k]} selectedID={"post_id" in selectPost ? selectPost.post_id : ""}
                       updateFunction={getExploreData}
                       post={v}/>
        }) : <Spin spinning={true} style={{width: "100%"}}/>}
    </div>
  }

  return <div ref={scrollContainerRef} className={"main_wrap scroll_main"}>
    <div className={"title"}>{Title}</div>
    {HomeData ? HomeData.length === 0 ? <Empty style={{width: "100%"}}/>
      : HomeData.map((v, k) => {
        return <Post profile={profiles[k]} selectedID={"post_id" in selectPost ? selectPost.post_id : ""}
                     updateFunction={getHomeData}
                     post={v}/>
      }) : <Spin spinning={true} style={{width: "100%"}}/>}
  </div>
}

export const Post = ({post, updateFunction, selectedID, profile}: {
  post: postType,
  updateFunction: Function,
  selectedID: string, profile?: Profile
}) => {
  const principal = post.user
  const {principal: user_id} = useAuth()
  const [hoverOne, setHoverOne] = useState(-1)
  const [replyContent, setReplyContent] = useState("")
  const [open, setOpen] = useState(false)
  const selectPost = useSelectPostStore()
  const specifiedElementRef = useRef(null);
  const moreButton = useRef(null);
  const [showMore, setShowMore] = useState(false)
  const postRef = useRef(null)
  const navigate = useNavigate()
  const [api, contextHolder] = notification.useNotification();
  const [like, setLike] = useState(false)
  const isMy = useMemo(() => {
    if (!user_id) return false
    return user_id.toText() === principal.toText()
  }, [user_id, principal])
  const [isLoad, setIsLoad] = useState(false)
  const [avatar, setAvatar] = useState("")

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

  const sendReply = async () => {
    if (replyContent.length <= 0) return 0
    const feedApi = new Feed(post.feed_canister)
    try {
      setOpen(false)
      await feedApi.createComment(post.post_id, replyContent)
      updateFunction()
    } catch (e) {
      api.error({
        message: 'Sent failed !',
        key: 'comment',
        description: '',
        icon: <CloseOutlined/>
      })
    }
  }

  const handleClick = async (index: number) => {
    const feedApi = new Feed(post.feed_canister)

    if (index === 1) {
      setOpen(true)
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
      api.error({
        message: 'failed !',
        key: 'post_op',
        description: '',
        icon: <CloseOutlined/>
      })
    }
  }

  const click = (event: any) => {
    //@ts-ignore
    if (!(specifiedElementRef.current && specifiedElementRef.current.contains(event.target))) {
      setOpen(false)
    }
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
    if ("comment" in selectPost && selectPost.post_id === post.post_id) {
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
      api.error({
        message: 'failed !',
        key: 'delete_post',
        description: '',
        icon: <CloseOutlined/>
      })
    }
  }


  const load = () => {

    setIsLoad(true)
  }

  return <div ref={postRef} style={{background: selectedID === post.post_id ? "#F0F4FF" : ""}} className={"post_main"}
              onClick={() => updateSelectPost(post)}
  >
    {contextHolder}
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
      <div className={"author"}>
        <div style={{position: "relative"}}>
          <Tooltip title={profile?.name}>
            <img className={"avatar"}
                 onClick={(e) => {
                   e.stopPropagation()
                   navigate(`/profile/${principal.toString()}`)
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
          <div style={{display: "flex", alignItems: "center", fontSize: "2rem", color: "#6F7073", gap: "1rem"}}>

            {profile ? <div>{profile ? shortenString(profile.handle, 10) : ""}</div> :
              <div className="skeleton skeleton-text"></div>
            }
            <span style={{
              width: "0.5rem",
              minWidth: "0.5rem",
              height: "0.5rem",
              background: "#6F7073",
              borderRadius: "50%"
            }}/>
            <div style={{color: "#6F7073"}}>
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
          <div style={{cursor: "no-drop"}}>
            <Icon name={"pin"}/> Pin
          </div>
          <div onClick={deletePost} style={{display: isMy ? "flex" : "none"}}>
            <Icon name={"trash"}/>Delete
          </div>
        </div>
      </div>
    </div>
    <div className={"tweet"}>
      <pre>
        {post.content}
      </pre>
      <div className={"img_list"} style={{
        gridTemplateColumns: post.photo_url.length === 1 ? "1fr" : "repeat(2, 1fr)",
        height: post.photo_url.length === 0 ? "0" : "50rem",
        minHeight: post.photo_url.length === 0 ? "0" : "50rem",
      }}>
        {post.photo_url.map((v, k) => {
          return <ImagePreview key={k} src={v}/>
        })}
      </div>
    </div>
    <div className={"post_bottom"}>

      <span onClick={(e) => {
        e.stopPropagation()
        handleClick(0)
      }}
            style={{color: arg.isLike || hoverOne === 0 ? "red" : "black"}}
            onMouseEnter={e => setHoverOne(0)}
            onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={arg.isLike || hoverOne === 0 || like ? "like_click" : "like"}/>
        {like ? post.like.length + 1 : post.like.length}
      </span>

      <span onClick={(e) => {
        e.stopPropagation()
        handleClick(1)
      }}
            style={{color: hoverOne === 1 ? "#1C9BEF" : "black"}}
            onMouseEnter={e => setHoverOne(1)}
            onMouseLeave={e => setHoverOne(-1)}>
           <Icon color={hoverOne === 1 ? "#1C9BEF" : "black"} name={"comment"}/>
        {post.comment.length}
      </span>

      <span onClick={(e) => {
        e.stopPropagation()
        handleClick(2)
      }}
            style={{color: arg.isRepost || hoverOne === 2 ? "rgb(0,186,124,0.6)" : "black"}}
            onMouseEnter={() => setHoverOne(2)}
            onMouseLeave={e => setHoverOne(-1)}>
           <Icon color={arg.isRepost || hoverOne === 2 ? "rgb(0,186,124,0.6)" : "black"} name={"repost"}/>
        {post.repost.length}
      </span>
    </div>


    <div onClick={e => {
      e.stopPropagation()
    }} ref={specifiedElementRef} style={{display: open ? "flex" : "none"}} className={"reply_wrap"}>
      <textarea onChange={e => setReplyContent(e.target.value)} value={replyContent} name="" id="" rows={3}
                placeholder={"Reply"}/>

      <div onClick={sendReply} style={(() => {
        const canSend = replyContent.length > 0
        if (!canSend)
          return {
            background: "gray", cursor: "no-drop"
          }
      })()}>
        Send
      </div>

    </div>
  </div>
}

const ImagePreview = ({src}: { src: string }) => {

  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleImageClick = () => {
    setIsFullScreen(true);
  };

  const handleOverlayClick = () => {
    setIsFullScreen(false);
  };

  return (
    <>
      <div className="image-container">
        <img
          src={src}
          alt=""
          onClick={handleImageClick}
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

