import "./index.scss"

import React from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {rootFeedApi} from "../../../actors/root_feed";
import {Principal} from "@dfinity/principal";
import {useAuth} from "../../../utils/useAuth";

export const Send = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
  const [to, setTo] = React.useState("")
  const [amount, setAmount] = React.useState(0)
  const {isDark} = useAuth()
  const send = () => {
    // rootFeedApi.transferICP(Principal.from(to), BigInt(amount)).then((res) => {
    // })
  }
  return <Modal setOpen={setOpen} open={open}>
    <div className={"send_modal"}>
      <div className={`send_title ${isDark ? "dark_send_title" : ""}`}>
        <Icon name={"back"}/>
        Send
      </div>

      <div className={`token ${isDark ? "dark_token" : ""}`}>
        ICP
      </div>

      <div className={`account ${isDark ? "dark_account" : ""}`}>
        Destination
        <div className={"send_address"}>
          <input onChange={e => setTo(e.target.value)} placeholder={"Account ID / Principal ID"} type="text"/>
        </div>
        <div className={"amount"}>
          <input  onChange={e => setAmount(Number(e.target.value))} placeholder={"Amount"} type="number"/>
          <span>Max</span>
        </div>
        <p>Fee: 0.0001 ICP</p>
      </div>

      <div className={"done_button"} onClick={send}>
        Done
      </div>
    </div>
  </Modal>
}
