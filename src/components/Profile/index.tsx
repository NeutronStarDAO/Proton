import "./index.scss"

import React, {useEffect, useRef, useState} from "react"
import Icon from "../../Icons/Icon";
import {ProfileModal} from "../Modal/Profile";
import {Profile as profile_type} from "../../declarations/user/user";
import {userApi} from "../../actors/user";
import {shortenString} from "../Sider";
import {useNavigate, useParams} from "react-router-dom";
import {Principal} from "@dfinity/principal";
import {Post as post_type} from "../../declarations/feed/feed";
import {message} from "antd";
import {Post} from "../Main";
import Feed from "../../actors/feed";
import {useAuth} from "../../utils/useAuth";
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {useSelectPostStore} from "../../redux/features/SelectPost";
import {nanosecondsToDate} from "../../utils/util";
import ScrollTrigger from 'gsap/ScrollTrigger';
import {Loading} from "../Loading";
import {Profile as ProfileType} from "../../declarations/user/user";
import {LikeList} from "../LikeList";

gsap.registerPlugin(ScrollTrigger);

export const Profile = ({
                          scrollContainerRef,
                          scrollToTop
                        }: { scrollToTop: Function, scrollContainerRef: React.MutableRefObject<null> }) => {
  const {id}: { id?: string } = useParams()
  const [profile, setProfile] = useState<profile_type>()
  const [posts, setPosts] = useState<post_type[]>()
  const {post: selectPost} = useSelectPostStore()
  const {isDark} = useAuth()
  const titleRef = useRef<any>(null)
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<ProfileType[]>()
  const getData = async () => {
    if (!profile || !id) return 0
    if (profile.feed_canister.length === 0) return 0

    const feed_cid = profile.feed_canister[0]
    const feedApi = new Feed(feed_cid)
    const res = await Promise.all([feedApi.getAllPost(Principal.from(id))])
    setPosts([...res[0]])
  }

  useEffect(() => {
    getData()
  }, [profile, id])

  useEffect(() => {
    if (id) {
      userApi.getProfile(Principal.from(id)).then(e => {
        setProfile(e)
      })
    }
  }, [id])

  useEffect(() => {
    const titleRefCurrent = titleRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (titleRefCurrent && scrollContainer) {
      gsap.to(titleRefCurrent, {
        backgroundColor: '#F0F4FF', // 你希望滚动到特定位置时改变的颜色
        scrollTrigger: {
          trigger: titleRefCurrent,
          scroller: scrollContainer,
          start: 'top top', // 当元素顶部与视口顶部对齐时触发
          scrub: true, // 平滑滚动触发
        },
      });
    }

  }, [titleRef, scrollContainerRef]);

  return <div className={`profile_main ${isDark ? "dark_profile_main" : ""}`} ref={scrollContainerRef}>
    <div ref={titleRef} className={"profile_title"} style={{cursor: "pointer"}} onClick={() => scrollToTop()}>Profile
    </div>
    <div style={{width: "100%", flex: "1"}}>
      <div className={"background"} style={{
        backgroundImage: `url(${profile?.back_img_url})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat", backgroundPositionY: "50%"
      }}></div>
      <div className={"profile_body"}>
        <UserPanel profile={profile}/>
        <>
          <div style={{display: showLikeList ? "none" : "flex", flexDirection: "column", width: "100%"}}>
            {posts ? posts.map((v, k) => {
              return <Post setLikeUsers={setLikeUsers} setShowLikeList={setShowLikeList} profile={profile}
                           selectedID={selectPost ? selectPost.post_id : ""} post={v}
                           updateFunction={() => {
                           }} key={k}/>
            }) : <Loading isShow={true} style={{width: "100%", color: "black"}}/>}
          </div>
          <LikeList style={{display: showLikeList ? "flex" : "none", width: "100%"}} backApi={() => {
            setShowLikeList(false)
            setLikeUsers(undefined)
          }} users={likeUsers}/>
        </>
      </div>
    </div>

  </div>
}


const UserPanel = ({profile}: { profile?: profile_type }) => {
  const {id}: { id?: string } = useParams()
  const {principal, isAuth, account} = useAuth()
  const [followers, setFollowers] = useState<number>(0)
  const [followings, setFollowings] = useState<number>(0)
  const [isFollowed, setIsFollowed] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const tl = useRef<any>()
  const nav = useNavigate()
  const [showMore, setShowMore] = useState(false)
  const [load, setLoad] = useState(false)
  const [avatar, setAvatar] = useState<string>("")
  const [isBlack, setIsBlack] = useState(false)
  const isOwner = React.useMemo(() => {
    return id === principal?.toText()
  }, [id, principal])

  const isFollow = () => {
    if (id && principal) {
      userApi.isFollowed(principal, Principal.from(id)).then(e => {
        setIsFollowed(e)
      })
    }
  }

  const IsBlack = () => {
    if (id && principal) {
      userApi.is_black_follow_list(principal, Principal.from(id)).then(e => {
        setIsBlack(e)
      })
    }
  }

  useEffect(() => {
    isFollow()
    IsBlack()
  }, [id, principal]);

  useEffect(() => {
    if (id) {
      userApi.getFollowerNumber(Principal.from(id)).then(e => {
        setFollowers(e)
      })
      userApi.getFollowingNumber(Principal.from(id)).then(e => {
        setFollowings(e)
      })
    }
  }, [id])

  const handleFollow = async () => {
    if (!id) return
    if (isFollowed) {
      setIsFollowed(false)
      userApi.cancel_follow(Principal.from(id)).then(() => {
        isFollow()
      }).catch(() => {
        message.error("Failed to cancel follow.")
        setIsFollowed(true)
      })
    } else {
      setIsFollowed(true)
      userApi.follow(Principal.from(id)).then(() => {
        isFollow()
      }).catch(() => {
        message.error("Failed to follow.")
        setIsFollowed(false)
      })
    }
  }

  const {contextSafe} = useGSAP({scope: ref})

  const enter = contextSafe((className: string) => {
    tl.current = gsap.timeline()
    tl.current.to(className, {width: "100%", autoAlpha: 1, duration: 0.2})
  })

  const leave = contextSafe(() => {
    tl.current.reverse()
  })

  const block = async () => {
    if (!id) return
    try {
      message.loading("pending...")
      const res = await userApi.add_black_list(Principal.from(id))
      console.log(res)
      if (res) {
        message.success("Blocked successfully.")
        setIsBlack(true)
      } else {
        message.error("Failed to block")
      }
    } catch (e: any) {
      message.warning(e?.message)
    }
  }

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url) setAvatar(profile.avatar_url)
      else setAvatar("/img_3.png")
    }
  }, [profile]);

  return <div className={"user_panel"}>
    <div className={"avatar_panel"}>
      <div className={"info"}>
        <div style={{position: "relative"}}>
          <img src={avatar} alt="" onLoad={() => setLoad(true)}/>
          <div className="skeleton skeleton-avatar"
               style={{display: !load ? "block" : "none", width: "10.9rem", height: "10.9rem"}}/>
        </div>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          {profile?.name ? <div className={"name"}>{profile?.name}</div> :
            <div className="skeleton skeleton-title" style={{height: "3rem"}}/>}

          {profile?.handle ? <div className={"id"}>{shortenString(profile ? profile.handle : "", 16)}</div> :
            <div className="skeleton skeleton-text" style={{height: "2rem", marginTop: "2rem"}}/>}
        </div>
      </div>
      <ProfileModal setOpen={setOpen} open={open} canClose={true}/>
      <div style={{display: 'flex', alignItems: 'center'}}>


        {!isBlack ?
          <div className={"dropdown_select_modal"} style={{position: "relative", display: isOwner ? "none" : "flex"}}>
            <div className={"more_wrap"} onClick={e => {
              e.stopPropagation()
              setShowMore(!showMore)
            }}>
              <div>
                <Icon name={"more"}/>
              </div>
            </div>
            <div className={"dropdown_wrap"} style={{display: showMore ? "flex" : "none", zIndex: '100'}}>
              <div onClick={block}>
                <Icon name={"block"}/> Block
              </div>
            </div>
          </div> : <span className={"edit"}>
        Remove
      </span>}


        {isOwner ? <span className={"edit"} onClick={() => setOpen(true)}>
        <Icon name={"edit"}/>
        Edit
      </span> : <span style={{display: isAuth ? "flex" : "none"}} className={"edit"} onClick={handleFollow}>
        {isFollowed ? "Following" : "Follow"}
      </span>}
      </div>


    </div>
    {profile ? <div className={"des"} style={{padding: "0 2rem"}}>
      {profile?.biography}
    </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "10rem"}}/>}


    <div className={"aa"} ref={ref}>

      {/*<div style={{display: "flex", alignItems: "center", gap: "3rem"}}>*/}
      {profile ? <div className={"label"} style={{display: !!profile?.location ? "flex" : "none"}}>
        <Icon name={"location"}/> {profile?.location}
      </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}

      {profile ? <div onClick={() => window.open(profile?.website)} className={"label label-link"}
                      style={{display: !!profile?.website ? "flex" : "none"}}>
        <Icon name={"link"}/> {profile?.website}
      </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}
      {/*</div>*/}

      {/*<div style={{display: "flex", alignItems: "center", gap: "3rem"}}>*/}
      {account ? <WalletAddress/> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}

      {profile ? <div className={"label"} style={{display: !!profile?.location ? "flex" : "none"}}>
        <Icon name={"join_time"}/> {profile.created_at[0] ? "Joined " + nanosecondsToDate(profile.created_at[0]) : ''}
      </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}


      {/*</div>*/}

      <div className={"label"}>
        <span className={"wrap"}>
          <span className={"number"}>{followings}</span>
          <div className={"follow"} onClick={() => nav(`/following/${id}`)} onMouseEnter={() => enter(".following")}
               onMouseLeave={leave}>
            Following
            <div className={"down_line following"}/>
          </div>
        </span>

        <span className={"wrap"}>
          <span className={"number"}>{followers}</span>
          <div className={"follow "} onClick={() => nav(`/followers/${id}`)} onMouseEnter={() => enter(".follower")}
               onMouseLeave={leave}>
            Followers
            <div className={"down_line follower"}/>
          </div>
        </span>
      </div>
    </div>


  </div>
}

const WalletAddress = () => {
  const [copied, setCopied] = React.useState(false)
  const {account} = useAuth()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account ?? "");
      setCopied(true)
    } catch (e) {
      setCopied(false)
    } finally {
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }
  return <div className={"label"} style={{display: !!account ? "flex" : "none", padding: "0"}}>
    <div className={"wallet_address"} onClick={copy}>
      {!copied ? <Icon width={"3rem"} height={"2.3rem"} name={"Wallet"}/> :
        <Icon name={"copied"}/>
      } {copied ? "Copied!" : "ICP Address"}
      {!copied && <Icon name={"copy"}/>}
    </div>
  </div>
}
