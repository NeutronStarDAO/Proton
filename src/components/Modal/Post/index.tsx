import "./index.scss"
import {Modal} from "../index";
import React, {useEffect, useState} from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Icon from "../../../Icons/Icon";
import {FileRejection, useDropzone} from "react-dropzone";
import {aApi} from "../../../actors/photo_storage";
import {useAuth} from "../../../utils/useAuth";
import Feed from "../../../actors/feed";


export const PostModal = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const {userFeedCai} = useAuth()

  const send = async () => {
    if (!userFeedCai) return 0
    console.log(text)
    console.log(files)
    const urls = await aApi.upload_photo(files)
    const feedApi = new Feed(userFeedCai)
    const res = await feedApi.createPost(text, urls)
    console.log("id", res)
    setOpen(false)
  }

  return <Modal setOpen={setOpen} open={open} component={<div className={"post_modal"}>
    <div className={"post_head"}>
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="img_5.png" alt=""/>
        <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
          <div className={"name"}>Nash</div>
          <div className={"id"}>@nash.icp</div>
        </div>
      </div>
      <div style={{cursor: "pointer"}} onClick={() => setOpen(false)}>❌</div>
    </div>
    <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"What’s happening?"} name="" id=""
              cols={30} rows={10}/>
    <div className={"post_foot"}>
      <SelectPhoto setFiles={setFiles}/>
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

export const maxSize = 2 * 1024 * 1024//2MB
const SelectPhoto = ({setFiles}: { setFiles: Function }) => {

  const onDrop = React.useCallback((files: File[]) => {
    // const new_files: File[] = []
    // files.forEach((v, k) => {
    //   if (v.size < maxSize) new_files.push(v)
    // })
    setFiles(files)
  }, [])

  const {getRootProps, getInputProps} = useDropzone({
    onDrop, multiple: true, accept: {
      'image/jpeg': [],
      'image/png': []
    }, maxSize
  })

  return <div style={{height: "2.9rem"}}>
    <div{...getRootProps()}>
      <input {...getInputProps()} />
      <Icon name={"picture"}/>
    </div>
  </div>
}
