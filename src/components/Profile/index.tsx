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
import {Skeleton, Spin} from "antd";
import {Post} from "../Main";
import Feed from "../../actors/feed";
import {useAuth} from "../../utils/useAuth";
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {useSelectPostStore} from "../../redux/features/SelectPost";
import {nanosecondsToDate} from "../../utils/util";

export const Profile = ({
                          scrollContainerRef,
                          scrollToTop
                        }: { scrollToTop: Function, scrollContainerRef: React.MutableRefObject<null> }) => {
  const {id}: { id?: string } = useParams()
  const [profile, setProfile] = useState<profile_type>()
  const [posts, setPosts] = useState<post_type[]>()
  const selectPost = useSelectPostStore()

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

  return <div className={"profile_main"}>
    <div className={"profile_title"} style={{cursor: "pointer"}} onClick={() => scrollToTop()}>Profile</div>
    <div ref={scrollContainerRef} style={{width: "100%", flex: "1"}}>
      <div className={"background"} style={{
        backgroundImage: `url(${profile?.back_img_url})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat", backgroundPositionY: "50%"
      }}></div>
      <div className={"profile_body"}>
        <UserPanel profile={profile}/>
        {
          posts ? posts.map((v, k) => {
            return <Post profile={profile} selectedID={"post_id" in selectPost ? selectPost.post_id : ""} post={v}
                         updateFunction={() => {
                         }} key={k}/>
          }) : <Spin spinning={true} style={{width: "100%"}}/>
        }
      </div>
    </div>

  </div>
}


const UserPanel = ({profile}: { profile?: profile_type }) => {
  const {id}: { id?: string } = useParams()
  const {principal} = useAuth()
  const [followers, setFollowers] = useState<number>(0)
  const [followings, setFollowings] = useState<number>(0)
  const [isFollowed, setIsFollowed] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const tl = useRef<any>()
  const nav = useNavigate()
  const [load, setLoad] = useState(false)
  const [avatar, setAvatar] = useState<string>("")
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

  useEffect(() => {
    isFollow()
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
      userApi.cancel_follow(Principal.from(id)).then(() => {
        isFollow()
      })
    } else {
      userApi.follow(Principal.from(id)).then(() => {
        isFollow()
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
      {isOwner ? <span className={"edit"} onClick={() => setOpen(true)}>
        <Icon name={"edit"}/>
        Edit
      </span> : <span className={"edit"} onClick={handleFollow}>
        {isFollowed ? "Following" : "Follow"}
      </span>}
    </div>
    {profile ? <div className={"des"}>
      {profile?.biography}
    </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "10rem"}}/>}


    <div className={"aa"} ref={ref}>

      {profile ? <div className={"label"} style={{display: !!profile?.location ? "block" : "none"}}>
        <Icon name={"location"}/> {profile?.location}
      </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}

      {profile ? <div className={"label"} style={{display: !!profile?.location ? "block" : "none"}}>
        <Icon name={"join_time"}/> {profile.created_at[0] ?"Joined "+ nanosecondsToDate(profile.created_at[0]) : ''}
      </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}

      {profile ? <div onClick={() => window.open(profile?.website)} className={"label label-link"}
                      style={{display: !!profile?.website ? "block" : "none"}}>
        <Icon name={"link"}/> {profile?.website}
      </div> : <div className="skeleton skeleton-text" style={{height: "2rem", width: "5rem"}}/>}

      <div className={"label"} style={{display: "none"}}>
        <Icon name={"location"}/> {profile?.location}
      </div>
    </div>

    <div className={"label_follow"}>
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
}
