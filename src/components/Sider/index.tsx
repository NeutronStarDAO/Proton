import React, { useState } from 'react';
import "./index.scss"
import Icon, { Name } from "../../Icons/Icon";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { Tooltip } from "antd";
import { PostModal } from "../Modal/Post";
import { useProfileStore } from "../../redux";

const menu = ["Home", "Explore", "Settings"]
export const Side = ({ scrollToTop }: { scrollToTop: Function }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logIn, isAuth } = useAuth()
  const [open, setOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return <>
    <div className={`side_wrap ${isSidebarOpen ? "side_wrap_open" : ""}`}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Logo />
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
              <Icon name={isClick ? `${v}_Click` as Name : v as Name} />&nbsp;{v === "Home" ?
                <Tooltip title={v === "Home" && !isAuth ? "Please login first" : ""}>{v}</Tooltip> : <div className="sider_btn_word">{v}</div>}
            </div>
          })}
          <PostModal setOpen={setOpen} open={open} />
          <Tooltip title={isAuth ? "" : "Please login first"}>
            <div className={"post_button"}
              style={{
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
        isAuth ? <UserInfo />
          : <div className="side_bottom" onClick={() => logIn?.()}>
            👋 Hi, login
          </div>
      }
    </div>

    <div className="toggle_button" onClick={toggleSidebar}>
      {isSidebarOpen ? "😍" : "☰"}
    </div>

    <div className={`overlay ${isSidebarOpen ? "active" : ""}`} onClick={closeSidebar}></div>

  </>
}

const Logo = () => {
  const navigate = useNavigate();

  return <div onClick={() => navigate("/")} className={"logo"}>
    <img style={{ objectFit: "cover" }} src="/img_1.png" alt="" />
  </div>
}

export const UserInfo = () => {
  const navigate = useNavigate();
  const profile = useProfileStore()
  const { principal } = useAuth()
  const location = useLocation()

  return <div className={"user_info"}>
    <div className={"info"}>
      <img style={{ objectFit: "cover" }} src={profile.avatar_url ? profile.avatar_url : "/img_3.png"} alt="" />
      <div style={{ display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center" }}>
        <div className={"name"}>{profile.name ?? "Loading"}</div>
        <div className={"id"}>{shortenString(profile.handle ?? "", 10)}</div>
      </div>
    </div>
    <div onClick={() => navigate(`/profile/${principal?.toString()}`)} className={"icon"}
      style={{ background: location.pathname.includes("profile") ? "#C4B1EE" : "#DAD2EC" }}>
      <Icon name={location.pathname.includes("profile") ? "dark_user" : "user"} />
      Profile
    </div>
  </div>
}

export const shortenString = (str: string, maxLength: number) => str.length > maxLength ? `${str.slice(0, 3)}...${str.slice(-(maxLength - 3))}` : str;

