import "./index.scss"

import React, {useEffect, useState} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {useAuth} from "../../../utils/useAuth";
import {Profile} from "../../../declarations/user/user";
import {NumberInput, PostUserInfo} from "../../Common";
import {getToAccountIdentifier} from "../../../utils/util";
import {parseUnits} from "ethers";
import {message} from "antd";
import {ledgerApi} from "../../../actors/ledger";
import {Principal} from "@dfinity/principal";
import {ckBTCApi} from "../../../actors/ckbtc";

export const Grant = ({open, setOpen, profile}: {
  open: boolean,
  setOpen: Function,
  profile: Profile | undefined
}) => {
  const [copied, setCopied] = React.useState(false)
  const {isDark, principal, isAuth} = useAuth()
  const [amount, setAmount] = useState(0)
  const [balances, setBalance] = React.useState<bigint[]>([])


  const getBalance = async () => {
    if (principal && isAuth) {
      Promise.all([ckBTCApi.ckBTCBalance(principal), ledgerApi.icpBalance(principal)]).then(e => {
        setBalance(e)
      })
    }
  }
  useEffect(() => {
    getBalance()
  }, [principal, isAuth])

  useEffect(() => {
    setAmount(0)
  }, [open]);

  const handleClick = (amount: number) => {
    setAmount(amount)
  }

  const send = async () => {
    if (!profile || amount <= 0) return
    let newAmount: bigint = parseUnits(amount + "", 8)
    const balance = Number(balances[1]) / 1e8
    if (amount > balance) {
      message.warning("insufficient balance")
      return 0
    }
    if (amount === balance) {
      newAmount = newAmount - BigInt(0.0001 * 1e8) // -fee
    }

    if (newAmount <= 0) {
      message.error("invalid amount")
      return 0
    }
    message.loading("transfering")
    setTimeout(() => {
      setOpen(false)
    }, 1000)
    try {
      const ac = getToAccountIdentifier(profile.id)
      await ledgerApi.transferUseAccount(ac, newAmount)
      getBalance()
      message.success("transfer done")
    } catch (e) {
      message.error("transfer error")
      return 0
    }
  }

  return <Modal setOpen={setOpen} open={open}>
    <div className={"grant_modal"}>
      <div className={`receive_title ${isDark ? "dark_receive_title" : ""}`}>
        <Icon name={"grant"}/>
        Reward
      </div>

      <PostUserInfo profile={profile}/>

      <div className={`token ${isDark ? "dark_token" : ""}`}>
        ICP
      </div>

      <div className={"amount_select"}>
        Amount
        <div className={"amount_wrap"}>
          <span className={"amount"} onClick={() => handleClick(0.3)}>0.3</span>
          <span className={"amount"} onClick={() => handleClick(1)}>1</span>
          <span className={"amount"} onClick={() => handleClick(10)}>10</span>
        </div>
      </div>

      <div className={"amount_select"}>
        <NumberInput setAmount={setAmount} value={amount}/>
      </div>
      <div className={"done_button"} onClick={send}>
        Done
      </div>
    </div>
  </Modal>
}
