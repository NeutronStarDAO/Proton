import "./index.scss"

import React, {useEffect} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {shortenString} from "../../Sider";
import {Tooltip} from "antd";
import {useAuth} from "../../../utils/useAuth";

export const Grant = ({open, setOpen}: {
  open: boolean,
  setOpen: Function,

}) => {
  const [copied, setCopied] = React.useState(false)
  const {isDark} = useAuth()

  return <Modal setOpen={setOpen} open={open}>
    <div className={"grant_modal"}>
      <div className={`receive_title ${isDark ? "dark_receive_title" : ""}`}>
        <Icon name={"grant"}/>
        Reward
      </div>

      <div className={`token ${isDark ? "dark_token" : ""}`}>
        ICP
      </div>

      <div className={"amount_select"}>
        Amount
        <div className={"amount_wrap"}>
          <span className={"amount"}>0.3</span>
          <span className={"amount"}>1</span>
          <span className={"amount"}>10</span>
        </div>
      </div>

      <div className={"amount_select"}>
        <input type="text"/>
      </div>

      <div className={"done_button"} onClick={() => setTimeout(() => setOpen(false), 230)}>
        Done
      </div>
    </div>
  </Modal>
}
