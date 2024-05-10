import "./index.scss"

import React from 'react';
import Icon from "../../Icons/Icon";
import {useLocation} from "react-router-dom";

export const Main = () => {
  const location = useLocation()
  const Title = React.useMemo(() => {
    if (location.pathname === "/explore") return "Explore"
    return "Home"
  }, [location])
  return <div className={"main_wrap scroll_main"}>
    <div className={"title"}>{Title}</div>
    <Post/>
    <Post/>
  </div>
}

export const Post = () => {
  return <div className={"post_main"}>
    <div className={"author"}>
      <img className={"avatar"} src="img_3.png" alt=""/>
      <div style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center"}}>
        <div style={{fontSize: "2rem"}}>Nash</div>
        <div style={{fontSize: "2rem", color: "rgba(0,0,0,0.5)"}}>@nash_icp • Feb 15, 2024</div>
      </div>
    </div>
    <div className={"tweet"}>
      We can build a protocol together to enable data exchange beyond individual app platforms (Web2 apps), allowing any
      user to interact with others through their own canisters. Everyone maintains sovereignty over their own data and
      can freely engage with others. I believe that in the Web2 era, killer apps were king. But in Web3, protocols reign
      supreme.
      <div className={"img_list"}>
        <img src="img_4.png" alt=""/>
        <img src="img_4.png" alt=""/>
        <img src="img_4.png" alt=""/>
      </div>
    </div>
    <div className={"post_bottom"}>
      <span>
      <Icon name={"like"}/>
        119
      </span>
      <span>
      <Icon name={"comment"}/>
        15
      </span>
      <span>
      <Icon name={"repost"}/>
        36
      </span>
    </div>
  </div>
}
