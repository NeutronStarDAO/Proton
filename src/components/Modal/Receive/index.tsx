import "./index.scss"

import React, {useEffect} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {shortenString} from "../../Sider";
import {Tooltip} from "antd";
import {useAuth} from "../../../utils/useAuth";

export const Receive = ({open, setOpen, account, principalId, token}: {
  open: boolean,
  setOpen: Function,
  account?: string,
  principalId: string, token: string
}) => {
  const [copied, setCopied] = React.useState(false)
  const {isDark} = useAuth()
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true)
    } catch (e) {
    }
  }

  useEffect(() => {
    setCopied(false)
  }, [open]);
  return <Modal setOpen={setOpen} open={open}>
    <div className={"receive_modal"}>
      <div className={`receive_title ${isDark ? "dark_receive_title" : ""}`}>
        <Icon name={"right"}/>
        Receive
      </div>

      <div className={`token ${isDark ? "dark_token" : ""}`}>
        {token}
      </div>

      <div style={{display: account ? "flex" : "none"}} className={"wallet"}>
        Account ID
        <Tooltip title={copied ? "copied!" : "copy"}>
          <div className={`address ${isDark ? "dark_address" : ""}`} onClick={() => copy(account ?? "")}>
            {shortenString(account ?? "", 40)}
            <Icon name={"copy"}/>
          </div>
        </Tooltip>
      </div>

      <div className={"wallet"}>
        Principal ID
        <Tooltip title={copied ? "copied!" : "copy"}>
          <div className={`address ${isDark ? "dark_address" : ""}`}
               onClick={() => copy(principalId ?? "")}>
            {shortenString(principalId ?? "", 40)}
            <Icon name={"copy"}/>
          </div>
        </Tooltip>
      </div>

      <div className={"done_button"} onClick={() => setOpen(false)}>
        Done
      </div>
    </div>
  </Modal>
}
