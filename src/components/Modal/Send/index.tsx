import "./index.scss"

import React, {useEffect, useRef} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {Principal} from "@dfinity/principal";
import {useAuth} from "../../../utils/useAuth";
import {ledgerApi} from "../../../actors/ledger";
import {message} from "antd";
import {ckBTCApi} from "../../../actors/ckbtc";
import {parseUnits} from "ethers";

export const Send = ({open, setOpen, balance, token, getBalance}: {
  open: boolean,
  setOpen: Function,
  balance: number,
  token: string, getBalance: Function
}) => {
  const [to, setTo] = React.useState("")
  const [amount, setAmount] = React.useState<number>(0)
  const [icpLoading, setIcpLoading] = React.useState(false)
  const [ckbtcLoading, setCkbtcLoading] = React.useState(false)
  const {isDark} = useAuth()
  useEffect(() => {
    setAmount(0)
    setTo("")
  }, [open]);

  const send = () => {
    let newAmount: bigint = parseUnits(amount + "", 8)
    if (token === "ICP" && amount === balance) {
      newAmount = newAmount - BigInt(0.0001 * 1e8) // -fee
    }
    if (token === "ckBTC" && amount === balance) {
      newAmount = newAmount - BigInt(10) // -fee
    }
    console.log(newAmount)
    if (newAmount <= 0) {
      return message.error("invalid amount")
    }
    setOpen(false)
    message.loading("transferring...")
    if (token === "ICP") {
      setIcpLoading(true)
      if (to.length === 64) { // account id
        try {
          ledgerApi.transferUseAccount(to, newAmount).then(() => {
            message.success("transfer success")
            setIcpLoading(false)
            getBalance()
          })
        } catch (e) {
          message.error("transfer error")
        }
      } else if (to.length === 63) {// principal
        let pri: Principal
        try {
          pri = Principal.fromText(to)
        } catch (e) {
          return message.error("principal error")
        }
        ledgerApi.transferUsePrincipal(pri, newAmount).then(() => {
          message.success("transfer success")
          getBalance()
          setIcpLoading(false)
        })
      } else {
        message.error("invalid address")
        setIcpLoading(false)
      }
    } else if (token === "ckBTC") {
      setCkbtcLoading(true)
      let pri: Principal
      try {
        pri = Principal.fromText(to)
      } catch (e) {
        return message.error("principal error")
      }
      ckBTCApi.transferCkBTC(pri, newAmount).then(() => {
        message.success("transfer success")
        getBalance()
        setCkbtcLoading(false)
      })

    }

  }

  return <Modal setOpen={setOpen} open={open}>
    <div className={"send_modal"}>
      <div className={`send_title ${isDark ? "dark_send_title" : ""}`}>
        <Icon name={"back"}/>
        Send
      </div>

      <div className={`token ${isDark ? "dark_token" : ""}`}>
        {token}
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
        <p>Fee: {token === "ICP" ? "0.0001 ICP" : "0.0000001 ckBTC"}</p>
      </div>

      <div className={"done_button"} onClick={send}>
        Done
      </div>
    </div>
  </Modal>
}
