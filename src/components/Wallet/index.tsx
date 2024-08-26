import "./index.scss"

import React, {useEffect} from "react"
import Icon from "../../Icons/Icon";
import {useAuth} from "../../utils/useAuth";
import {Receive} from "../Modal/Receive";
import {Send} from "../Modal/Send";
import {ledgerApi} from "../../actors/ledger";

export const Wallet = () => {
  return <div className={"wallet_main"}>
    <div className={"title"}>Wallet</div>
    <Balance/>
  </div>
}

const Balance = () => {
  const {principal, isAuth} = useAuth()
  const [balances, setBalance] = React.useState<bigint[]>([])
  const {isDark} = useAuth()
  useEffect(() => {
    if (principal && isAuth) {
      Promise.all([ledgerApi.icpBalance(principal)]).then(e => setBalance(e))
    }
  }, [principal, isAuth])

  return <div className={`balance ${isDark ? "dark_balance" : ""}`}>
    <div className={"title"}>
       <span>
        Token
      </span>
      <span style={{flex: "1"}}>
        Balance
      </span>
      <span style={{flex: "1"}}>
        Transactions
      </span>
    </div>
    {/*<Token token={"ckBTC"} balance={Number(balances[0])} filePath={"/img_4.png"}/>*/}
    {/*<Token token={"ghost"} balance={Number(balances[1])} filePath={"/img_5.png"}/>*/}
    <Token token={"ICP"} balance={Number(balances[0]) / 1e8} filePath={"/img_6.png"}/>
  </div>
}

const Token = ({filePath, balance, token}: {
  filePath: string,
  balance: number,
  token: string,
}) => {
  const [openReceive, setOpenReceive] = React.useState(false)
  const [openSend, setOpenSend] = React.useState(false)
  const {account, principal} = useAuth()

  return <div className={"token_item"}>
    <Receive account={account ?? ""} principalId={principal ? principal.toString() : ""} open={openReceive}
             setOpen={setOpenReceive}/>
    <Send token={token} balance={balance} open={openSend} setOpen={setOpenSend}/>
    <img src={filePath} alt=""/>
    <span style={{flex: "1"}}>{balance.toFixed(3)}</span>
    <span style={{flex: "1"}}>
      <span className={"record_wrap"}
            onClick={() => {
              if (token === "ICP") window.open(`https://dashboard.internetcomputer.org/account/${account}`)
            }}>
        <Icon name={"record"}/>
      </span>
    </span>
    <div className={"token_button_wrap"} style={{display: "flex", alignItems: "center", gap: "2rem", width: "40%"}}>
      <span className={"receive"} onClick={() => {
        if (token === "ICP")
          setOpenReceive(true)
      }}>Receive</span>
      <span className={"send"} onClick={() => setOpenSend(true)}>Send</span>
    </div>
  </div>
}
