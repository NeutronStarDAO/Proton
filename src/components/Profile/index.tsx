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
    <div className={"title"} style={{cursor: "pointer"}} onClick={() => scrollToTop()}>Profile</div>
    <div ref={scrollContainerRef} style={{overflow: "scroll", width: "100%", flex: "1"}}>
      <div className={"background"} style={{
        backgroundImage: `url(${profile?.back_img_url})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat", backgroundPositionY: "50%"
      }}></div>
      <div className={"profile_body"}>
        <UserPanel profile={profile}/>
        {
          posts ? posts.map((v, k) => {
            return <Post selectedID={"post_id" in selectPost ? selectPost.post_id : ""} post={v} updateFunction={() => {
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

  return <div className={"user_panel"}>
    <div className={"avatar_panel"}>
      <div className={"info"}>
        <img style={{objectFit:"cover"}} src={profile && profile.avatar_url ? profile.avatar_url : "/img_1.png"} alt=""/>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          <div className={"name"}>{profile?.name}</div>
          <div className={"id"}>{shortenString(profile ? profile.handle : "", 16)}</div>
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

    <div className={"des"}>
      {profile?.biography}
    </div>

    <div className={"aa"} ref={ref}>
      <div className={"label"} style={{visibility: !!profile?.location ? "visible" : "hidden"}}>
        <Icon name={"location"}/> {profile?.location}
      </div>
      <div className={"label label-link"} style={{visibility: !!profile?.website ? "visible" : "hidden"}}>
        <Icon name={"link"}/> {profile?.website}
      </div>
      <div className={"label"}>
          <span className={"wrap"}>
            <span className={"number"}>{followings}</span>
            <div className={"follow"} onClick={() => nav(`/following/${id}`)} onMouseEnter={() => enter(".following")}
                 onMouseLeave={leave}>
              Following
              <div className={"down_line following"}/>
            </div>
          </span>
      </div>
      <div className={"label"}>
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
