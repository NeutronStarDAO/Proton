import "./index.scss"

import React from "react"
import Icon from "../../Icons/Icon";
import {Theme, themeKey, useAuth} from "../../utils/useAuth";

export const Settings = () => {
  const {logOut, setTheme, theme} = useAuth()

  const handleClick = (theme: Theme) => {
    setTheme(theme)
    if (theme === "auto") {
      localStorage.setItem(themeKey, "auto")
    } else if (theme === "dark") {
      localStorage.setItem(themeKey, "dark")
    } else if (theme === "light") {
      localStorage.setItem(themeKey, "light")
    } else {
      localStorage.removeItem(themeKey)
    }
  }

  return <div className={`setting_main`}>
    <div className={"title"}>Settings</div>
    <div className={"setting_item"}>
      <div className={"setting_title"}>
        <Icon name={"theme"}/>
        Light & Dark
      </div>
      <div className={"setting_button"}>

        <span style={{background: theme === "light" ? "#A3C4FF" : ""}} onClick={() => handleClick("light")}>Light</span>
        <span style={{background: theme === "dark" ? "#A3C4FF" : "", color: theme === "dark" ? "wheat" : ""}}
              onClick={() => handleClick("dark")}>Dark</span>
        <span style={{background: theme === "auto" ? "#A3C4FF" : "", color: theme === "auto" ? "wheat" : ""}}
              onClick={() => handleClick("auto")}>Auto</span>
      </div>
    </div>
    <div className={"setting_item"}>
      <div className={"setting_title"}>
        <Icon name={"account"}/>
        Account
      </div>
      <div style={{cursor: "pointer"}} className={"setting_button"}>
        <span onClick={() => logOut?.()}>Log Out</span>
        <span>Delete Account</span>
      </div>
    </div>
  </div>
}
