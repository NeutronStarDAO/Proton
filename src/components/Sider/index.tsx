import React, {useState} from 'react';
import "./index.scss"
import Icon, {Name} from "../../Icons/Icon";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../utils/useAuth";
import {Tooltip} from "antd";
import {PostModal} from "../Modal/Post";
import {useProfileStore} from "../../redux";

const menu = ["Home", "Explore", "Settings"]
export const Side = ({scrollToTop}: { scrollToTop: Function }) => {
  const navigate = useNavigate();
  const location = useLocation()
  const {logIn, isAuth} = useAuth()
  const [open, setOpen] = useState(false)

  return <div className={"side_wrap"}>
    <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
      <Logo/>
      <div className={"side_items"}>
        {menu.map((v, k) => {
          const isClick = location.pathname === `/${v.toLowerCase()}`
          return <div style={{
            cursor: v === "Home" && !isAuth ? "no-drop" : "pointer",
            background: isClick ? "#B0CCFF" : "",
            boxShadow: isClick ? "0 4px 4px 0 rgba(0, 0, 0, 0.25)" : ""
          }}
                      onClick={() => {
                        if (!(v === "Home" && !isAuth))
                          navigate(`/${v.toLowerCase()}`);
                        scrollToTop()
                      }} key={k} className="item">
            <Icon name={isClick ? `${v}_Click` as Name : v as Name}/>&nbsp;{v === "Home" ?
            <Tooltip title={v === "Home" && !isAuth ? "Please login first" : ""}>{v}</Tooltip> : <div>{v}</div>}
          </div>
        })}
        <PostModal setOpen={setOpen} open={open}/>
        <Tooltip title={isAuth ? "" : "Please login first"}>
          <div className={"post_button"}
               style={{
                 background: isAuth ? "#428EFF" : "gray",
                 justifyContent: "center",
                 padding: "0",
                 cursor: isAuth ? "pointer" : "no-drop"
               }}
               onClick={() => isAuth && setOpen(true)}>Post
          </div>
        </Tooltip>
      </div>
    </div>
    {
      isAuth ? <UserInfo/>
        : <div className="side_bottom" onClick={() => logIn?.()}>
          👋 Hi, login
        </div>

    }
  </div>
}

const Logo = () => {
  const navigate = useNavigate();

  return <div onClick={() => navigate("/")} className={"logo"}>
    <img src="./img_1.png" alt=""/>
  </div>
}

export const UserInfo = () => {
  const navigate = useNavigate();
  const profile = useProfileStore()
  const {principal} = useAuth()

  return <div className={"user_info"}>
    <div className={"info"}>
      <img src={profile.avatar_url ? profile.avatar_url : "./img_5.png"} alt=""/>
      <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
        <div className={"name"}>{profile.name ?? "XXX"}</div>
        <div className={"id"}>{shortenString(profile.handle ?? "", 10)}</div>
      </div>
    </div>
    <div onClick={() => navigate(`/profile/${principal?.toString()}`)} className={"icon"}>
      <Icon name={"user"}/>
      Profile
    </div>
  </div>
}

export const shortenString = (str: string, maxLength: number) => str.length > maxLength ? `${str.slice(0, 3)}...${str.slice(-(maxLength - 3))}` : str;


