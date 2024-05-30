import "./index.scss"

import React from "react"
import Icon from "../../Icons/Icon";
import {useAuth} from "../../utils/useAuth";

export const Settings = () => {
  const {logOut}   = useAuth()
  return <div className={"setting_main"}>
    <div className={"title"}>Settings</div>
    <div className={"setting_item"}>
      <div className={"setting_title"}>
        <Icon name={"theme"}/>
        Light & Dark
      </div>
      <div className={"setting_button"}>
        <span>Light</span>
        <span>Dark</span>
        <span>Auto</span>
      </div>
    </div>
    <div className={"setting_item"}>
      <div className={"setting_title"}>
        <Icon name={"account"}/>
        Account
      </div>
      <div className={"setting_button"}>
        <span onClick={()=>logOut?.()}>Log Out</span>
        <span>Delete Account</span>
      </div>
    </div>
  </div>
}
