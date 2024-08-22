import "./index.scss"

import React from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {shortenString} from "../../Sider";

export const Receive = ({open, setOpen, address}: { open: boolean, setOpen: Function, address: string }) => {
  return <Modal setOpen={setOpen} open={open}>
    <div className={"receive_modal"}>
      <div className={"title"}>
        <Icon name={"right"}/>
        Receive
      </div>

      <div className={"token"}>
        ICP
      </div>

      <div className={"wallet"}>
        Wallet Address
        <div className={"address"}>
          {shortenString(address, 40)}
          <Icon name={"copy"}/>
        </div>
      </div>

      <div className={"done_button"}>
        Done
      </div>
    </div>
  </Modal>
}
