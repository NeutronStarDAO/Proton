import "./index.scss"
import {Modal} from "../index";
import React, {useEffect, useState} from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Icon from "../../../Icons/Icon";
import {useAuth} from "../../../utils/useAuth";
import Feed from "../../../actors/feed";
import {useProfileStore} from "../../../redux";
import {shortenString} from "../../Sider";
import {Post} from "../../../declarations/feed/feed";
import {NotificationInstance} from "antd/es/notification/interface";
import {CheckOutlined, CloseOutlined, LoadingOutlined} from "@ant-design/icons";


export const CommentModal = ({
                               open,
                               setOpen,
                               updateFunction, post, api
                             }: { open: boolean, setOpen: Function, updateFunction: Function, post: Post, api: NotificationInstance }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [text, setText] = useState("")
  const profile = useProfileStore()

  const send = async () => {
    const feedApi = new Feed(post.feed_canister)
    api.info({
      message: 'sending ...',
      key: 'comment',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    });
    try {
      setOpen(false)
      await feedApi.createComment(post.post_id, text)
      updateFunction()
      api.success({
        message: 'Sent Successful !',
        key: 'comment',
        description: '',
        icon: <CheckOutlined/>
      })
    } catch (e) {
      api.error({
        message: 'Sent failed !',
        key: 'comment',
        description: '',
        icon: <CloseOutlined/>
      })
    }

  }

  return <Modal setOpen={setOpen} open={open} component={<div className={"comment_modal"}>
    <div className={"post_head"}>
      <div style={{display: "flex", alignItems: "center"}}>
        <img style={{borderRadius: "50%"}} src={profile.avatar_url ? profile.avatar_url : "./img_5.png"} alt=""/>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          <div className={"name"}>{profile.name}</div>
          <div className={"id"}>{shortenString(profile.id ? profile.id.toString() : "", 10)}</div>
        </div>
      </div>
      <div style={{cursor: "pointer"}} onClick={() => setOpen(false)}>❌</div>
    </div>
    <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"Post your reply"} name="" id=""
              cols={30} rows={10}/>
    <div className={"post_foot"}>
      <div className={"smile"} onClick={() => setIsVisible(!isVisible)}>
        <Icon name={"smile"}/>
      </div>
      <div className={"picker"} style={{display: isVisible ? "block" : "none"}}>
        <Picker onClickOutside={() => {
          if (isVisible) setIsVisible(false)
        }} previewPosition="none" date={data} onEmojiSelect={(e: any) => setText(text + e.native)}/>
      </div>
    </div>
    <div className={"button_wrap"}>
      <div className={"button"} onClick={send}>Send</div>
    </div>

  </div>}/>
}


