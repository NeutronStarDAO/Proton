import "./index.scss"

import React, {useEffect} from "react"
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
        <span style={{background: theme === "dark" ? "#A3C4FF" : "", color: theme === "dark" ? "#000" : ""}}
              onClick={() => handleClick("dark")}>Dark</span>
        <span style={{background: theme === "auto" ? "#A3C4FF" : "", color: theme === "auto" ? "" : ""}}
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
      </div>
    </div>

    {/* Testnet Statement */}
    <div className={"setting_item"}>
      <details>
        <summary>
          Testnet Statement
          <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#fff" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><circle cx="128" cy="128" r="96" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></circle><circle cx="128" cy="180" r="12"></circle><path d="M127.9995,144.0045v-8a28,28,0,1,0-28-28" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path></svg>
        </summary>
        <div>
        Our goal is to create a decentralized app (DApp), but the journey toward full decentralization is a gradual process. It cannot be achieved overnight. As is widely known, DApps on the Internet Computer (IC) require a DAO to govern them and the integration of AI for content moderation. Until these technologies are fully implemented, the IceCube team will be responsible for overseeing content management.
        <br></br><br></br>
        It is no secret that the internet is filled with misinformation, fake promotions, scams, and malicious actors. We are committed to ensuring that our community does not become a breeding ground for the promotion of violence, extremism, terrorism, pornography, or subversive content.
        <br></br><br></br>
        Therefore, until DAO governance and decentralized AI content moderation are in place, the IceCube team will take responsibility for removing inappropriate content from public view. Please note, however, that this action only hides the content from the public, while the original poster will still have access to their own content. No direct deletion will take place.
        </div>
      </details>
    </div>
    {/* Testnet Statement */}
  </div>
}
