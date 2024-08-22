import "./index.scss"

import React, {useEffect} from "react"
import Icon from "../../Icons/Icon";
import {useAuth} from "../../utils/useAuth";
import {rootFeedApi} from "../../actors/root_feed";
import {Principal} from "@dfinity/principal";
import {Receive} from "../Modal/Receive";
import {Send} from "../Modal/Send";
import {WalletTX} from "../../declarations/root_feed/root_feed";

export const Wallet = () => {
  const [showTx, setShowTx] = React.useState(false)
  return <div className={"wallet_main"}>
    <div className={"title"}>Wallet</div>
    <Balance setShowTx={setShowTx}/>
    {showTx && <Tx/>}
  </div>
}

const Tx = () => {
  const [txs, setTxs] = React.useState<WalletTX[]>([])
  const {principal} = useAuth()
  useEffect(() => {
    principal && rootFeedApi.icpTx(principal).then(e => {
      console.log(e)
      setTxs(e)
    })
  }, [principal]);

  return <div className={"tx_main"}>
      <span style={{fontSize: "2.7rem", gap: "2rem", display: "flex", alignItems: "center"}}>
        Transactions
        <Icon name={"tx"}/>
        <img style={{width: "3rem"}} src="/img_6.png" alt=""/>
      </span>
    {txs.map((v, k) => {
      return <TxItem tx={v} key={k}/>
    })}
  </div>
}

const TxItem = ({tx}: { tx: WalletTX }) => {
  return <div className={"tx_item"}>
    <Icon name={"receive"}/>
    <span style={{fontSize: "2.3rem"}}>{Object.keys(tx.tx_type)[0]}</span>
    <span> {tx.tx_hash}</span>
    <span>{Number(tx.amount)}</span>
    <span>{Number(tx.time)}</span>
  </div>
}

const Balance = ({setShowTx}: { setShowTx: Function }) => {
  const {principal, isAuth} = useAuth()
  const [balances, setBalance] = React.useState<bigint[]>([])
  useEffect(() => {
    if (principal && isAuth) {
      Promise.all([rootFeedApi.ckBTCBalance(principal), rootFeedApi.ghostBalance(principal), rootFeedApi.icpBalance(principal)]).then(e => {
        console.log(e)
        setBalance(e)
      })
    }
  }, [principal, isAuth])

  return <div className={"balance"}>
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
    <Token token={"ICP"} balance={Number(balances[0])} filePath={"/img_6.png"} setShowTx={setShowTx}/>
    {/*<Token token={"ckBTC"} balance={Number(balances[1])} filePath={"/img_4.png"}/>*/}
    {/*<Token token={"ghost"} balance={Number(balances[2])} filePath={"/img_5.png"}/>*/}
  </div>
}

const Token = ({filePath, balance, token, setShowTx}: {
  filePath: string,
  balance: number,
  token: string,
  setShowTx: Function
}) => {
  const [openReceive, setOpenReceive] = React.useState(false)
  const [openSend, setOpenSend] = React.useState(false)
  const {account} = useAuth()

  return <div className={"token_item"}>
    <Receive address={account ?? ""} open={openReceive} setOpen={setOpenReceive}/>
    <Send open={openSend} setOpen={setOpenSend}/>
    <img src={filePath} alt=""/>
    <span style={{flex: "1"}}>{balance}</span>
    <span style={{flex: "1"}}>
      <span className={"record_wrap"} onClick={() => setShowTx(true)}>
        <Icon name={"record"}/>
      </span>
    </span>
    <div style={{display: "flex", alignItems: "center", gap: "2rem", width: "40%"}}>
      <span className={"receive"} onClick={() => {
        if (token === "ICP")
          setOpenReceive(true)
      }}>Receive</span>
      <span className={"send"} onClick={() => setOpenSend(true)}>Send</span>
    </div>
  </div>
}
