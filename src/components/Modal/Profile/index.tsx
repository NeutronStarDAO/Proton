import "./index.scss"

import React, {useEffect, useRef, useState} from "react"
import {Modal} from "../index";
import Icon, {Name} from "../../../Icons/Icon";
import {useAuth} from "../../../utils/useAuth";
import {useDropzone} from "react-dropzone";
import {maxSize} from "../Post";
import {message, notification} from "antd";
import {aApi} from "../../../actors/photo_storage";
import {userApi} from "../../../actors/user";
import {useProfileStore} from "../../../redux";
import {Profile} from "../../../declarations/user/user";
import {getBase64} from "../../../utils/util";
import {Done, UnDone} from "./Done";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {Dropdown} from "./Dropdown";

type form_type = {
  ID: string,
  Name: string,
  Bio: string,
  Location: string,
  Network: string
}
export const ProfileModal = ({open, setOpen, canClose}: { open: boolean, setOpen: Function, canClose: boolean }) => {
  const {principal, userFeedCai, isDark} = useAuth()
  const [backFile, setBackFile] = useState<File>()
  const [avatarFile, setAvatarFile] = useState<File>()
  const [api, contextHolder] = notification.useNotification();
  const profile = useProfileStore()
  const [index, setIndex] = useState(0)
  const [form1, setForm1] = useState<form_type>({
    ID: "",
    Name: "",
    Bio: "",
    Location: "",
    Network: "",
  })
  const [protocol, setProtocol] = useState("https://")

  const onChange = (title: keyof form_type, e: any) => {
    const newForm = {
      ...form1, [title]:
      e.target.value
    }
    setForm1(newForm);
  };

  useEffect(() => {
    if (form1.ID.length > 0) {
      const handler = setTimeout(() => {
        check().then()
      }, 1000); // 防抖延迟
      return () => {
        clearTimeout(handler);
      };
    } else setIndex(0)
  }, [form1.ID]);

  const check = async () => {
    const res = await userApi.is_handle_available(form1.ID[0] === "@" ? form1.ID : "@" + form1.ID)
    if (res) {
      setIndex(2)
    } else {
      if (profile.handle === (form1.ID[0] === "@" ? form1.ID : "@" + form1.ID)) setIndex(2)
      else setIndex(1)
    }
  }

  const done = async () => {
    if (!principal || !userFeedCai) return 0
    if (index !== 2) return 0
    try {
      const a_url = avatarFile ? await getBase64(avatarFile) : profile.avatar_url ? profile.avatar_url : ""
      const b_url = backFile ? await getBase64(backFile) : profile.back_img_url ? profile.back_img_url : ""
      const res = await aApi.upload_photo([backFile ?? new File([], ""), avatarFile ?? new File([], "")])
      const newProfile: Profile = {
        id: principal,
        avatar_url: res[1] ? res[1] : a_url ? a_url : "",
        name: form1.Name,
        location: form1.Location,
        biography: form1.Bio,
        website: form1.Network.length > 0 ? protocol + form1.Network : form1.Network,
        feed_canister: [userFeedCai],
        back_img_url: res[0] ? res[0] : b_url ? b_url : "",
        handle: profile.handle,
        created_at: []
      }
      if (canClose) {
        await userApi.updateProfile(newProfile)
        await userApi.update_handle(form1.ID[0] === "@" ? form1.ID : "@" + form1.ID)
      } else {
        await userApi.createProfile({
          ...newProfile,
          handle: form1.ID[0] === "@" ? form1.ID : "@" + form1.ID
        })
      }
    } catch (e) {
      console.log(e)
      api.error({message: "Error"})
    } finally {
      window.location.reload()
    }
  }

  useEffect(() => {
    let network = ""
    if (profile.website) {
      network = profile.website.split("://")[1]
      setProtocol(profile.website.split("://")[0] + "://")
    }
    const a = {
      ID: profile.handle ? profile.handle : "",
      Name: profile.name ? profile.name : "",
      Bio: profile.biography ? profile.biography : "",
      Location: profile.location ? profile.location : "",
      Network: network
    }
    setForm1(a)
  }, [open]);

  return <>
    {contextHolder}
    <Modal setOpen={setOpen} open={open} canClose={canClose}>

      <div className={`login_modal ${isDark ? "dark_login_modal" : ""}`}>
        <div style={{display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
          <div className={"title"}>
            <Icon name={"edit"}/>
            Edit Profile
          </div>
        </div>
        <Background setBackFile={setBackFile} profile={profile}/>
        <div className={"img_and_name_prof_mod"} style={{width: "100%", display: "flex"}}>
          <Avatar setAvatarFile={setAvatarFile} profile={profile}/>
          <div className={"img_and_name_prof_mod_div"} style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
            marginLeft: "2rem"
          }}>
            <InfoItem onchange={onChange} t={"ID"} index={index} value={form1.ID} flag={true}/>
            <InfoItem onchange={onChange} t={"Name"} value={form1.Name} placeholder={"Your name"} flag={true}/>
          </div>
        </div>
        <InfoItem onchange={onChange} t={"Bio"}
                  placeholder={"Your biography"} value={form1.Bio}
                  flag={false}/>
        <InfoItem onchange={onChange} protocol={protocol} setProtocol={setProtocol} t={"Network"} flag={false}
                  value={form1.Network}/>
        <InfoItem onchange={onChange} t={"Location"} flag={false} value={form1.Location}/>
        {index !== 2 || form1.Name.length <= 0 ? <UnDone/> : <Done done={done} setOpen={setOpen}/>}
      </div>
    </Modal>
  </>
}

