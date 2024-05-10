import "./index.scss"

import React from "react"
import Icon from "../../Icons/Icon";

export const Wallet = () => {
  return <div className={"wallet_main"}>
    <div className={"title"}>Wallet</div>
    <Balance/>
    <Tx/>
  </div>
}

const Tx = () => {
  return <div className={"tx_main"}>
      <span style={{fontSize: "2.7rem", gap: "2rem", display: "flex", alignItems: "center"}}>
        Transactions
        <Icon name={"tx"}/>
        <img style={{width: "3rem"}} src="img_6.png" alt=""/>
      </span>

    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>
    <TxItem/>

  </div>
}

const TxItem = () => {
  return <div className={"tx_item"}>
    <Icon name={"receive"}/>
    <span style={{fontSize:"2.3rem"}}>Receive</span>
    <span> 0b07bdd4e1d5 ... d450992af</span>
    <span>+0.75</span>
    <span>Dec 1, 2023</span>
  </div>
}

const Balance = () => {
  return <div className={"balance"}>
      <span style={{fontSize: "2.7rem"}}>
        Balance
      </span>
    <Token/>
    <Token/>
    <Token/>
  </div>
}

const Token = () => {
  return <div className={"token_item"}>
    <img src="img_6.png" alt=""/>
    4357
    <div style={{display: "flex", alignItems: "center", gap: "2rem"}}>
      <span className={"receive"}>Receive</span>
      <span className={"send"}>Send</span>
    </div>
  </div>
}
