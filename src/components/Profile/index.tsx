import "./index.scss"

import React, {useEffect, useState} from "react"
import Icon from "../../Icons/Icon";
import {ProfileModal} from "../Modal/Profile";
import {Profile as profile_type} from "../../declarations/user/user";
import {userApi} from "../../actors/user";
import {shortenString} from "../Sider";
import {useParams} from "react-router-dom";
import {Principal} from "@dfinity/principal";
import {Post as post_type} from "../../declarations/feed/feed";
import {Skeleton, Spin} from "antd";
import {Post} from "../Main";
import Feed from "../../actors/feed";

export const Profile = ({
                          scrollContainerRef,
                          scrollToTop
                        }: { scrollToTop: Function, scrollContainerRef: React.MutableRefObject<null> }) => {
  const {id}: { id?: string } = useParams()
  const [profile, setProfile] = useState<profile_type>()
  const [posts, setPosts] = useState<post_type[]>()
  const [followerNumber, setFollowerNumber] = useState(0)
  const [followingNumber, setFollowingNumber] = useState(0)


  const getData = async () => {
    if (!profile) return 0
    if (profile.feed_canister.length === 0) return 0

    const feed_cid = profile.feed_canister[0]
    const feedApi = new Feed(feed_cid)
    const res = await Promise.all([feedApi.getAllPost(), feedApi.getLatestFeed(20)])

    setPosts([...res[0], ...res[1]])
  }

  useEffect(() => {
    getData()
  }, [profile])

  useEffect(() => {
    if (id) {
      userApi.getProfile(Principal.from(id)).then(e => {
        setProfile(e)
      })
      userApi.getFollowerNumber(Principal.from(id)).then(e => {
        setFollowerNumber(e)
      })
      userApi.getFollowingNumber(Principal.from(id)).then(e => {
        setFollowingNumber(e)
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
        <UserPanel profile={profile} followingNum={followingNumber} followerNum={followerNumber}/>
        {
          posts ? posts.map((v, k) => {
            return <Post post={v} updateFunction={() => {
            }} key={k}/>
          }) : <Spin spinning={true} style={{width: "100%"}}/>
        }
      </div>
    </div>

  </div>
}


const UserPanel = ({profile, followingNum, followerNum}: {
  profile?: profile_type,
  followerNum?: number,
  followingNum?: number
}) => {
  const [open, setOpen] = useState(false)
  return <div className={"user_panel"}>
    <div className={"avatar_panel"}>
      <div className={"info"}>
        <img src={profile && profile.avatar_url ? profile.avatar_url : "./img_5.png"} alt=""/>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          <div className={"name"}>{profile?.name}</div>
          <div className={"id"}>{shortenString(profile ? profile.handle : "", 16)}</div>
        </div>
      </div>
      <ProfileModal setOpen={setOpen} open={open} canClose={true}/>
      <span className={"edit"} onClick={() => setOpen(true)}>
        <Icon name={"edit"}/>
        Edit
      </span>
    </div>

    <div className={"des"}>
      {profile?.biography}
    </div>

    <div className={"aa"}>
      <div className={"label"}>
        <Icon name={"location"}/> {profile?.education}
      </div>
      <div className={"label"}>
        <Icon name={"link"}/> {profile?.company}
      </div>
      {/*<div className={"label"}>*/}
      {/*  <Icon name={"email"}/> ICP Address*/}
      {/*</div>*/}
      {/*<div className={"label"}>*/}
      {/*  <Icon name={"calendar"}/> Joined October 7, 2024*/}
      {/*</div>*/}

      <div className={"label"}>
        <span><span className={"number"}>{followingNum}</span>Following</span>
      </div>
      <div className={"label"}>
        <span><span className={"number"}> {followerNum}</span>Followers</span>
      </div>
    </div>
  </div>
}