const info = [
  {
    icon: "info",
    backgroundColor: "#BBD3FF",
    text: "Creating Globally Unique ID"
  },
  {
    icon: "red_info",
    backgroundColor: "#FFD6DD",
    text: "That ID has been taken"
  },
  {
    icon: "green_info",
    backgroundColor: "#A0F3B3",
    text: "This ID is available."
  }
]
const InfoItem = ({
                    t,
                    value,
                    flag,
                    placeholder, onchange, index, setProtocol, protocol
                  }: {
  t: keyof form_type,
  value?: string,
  flag: boolean,
  placeholder?: string, index?: number, setProtocol?: Function, protocol?: string
  onchange: (arg0: keyof form_type, e: any) => void
}) => {

  return <div className={"item_wrap"}
              style={{
                flexDirection: flag ? "row" : "column",
                alignItems: flag ? "center" : "start",
                position: "relative"
              }}>
    <div className={"id_and_name_prof_mod"}
         style={{fontWeight: "500", width: "14%", display: "flex", marginRight: "1rem"}}>
      <span
        style={{
          color: "#f87d7d",
          display: t === "ID" || t === "Name" ? "flex" : "none",
          alignItems: "center"
        }}>*
      </span>
      {t}
    </div>
    {(() => {
      if (t === "ID") {
        return (
          <>
            {<TipInfo index={index === undefined ? 0 : index}/>}
            <input
              onChange={(e) => onchange(t, e)}
              value={value}
              placeholder={placeholder}
              type="text"/>
          </>
        )
      }
      if (t === "Bio") return <textarea onChange={(e) => onchange(t, e)} value={value} placeholder={placeholder}
                                        name=""
                                        id=""/>
      if (t === "Network") return <div style={{display: "flex", width: "100%", alignItems: "center", gap: "1rem"}}>
        <Dropdown item={protocol} dropdownList={["https://", "http://"]} setItem={setProtocol}/>
        <input style={{border: "0.2rem solid rgb(214 195 255)", borderRadius: "1.5rem"}}
               onChange={(e) => onchange(t, e)}
               value={value} placeholder={placeholder}
               type="text"/>
      </div>
      return <input onChange={(e) => onchange(t, e)} value={value} placeholder={placeholder}
                    type="text"/>
    })()}
  </div>
}

const TipInfo = React.memo(({index}: { index: number }) => {
  const ref = useRef(null)
  const {contextSafe} = useGSAP({scope: ref})

  const enter = contextSafe(() => {
    gsap.to(ref.current, {backgroundColor: info[index].backgroundColor, duration: 0.2})
    gsap.to(".text", {autoAlpha: 1, duration: 0.2, display: "flex"})
  })

  const leave = contextSafe(() => {
    gsap.to(ref.current, {backgroundColor: "#E0E6F9", duration: 0.2})
    gsap.to(".text", {autoAlpha: 0, duration: 0.2, display: "none"})
  })

  return <div ref={ref} className={"info_tip"}>
    <span className={"text"}>{info[index].text}</span>
    <div style={{display: "flex", alignItems: "center"}} onMouseEnter={enter}
         onMouseLeave={leave}><Icon
      name={info[index].icon as Name}/></div>
  </div>
})


const Avatar = ({
                  setAvatarFile, profile
                }: {
  setAvatarFile: Function, profile
    :
    Profile
}) => {
  const [previewImg, setPreviewImg] = useState("")

  const onDrop = React.useCallback((files: File[]) => {
    if (files.length === 0) {
      return message.warning("aaa")
    }
    getBase64(files[0]).then(e => {
      setPreviewImg(e)
    })
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
      <img
        src={previewImg ? previewImg : ("avatar_url" in profile) && profile.avatar_url ? profile.avatar_url : "/img_8.png"}
        style={{
          height: !previewImg && !(("avatar_url" in profile) && profile.avatar_url) ? "50%" : "100%",
          width: !previewImg && !(("avatar_url" in profile) && profile.avatar_url) ? "50%" : "100%",
          borderRadius: "50%",
          objectFit: "cover"
        }} alt=""/>
    </div>
  </div>
}

const Background = ({
                      setBackFile, profile
                    }: {
  setBackFile: Function, profile
    :
    Profile
}) => {
  const [previewImg, setPreviewImg] = useState("")
  const onDrop = React.useCallback((files: File[]) => {
    if (files.length === 0) {
      return message.warning("File size is too large")
    }
    getBase64(files[0]).then(e => {
      setPreviewImg(e)
    })
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

      {previewImg || (("back_img_url" in profile) &&
        profile.back_img_url) ? <div className={"background"} style={{
          background: `rgba(0, 0, 0, 0.3) url(${previewImg ?
            previewImg : profile.back_img_url}) no-repeat center center `,
          backgroundSize: "cover"
        }}/>
        :
        <div className={"background"} style={{
          background: "rgba(0, 0, 0, 0.3) url(/img_8.png) no-repeat center center ",
        }}/>
      }
    </div>
  </div>
}

