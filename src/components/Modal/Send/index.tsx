import "./index.scss"

import React, {useEffect, useRef} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {rootFeedApi} from "../../../actors/root_feed";
import {Principal} from "@dfinity/principal";
import {useAuth} from "../../../utils/useAuth";
import {ledgerApi} from "../../../actors/ledger";
import {message} from "antd";

export const Send = ({open, setOpen, balance, token}: {
  open: boolean,
  setOpen: Function,
  balance: number,
  token: string
}) => {
  const [to, setTo] = React.useState("")
  const [amount, setAmount] = React.useState<number>(0)

  const {isDark} = useAuth()


  useEffect(() => {
    setAmount(0)
    setTo("")
  }, [open]);

  const send = () => {
    let newAmount = amount
    if (token === "ICP" && amount === balance) {
      newAmount = amount - 0.0002
    }
    if (newAmount <= 0) {
      return message.error("invalid amount")
    }
    setOpen(false)
    message.loading("transferring...")
    if (to.length === 64) { // account id
      try {
        ledgerApi.transferUseAccount(to, newAmount).then(() => message.success("transfer success"))
      } catch (e) {
        console.log("???")
        message.error("transfer error")
      }
    } else if (to.length === 63) {// principal
      let pri: Principal
      try {
        pri = Principal.fromText(to)
      } catch (e) {
        message.error("principal error")
        return
      }
      ledgerApi.transferUsePrincipal(pri, newAmount).then(() => message.success("transfer success"))
    } else {
      message.error("invalid address")
    }
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
          <input value={to} onChange={e => setTo(e.target.value)} placeholder={"Account ID / Principal ID"}
                 type="text"/>
        </div>
        <div className={"amount"}>
          <input onChange={e => {
            if (isNaN(+e.target.value)) {
              return setAmount(0)
            }
            setAmount(+(e.target.value))
          }} value={amount} placeholder={"Amount"} type="number"/>
          <span onClick={() => setAmount(balance)}>Max</span>
        </div>
        {/*<p>Fee:</p>*/}
      </div>

      <div className={"done_button"} onClick={send}>
        Done
      </div>
    </div>
  </Modal>
}
