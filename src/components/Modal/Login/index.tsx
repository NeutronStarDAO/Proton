import "./index.scss"

import React from "react"
import {Modal} from "../index";

export const Login = ({open, setOpen}: { open: boolean, setOpen: Function }) => {

  return <Modal open={open} component={<div className={"login_modal"}>
    <div className={"title"}>Welcome to Proton!</div>
    <div className={"avatar_wrap"}>
      <div className={"avatar"}>
        <img src="./img_8.png" alt=""/>
      </div>
      <div className={"background"}>
        <img src="./img_8.png" alt=""/>
      </div>
    </div>
    <InfoItem t={"ID"} value={"nash.icp"} flag={true}/>
    <InfoItem t={"Nam"} value={"Nash"} flag={true}/>
    <InfoItem t={"Bio"}
              value={"Geek writer, software engineer, cryptocurrency enthusiast. Building on #ICP. Love BTC. "}
              flag={false}/>
    <InfoItem t={"Location"} value={"NeutronStar"} flag={false}/>
    <InfoItem t={"Website"} value={"https://github.com/NeutronStarDAO"} flag={false}/>
    <Done/>
  </div>}/>
}

const InfoItem = ({t, value, flag}: { t: string, value: string, flag: boolean }) => {
  return <div className={"item_wrap"}
              style={{flexDirection: flag ? "row" : "column", alignItems: flag ? "center" : "start"}}>
    <div style={{fontWeight: "bold", width: "20%", display: "flex"}}>{t}</div>
    <div style={{fontWeight: "300", fontSize: "2.5rem"}}>{value}</div>
  </div>
}


export const Done = () => {
  return <div className={"done"}>
    Done
  </div>
}
