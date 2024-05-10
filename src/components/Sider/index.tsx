import React from 'react';
import "./index.scss"
import Icon, {Name} from "../../Icons/Icon";
import {useLocation, useNavigate} from "react-router-dom";

const menu = ["Home", "Explore", "Wallet", "Settings"]
export const Side = () => {
  const navigate = useNavigate();
  const location = useLocation()

  return <div className={"side_wrap"}>
    <div style={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
      <Logo/>
      <div className={"side_items"}>
        {menu.map((v, k) => {
          return <div style={{
            background: location.pathname === `/${v.toLowerCase()}` ? "#B0CCFF" : "",
            boxShadow: location.pathname === `/${v.toLowerCase()}` ? "0 4px 4px 0 rgba(0, 0, 0, 0.25)" : ""
          }}
                      onClick={() => {
                        navigate(`/${v.toLowerCase()}`);
                      }} key={k} className="item">
            <Icon name={v as Name}/>&nbsp;{v}
          </div>
        })}
        <div className={"post_button"} style={{justifyContent: "center", padding: "0"}}>Post</div>
      </div>
    </div>

    {/*<div className="side_bottom">*/}
    {/*  👋 Hi, login*/}
    {/*</div>*/}
    <UserInfo/>
  </div>
}

const Logo = () => {
  const navigate = useNavigate();

  return <div onClick={() => navigate("/")} className={"logo"}>
    <img src="./img_1.png" alt=""/>
    <img style={{height: "4.6rem"}} src="./img.png" alt=""/>
  </div>
}

const UserInfo = () => {
  const navigate = useNavigate();

  return <div className={"user_info"}>
    <div className={"info"}>
      <img src="img_5.png" alt=""/>
      <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
        <div className={"name"}>Nash</div>
        <div className={"id"}>@nash.icp</div>
      </div>
    </div>
    <div onClick={() => navigate("/profile")} className={"icon"}>
      <Icon name={"user"}/>
      Profile
    </div>
  </div>
}

