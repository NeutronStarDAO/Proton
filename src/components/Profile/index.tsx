import "./index.scss"

import React from "react"
import Icon from "../../Icons/Icon";
import {Post} from "../Main";

export const Profile = () => {
  return <div className={"profile_main"}>
    <div className={"title"}>Profile</div>
    <div style={{overflow:"scroll"}}>
      <div className={"background"}></div>
      <div className={"profile_body"}>
        <UserPanel/>
        {/*<Post/>*/}
        {/*<Post/>*/}
        {/*<Post/>*/}
      </div>
    </div>

  </div>
}


const UserPanel = () => {
  return <div className={"user_panel"}>
    <div className={"avatar_panel"}>
      <div className={"info"}>
        <img src="img_5.png" alt=""/>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          <div className={"name"}>Nash</div>
          <div className={"id"}>@nash.icp</div>
        </div>
      </div>
      <span className={"edit"}>
        <Icon name={"edit"}/>
        Edit
      </span>
    </div>

    <div className={"des"}>
      Geek writer, software engineer, cryptocurrency enthusiast. Building on #ICP. Love BTC.
    </div>

    <div className={"aa"}>
      <div className={"label"}>
        <Icon name={"location"}/> NeutronStar
      </div>
      <div className={"label"}>
        <Icon name={"link"}/> github.com/NeutronStarDAO
      </div>
      <div className={"label"}>
        <Icon name={"email"}/> ICP Address
      </div>
      <div className={"label"}>
        <Icon name={"calendar"}/> Joined October 7, 2024
      </div>

      <div className={"label"}>
        <span><span className={"number"}>270</span>Following</span>
      </div>
      <div className={"label"}>
        <span><span className={"number"}> 375</span>Followers</span>
      </div>
    </div>
  </div>
}
