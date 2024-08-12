import "./index.scss"
import {Modal} from "../index";
import React, {useEffect, useRef, useState} from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Icon from "../../../Icons/Icon";
import {useDropzone} from "react-dropzone";
import {aApi} from "../../../actors/photo_storage";
import {useAuth} from "../../../utils/useAuth";
import Feed from "../../../actors/feed";
import {useProfileStore} from "../../../redux";
import {shortenString} from "../../Sider";
import {message, notification} from "antd";
import {CheckOutlined, CloseOutlined, LoadingOutlined} from "@ant-design/icons";
import {getBase64} from "../../../utils/util";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";

export const PostModal = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [img, setImg] = useState<string[]>([])
  const profile = useProfileStore()
  const textareaRef = useRef(null);
  const {userFeedCai, principal} = useAuth()
  const [api, contextHolder] = notification.useNotification();
  const ref = useRef(null)
  const [canSend, setCanSend] = useState(false)
  const [hoverOne, setHoverOne] = useState(-1)

  const {contextSafe} = useGSAP({scope: ref})

  const sendAnimate = contextSafe(() => {
    if (!ref.current) return
    const button: any = ref.current
    const getVar = (variable: any) => getComputedStyle(button).getPropertyValue(variable);
    if (!button.classList.contains('active')) {
      button.classList.add('active');
      gsap.to(button, {
        keyframes: [{
          '--left-wing-first-x': 50,
          '--left-wing-first-y': 100,
          '--right-wing-second-x': 50,
          '--right-wing-second-y': 100,
          duration: .2,
          onComplete() {
            gsap.set(button, {
              '--left-wing-first-y': 0,
              '--left-wing-second-x': 40,
              '--left-wing-second-y': 100,
              '--left-wing-third-x': 0,
              '--left-wing-third-y': 100,
              '--left-body-third-x': 40,
              '--right-wing-first-x': 50,
              '--right-wing-first-y': 0,
              '--right-wing-second-x': 60,
              '--right-wing-second-y': 100,
              '--right-wing-third-x': 100,
              '--right-wing-third-y': 100,
              '--right-body-third-x': 60
            })
          }
        }, {
          '--left-wing-third-x': 20,
          '--left-wing-third-y': 90,
          '--left-wing-second-y': 90,
          '--left-body-third-y': 90,
          '--right-wing-third-x': 80,
          '--right-wing-third-y': 90,
          '--right-body-third-y': 90,
          '--right-wing-second-y': 90,
          duration: .2
        }, {
          '--rotate': 50,
          '--left-wing-third-y': 95,
          '--left-wing-third-x': 27,
          '--right-body-third-x': 45,
          '--right-wing-second-x': 45,
          '--right-wing-third-x': 60,
          '--right-wing-third-y': 83,
          duration: .25
        }, {
          '--rotate': 60,
          '--plane-x': -8,
          '--plane-y': 40,
          duration: .2
        }, {
          '--rotate': 40,
          '--plane-x': 45,
          '--plane-y': -300,
          '--plane-opacity': 0,
          duration: .375,
          onComplete() {
            setTimeout(() => {
              button.removeAttribute('style');
              gsap.fromTo(button, {
                opacity: 0,
                y: -8
              }, {
                opacity: 1,
                y: 0,
                clearProps: true,
                duration: .3,
                onComplete() {
                  button.classList.remove('active');
                }
              })
              setOpen(false)
            }, 1800)
          }
        }]
      })

      gsap.to(button, {
        keyframes: [{
          '--text-opacity': 0,
          '--border-radius': 0,
          '--left-wing-background': getVar('--primary-dark'),
          '--right-wing-background': getVar('--primary-dark'),
          duration: .11
        }, {
          '--left-wing-background': getVar('--primary'),
          '--right-wing-background': getVar('--primary'),
          duration: .14
        }, {
          '--left-body-background': getVar('--primary-dark'),
          '--right-body-background': getVar('--primary-darkest'),
          duration: .25,
          delay: .1
        }, {
          '--trails-stroke': 171,
          duration: .22,
          delay: .22
        }, {
          '--success-opacity': 1,
          '--success-x': 0,
          duration: .2,
          delay: .15
        }, {
          '--success-stroke': 0,
          duration: .15
        }]
      })
    }
  })

  const updateData = async () => {
    if (!userFeedCai || !principal) return 0
    const feedApi = new Feed(userFeedCai)
    await Promise.all([feedApi.getAllPost(principal), feedApi.getLatestFeed(principal, 20)])
  }

  const send = async () => {
    if (!userFeedCai) return 0
    if (text === "" && files.length === 0) return 0
    sendAnimate()
    console.log(text)
    console.log(files)
    try {
      const urls = await aApi.upload_photo(files)
      const feedApi = new Feed(userFeedCai)
      await feedApi.createPost(text, urls)
      updateData()
    } catch (e) {
      api.error({
        message: 'Create Post failed !',
        key: 'createPost',
        description: '',
        icon: <CloseOutlined/>
      })
    }
  }

  useEffect(() => {
    setText("")
    setFiles([])
    setIsVisible(false)
  }, [open])

  const getBase64Img = async () => {
    if (files.length === 0) {
      setImg([])
      return
    }
    const allPromises = files.map(v => getBase64(v))
    const res = await Promise.all(allPromises)

    setImg(res)
  }

  useEffect(() => {
    getBase64Img()
  }, [files])

  useEffect(() => {
    if (text.length > 0 || files.length > 0) {
      setCanSend(true)
    } else {
      setCanSend(false)
    }
  }, [text, files]);

  useEffect(() => {
    try {
      adjustTextareaRows();
    } catch (e) {
      console.log(e)
    }
  }, [text]);

  const adjustTextareaRows = () => {
    const textarea = textareaRef.current as any;
    if (textarea === null) return 0
    const baseConstn = 192 // 1920的设计稿 / 基数10
    const nowWidth = document.documentElement.clientWidth
    const nowCount = nowWidth / baseConstn
    const lineHeight = 2.8 * nowCount; // 假设每行高度为 24px，可以根据你的样式调整
    const padding = 0 // 假设上下内边距总和为 12px，可以根据你的样式调整

    // if (textarea.rows >= 10) return
    textarea.rows = 1;
    // 计算新的行数
    const newHeight = textarea.scrollHeight - padding;
    textarea.rows = Math.ceil(newHeight / lineHeight);
  };

  const deletePhoto = React.useCallback((index: number) => {
    const newFiles = files.filter((_, k) => k !== index)
    setFiles(newFiles)
  }, [files])

  return <>
    {contextHolder}
    <Modal canClose={true} setOpen={setOpen} open={open}>
      <div className={"post_modal"}>
        <div className={"post_head"}>
          <div style={{display: "flex", alignItems: "center"}}>
            <img style={{borderRadius: "50%", objectFit: "cover"}}
                 src={profile?.avatar_url ? profile.avatar_url : "/img_3.png"} alt=""/>
            <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
              <div className={"name"}>{profile?.name}</div>
              <div className={"id"}>{shortenString(profile.handle ?? "", 10)}</div>
            </div>
          </div>
        </div>
        <div className={"post_body"}>
         <textarea style={{height: img.length > 0 ? "auto" : "15rem"}} ref={textareaRef} value={text}
                   onChange={(e) => setText(e.target.value)}
                   placeholder={"What’s happening?"}
                   name=""
                   id="post_area"
                   cols={30}/>
          {img.length > 0 &&
            <div className={"post_img"} style={{gridTemplateColumns: img.length === 1 ? "1fr" : "repeat(2, 1fr)"}}>
              {img.map((v, k) => {
                return <div key={k} onMouseEnter={() => setHoverOne(k)} onMouseLeave={() => setHoverOne(-1)}>
                  <img src={v} alt=""/>
                  <span onClick={() => deletePhoto(k)} style={{display: hoverOne === k ? "flex" : "none"}}>
                    <Icon name={"deletePhoto"}/>
                  </span>
                </div>
              })}
            </div>}
        </div>
        <div className={"post_foot"}>
          <SelectPhoto setFiles={setFiles}/>
          <div className={"smile"} onClick={() => setIsVisible(!isVisible)}>
            <Icon name={"smile"}/>
          </div>
          <div className={"picker"} style={{display: isVisible ? "block" : "none"}}>
            <Picker navPosition={"top"} theme={"light"} searchPosition={"none"} skinTonePosition={"none"}
                    onClickOutside={() => {
                      if (isVisible) setIsVisible(false)
                    }} previewPosition="none" date={data}
                    onEmojiSelect={(e: any) => setText(text + e.native)}/>
          </div>
        </div>
        <div className={"button_wrap"}>
          {canSend ?
            <>
              <button ref={ref} className="button" onClick={send}>
                <span style={{color: "#4F67EB"}}>Send</span>
                <span className="success">
          <svg viewBox="0 0 13 13">
            <polyline points="3.75 9 7 12 13 5"></polyline>
          </svg>
              Send
        </span>
                <svg className="trails" viewBox="0 0 33 64">
                  <path d="M26,4 C28,13.3333333 29,22.6666667 29,32 C29,41.3333333 28,50.6666667 26,60"></path>
                  <path d="M6,4 C8,13.3333333 9,22.6666667 9,32 C9,41.3333333 8,50.6666667 6,60"></path>
                </svg>
                <div className="plane">
                  <div className="left"></div>
                  <div className="right"></div>
                </div>
              </button>
            </> :
            <GrayButton/>
          }
        </div>

      </div>
    </Modal>
  </>
}

const GrayButton = React.memo(() => {
  return <div className={"gray_button"}>
    Send
  </div>
})

export const maxSize = 2 * 1024 * 1024 // 2MB
const SelectPhoto = ({setFiles}: { setFiles: Function }) => {

  const onDrop = React.useCallback((files: File[]) => {
    if (files.length > 4) return message.error("Select up to four images")

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
