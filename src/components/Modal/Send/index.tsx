import "./index.scss"

import React from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {rootFeedApi} from "../../../actors/root_feed";
import {Principal} from "@dfinity/principal";

export const Send = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
  const [to, setTo] = React.useState("")
  const [amount, setAmount] = React.useState(0)
  const send = () => {
    console.log(to)
    rootFeedApi.transferICP(Principal.from(to), BigInt(amount * 1e8)).then((res) => {
      console.log("res",res)
    })
  }
  return <Modal setOpen={setOpen} open={open}>
    <div className={"send_modal"}>
      <div className={"title"}>
        <Icon name={"back"}/>
        Send
      </div>

      <div className={"token"}>
        ICP
      </div>

      <div className={"account"}>
        Account ID / Principal ID
        <div className={"send_address"}>
          <input onChange={e => setTo(e.target.value)} type="text"/>
        </div>
        <div className={"amount"}>
          <input onChange={e => setAmount(Number(e.target.value))} type="number"/>
          <span>Max</span>
        </div>
        <p>Fee:</p>
      </div>

      <div className={"done_button"} onClick={send}>
        Done
      </div>
    </div>
  </Modal>
}
