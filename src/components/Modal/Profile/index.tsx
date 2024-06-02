import "./index.scss"

import React, {ChangeEventHandler, MouseEventHandler, useState} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {useAuth} from "../../../utils/useAuth";
import {useDropzone} from "react-dropzone";
import {maxSize} from "../Post";
import {message} from "antd";
import {aApi} from "../../../actors/photo_storage";
import {userApi} from "../../../actors/user";
import {Principal} from "@dfinity/principal";
import {updateProfile} from "../../../redux";

type form_type = {
  ID?: string,
  Nam: string,
  Bio: string,
  Education: string,
  Company: string
}
export const ProfileModal = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
  const {principal, userFeedCai} = useAuth()
  const [backFile, setBackFile] = useState<File>()
  const [avatarFile, setAvatarFile] = useState<File>()
  const [form, setForm] = useState<form_type>({
    ID: principal?.toText(),
    Nam: "",
    Bio: "",
    Education: "",
    Company: ""
  })

  const onChange = (title: keyof form_type, e: any) => {
    const form_1 = form
    form_1[title] = e.target.value
    setForm(form_1)
  }

  const done = async () => {
    if (!principal || !userFeedCai) return 0
    const res = await aApi.upload_photo([backFile ?? new File([], ""), avatarFile ?? new File([], "")])
    await userApi.createProfile({
      id: principal,
      avatar_url: res[1],
      name: form.Nam,
      education: form.Education,
      biography: form.Bio,
      company: form.Company,
      feed_canister: [userFeedCai],
      back_img_url: res[0]
    })
    setOpen(false)
    const profile = await userApi.getProfile(principal)
    if (profile) updateProfile(profile)
  }


  return <Modal setOpen={setOpen} open={open} component={<div className={"login_modal"}>
    <div style={{display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
      <div className={"title"}>
        <Icon name={"edit"}/>
        Edit Profile
      </div>
      <div onClick={() => setOpen(false)} style={{cursor: "pointer"}}>❌</div>
    </div>
    <Background setBackFile={setBackFile}/>
    <div style={{width: "100%", display: "flex"}}>
      <Avatar setAvatarFile={setAvatarFile}/>
      <div style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem"}}>
        <InfoItem onchange={onChange} t={"ID"} value={principal?.toString()} flag={true}/>
        <InfoItem onchange={onChange} t={"Nam"} placeholder={"your name"} flag={true}/>
      </div>
    </div>
    <InfoItem onchange={onChange} t={"Bio"}
              placeholder={"your biography"}
              flag={false}/>
    <InfoItem onchange={onChange} t={"Education"} flag={false}/>
    <InfoItem onchange={onChange} t={"Company"} flag={false}/>
    <Done done={done}/>
  </div>}/>
}

const InfoItem = ({
                    t,
                    value,
                    flag,
                    placeholder, onchange
                  }: { t: keyof form_type, value?: string, flag: boolean, placeholder?: string, onchange: (arg0: keyof form_type, e: any) => void }) => {

  return <div className={"item_wrap"}
              style={{flexDirection: flag ? "row" : "column", alignItems: flag ? "center" : "start"}}>
    <div style={{fontWeight: "bold", width: "14%", display: "flex"}}>{t}</div>
    {t === "Bio" ? <textarea onChange={(e) => onchange(t, e)} placeholder={placeholder} name="" id=""></textarea> :
      <input onChange={(e) => onchange(t, e)} value={value} readOnly={!!value} placeholder={placeholder} type="text"/>
    }

  </div>
}


export const Done = ({done}: { done: MouseEventHandler<HTMLDivElement> }) => {
  return <div className={"done"} onClick={done}>
    Done
  </div>
}

const Avatar = ({setAvatarFile}: { setAvatarFile: Function }) => {
  const onDrop = React.useCallback((files: File[]) => {
    if (files.length === 0) {
      return message.warning("aaa")
    }
    setAvatarFile(files[0])
  }, [])

  const {getRootProps, getInputProps} = useDropzone({
    onDrop, multiple: true, accept: {
      'image/jpeg': [],
      'image/png': []
    }, maxSize, maxFiles: 1
  })

  return <div{...getRootProps()}>
    <input {...getInputProps()} />
    <div className={"avatar"}>
      <img src="./img_8.png" alt=""/>
    </div>
  </div>
}

const Background = ({setBackFile}: { setBackFile: Function }) => {
  const onDrop = React.useCallback((files: File[]) => {
    if (files.length === 0) {
      return message.warning("aaa")
    }
    setBackFile(files[0])
  }, [])

  const {getRootProps, getInputProps} = useDropzone({
    onDrop, multiple: true, accept: {
      'image/jpeg': [],
      'image/png': [],
    }, maxSize, maxFiles: 1
  })
  return <div className={"avatar_wrap"}>
    <div style={{width: "100%"}} {...getRootProps()}>
      <input {...getInputProps()} />
      <div className={"background"}>
        <img src="./img_8.png" alt=""/>
      </div>
    </div>
  </div>
}

