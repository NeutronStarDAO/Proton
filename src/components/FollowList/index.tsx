import React, {useEffect, useRef} from "react"
import "./index.scss"
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {Profile} from "../../declarations/user/user";
import {userApi} from "../../actors/user";
import {Principal} from "@dfinity/principal";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {useAuth} from "../../utils/useAuth";

export const FollowList = React.memo(() => {
  const {pathname} = useLocation()
  const {id} = useParams()
  const [useridList, setUseridList] = React.useState<Principal[]>([])
  const [users, setUsers] = React.useState<Profile[]>([])
  const {principal} = useAuth()

  const isOwner = React.useMemo(() => {
    return id === principal?.toText()
  }, [id, principal])

  const isFollowerList = React.useMemo(() => {
    return pathname.includes("followers")
  }, [pathname])

  const init = async () => {
    if (!id) return
    if (isFollowerList) {
      const res = await userApi.getFollowerList(Principal.from(id))
      setUseridList(res)
    } else {
      const res = await userApi.getFollowingList(Principal.from(id))
      setUseridList(res)
    }
  }

  useEffect(() => {
    userApi.batchGetProfile(useridList).then(e => {
      setUsers(e)
    })
  }, [useridList]);

  useEffect(() => {
    init()
  }, [id, isFollowerList]);


  return <div className={"follow_main"}>
    {users.map((v, k) => {
      return <UserCard init={init} isFollowerList={isFollowerList} isOwner={isOwner} profile={v} key={k}/>
    })}
  </div>
})

const UserCard = React.memo(({profile, isOwner, isFollowerList, init}: {
  profile: Profile,
  isOwner: boolean,
  isFollowerList: boolean, init: Function
}) => {
  const ref = useRef(null)
  const {contextSafe} = useGSAP({scope: ref})
  const tl = useRef<any>()

  const enter = contextSafe(() => {
    tl.current = gsap.timeline()
    tl.current.to(".down_line", {width: "100%", autoAlpha: 1, duration: 0.2})
  })

  const leave = contextSafe(() => {
    tl.current.reverse()
  })

  const cancel_follow = () => {
    userApi.cancel_follow(profile.id).then(() => init())
  }

  const navigate = useNavigate()

  return <div ref={ref} className={"user_card"} onClick={() => navigate(`/profile/${profile.id.toString()}`)}>
    <img src={profile.avatar_url ? profile.avatar_url : "/img_1.png"} alt=""/>
    <div style={{width:"100%"}}>
      <div className={"card_head"}>
        <div className={"user_info"}>
          <div className={"name"}>
            <p style={{fontSize: '2.5rem'}}>{profile.name}</p>
            <p style={{fontSize: '2rem'}}>{profile.handle}</p>
          </div>
        </div>
        <div onClick={(e) => {
          e.stopPropagation()
          cancel_follow()
        }} onMouseEnter={enter} onMouseLeave={leave} className={"following_button"}
             style={{cursor: "pointer", display: isOwner && !isFollowerList ? "flex" : "none"}}>
          Following
          <div className={"down_line"}/>
        </div>
      </div>
      <div className={"des"}>
        {profile.biography}
      </div>
    </div>
  </div>
})
