import "./index.scss"

import React, {useEffect, useState} from "react"
import Icon from "../../Icons/Icon";
import {Post} from "../Main";
import {ProfileModal} from "../Modal/Profile";
import {Profile as profile_type} from "../../declarations/user/user";
import {useAuth} from "../../utils/useAuth";
import {userApi} from "../../actors/user";
import {shortenString} from "../Sider";

export const Profile = () => {

  const {principal} = useAuth()
  const [profile, setProfile] = useState<profile_type>()
  // const [posts,setPosts] = useState()

  useEffect(() => {
    if (principal) {
      userApi.getProfile(principal).then(e => {
        setProfile(e)
      })
    }
  }, [principal])

  return <div className={"profile_main"}>
    <div className={"title"}>Profile</div>
    <div style={{overflow: "scroll", width: "100%"}}>
      <div className={"background"} style={{
        backgroundImage: `url(${profile?.back_img_url})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat", backgroundPositionY: "50%"
      }}></div>
      <div className={"profile_body"}>
        <UserPanel profile={profile}/>
        {/*<Post/>*/}
        {/*<Post/>*/}
        {/*<Post/>*/}
      </div>
    </div>

  </div>
}


const UserPanel = ({profile}: { profile?: profile_type }) => {
  const [open, setOpen] = useState(false)
  return <div className={"user_panel"}>
    <div className={"avatar_panel"}>
      <div className={"info"}>
        <img  src={profile ? profile.avatar_url : "img_5.png"} alt=""/>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          <div className={"name"}>{profile?.name}</div>
          <div className={"id"}>{shortenString(profile ? profile.id.toString() : "", 16)}</div>
        </div>
      </div>
      <ProfileModal setOpen={setOpen} open={open}/>
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
        <span><span className={"number"}>270</span>Following</span>
      </div>
      <div className={"label"}>
        <span><span className={"number"}> 375</span>Followers</span>
      </div>
    </div>
  </div>
}
