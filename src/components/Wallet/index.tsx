import "./index.scss"

import React, {useEffect} from "react"
import Icon from "../../Icons/Icon";
import {useAuth} from "../../utils/useAuth";
import {Receive} from "../Modal/Receive";
import {Send} from "../Modal/Send";
import {ledgerApi} from "../../actors/ledger";
import {ckBTCApi} from "../../actors/ckbtc";

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

  const getBalance = async () => {
    if (principal && isAuth) {
      Promise.all([ckBTCApi.ckBTCBalance(principal), ledgerApi.icpBalance(principal)]).then(e => setBalance(e))
    }
  }
  useEffect(() => {
    getBalance()
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
    <Token getBalance={getBalance} token={"ckBTC"} balance={Number(balances[0]) / 1e8} filePath={"/img_4.png"}/>
    <Token getBalance={getBalance} token={"ICP"} balance={Number(balances[1]) / 1e8} filePath={"/img_6.png"}/>
  </div>
}

const Token = ({filePath, balance, token, getBalance}: {
  filePath: string,
  balance: number,
  token: string, getBalance: Function
}) => {
  const [openReceive, setOpenReceive] = React.useState(false)
  const [openSend, setOpenSend] = React.useState(false)
  const {account, principal} = useAuth()
  return <div className={"token_item"}>
    <Receive token={token} account={token === "ICP" ? account ?? "" : ""}
             principalId={principal ? principal.toString() : ""}
             open={openReceive}
             setOpen={setOpenReceive}/>
    <Send getBalance={getBalance} token={token} balance={balance} open={openSend} setOpen={setOpenSend}/>
    <img src={filePath} alt=""/>
    <span style={{flex: "1"}}>{balance.toFixed(3)}</span>
    <span style={{flex: "1"}}>
      <span className={"record_wrap"}
            onClick={() => {
              if (token === "ICP") window.open(`https://dashboard.internetcomputer.org/account/${account}`)
              else if (token === "ckBTC") window.open(`https://dashboard.internetcomputer.org/ethereum/mxzaz-hqaaa-aaaar-qaada-cai/account/${principal?.toString()}`)
            }}>
        <Icon name={"record"}/>
      </span>
    </span>
    <div className={"token_button_wrap"} style={{display: "flex", alignItems: "center", gap: "2rem", width: "40%"}}>
      <span className={"receive"} onClick={() => {
        setOpenReceive(true)
      }}>Receive</span>
      <span className={"send"} onClick={() => setOpenSend(true)}>Send</span>
    </div>
  </div>
}
