import "./index.scss"

import React, {useEffect, useState} from 'react';
import Icon, {Name} from "../../Icons/Icon";
import {useLocation, useNavigate} from "react-router-dom";
import {Post as postType} from "../../declarations/feed/feed";
import {Spin, Empty, Tooltip, notification} from "antd";
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {rootPostApi} from "../../actors/root_bucket";
import Bucket from "../../actors/bucket";
import {useAllDataStore} from "../../redux";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {shortenString} from "../Sider";
import {CommentModal} from "../Modal/Comment";
import {CheckOutlined, CloseOutlined, LoadingOutlined} from "@ant-design/icons";
import {updateSelectPost} from "../../redux/features/SelectPost";

export const Main = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState<postType[]>()
  const {userFeedCai, isAuth} = useAuth()
  const {allPost, allFeed} = useAllDataStore()

  const HomeData = React.useMemo(() => {
    if (!allFeed || !allPost) return undefined
    return [...allFeed, ...allPost]
  }, [allFeed, allPost])

  const change = () => {
    if (isAuth === false)
      navigate("/explore")
  }

  const Title = React.useMemo(() => {
    if (location.pathname === "/explore") return "Explore"
    return "Home"
  }, [location])

  useEffect(() => {
    !isAuth && change()
  }, [isAuth, Title])


  const getHomeData = async () => {
    if (!userFeedCai) return 0
    const feedApi = new Feed(userFeedCai)
    await Promise.all([feedApi.getAllPost(), feedApi.getLatestFeed(20)])
  }

  const getExploreData = async () => {
    const bucket = await rootPostApi.getAvailableBucket()
    if (bucket.length === 0) return setData([])
    const bucketApi = new Bucket(bucket[0])
    const res = await bucketApi.getLatestFeed(30)
    setData(res)
  }

  useEffect(() => {
    if (Title == "Home") {
      getHomeData()
    } else {
      getExploreData()
    }
  }, [Title, userFeedCai])

  if (Title === "Explore") {
    return <div className={"main_wrap scroll_main"}>
      <div className={"title"}>{Title}</div>
      {data ? data.length === 0 ? <Empty style={{width: "100%"}}/>
        : data.map((v, k) => {
          return <Post updateFunction={getExploreData} post={v}/>
        }) : <Spin spinning={true} style={{width: "100%"}}/>}
    </div>
  }

  return <div className={"main_wrap scroll_main"}>
    <div className={"title"}>{Title}</div>
    {HomeData ? HomeData.length === 0 ? <Empty style={{width: "100%"}}/>
      : HomeData.map((v, k) => {
        return <Post updateFunction={getHomeData} post={v}/>
      }) : <Spin spinning={true} style={{width: "100%"}}/>}
  </div>
}

export const Post = ({post, updateFunction}: { post: postType, updateFunction: Function }) => {
  const [profile, setProfile] = useState<Profile>()
  const principal = post.user
  const [hoverOne, setHoverOne] = useState(-1)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const {userFeedCai} = useAuth()
  const [api, contextHolder] = notification.useNotification();


  const getProfile = async () => {
    const res = await userApi.getProfile(principal)
    setProfile(res)
  }
  useEffect(() => {
    getProfile()
  }, [principal])

  const kk = [{label: "like", hoverColor: "rgba(249,24,128,0.6)"}, {
    label: "comment",
    hoverColor: "#1C9BEF"
  }, {label: "repost", hoverColor: "rgb(0,186,124,0.6)"}]


  const handleClick = async (index: number) => {
    if (!userFeedCai) return 0
    const feedApi = new Feed(userFeedCai)

    if (index === 1) {
      setOpen(true)
      return
    }
    api.info({
      message: 'processing ...',
      key: 'post_op',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    });
    try {
      if (index === 0) {//like
        await feedApi.createLike(post.post_id)
      } else if (index === 2) {//repost
        await feedApi.createRepost(post.post_id)
      }
      updateFunction()
      api.success({
        message: 'Successful !',
        key: 'post_op',
        description: '',
        icon: <CheckOutlined/>
      })
    } catch (e) {
      api.error({
        message: 'failed !',
        key: 'post_op',
        description: '',
        icon: <CloseOutlined/>
      })
    }
  }

  return <div className={"post_main"} onClick={() => {
    updateSelectPost(post)
  }
  }>
    {contextHolder}
    <CommentModal api={api} post={post} updateFunction={updateFunction} setOpen={setOpen} open={open}/>
    <div className={"author"}>
      <Tooltip title={profile?.name}>
        <img style={{borderRadius: "50%"}} className={"avatar"}
             onClick={(e) => {
               e.stopPropagation()
               navigate(`/profile/${principal.toString()}`)
             }}
             src={profile?.avatar_url ? profile.avatar_url : "./img_3.png"} alt=""/>
      </Tooltip>
      <div style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center"}}>
        <div style={{fontSize: "2rem"}}>{profile?.name}</div>
        <div style={{
          fontSize: "2rem",
          color: "rgba(0,0,0,0.5)"
        }}>{profile ? shortenString(profile.id.toString(), 10) : ""}</div>
      </div>
    </div>
    <div className={"tweet"}>
      {post.content}
      <div className={"img_list"}>
        {post.photo_url.map((v, k) => {
          return <img key={k} src={v} alt=""/>
        })}
      </div>
    </div>
    <div className={"post_bottom"}>
      {kk.map((v, k) => {
        return <span onClick={(e) => {
          e.stopPropagation()
          handleClick(k)
        }} style={{color: hoverOne === k ? v.hoverColor : ""}} key={k}
                     onMouseEnter={e => setHoverOne(k)}
                     onMouseLeave={e => setHoverOne(-1)}>
      <Icon color={hoverOne === k ? v.hoverColor : "black"} name={v.label as Name}/>
          {post[v.label as "like" | "comment" | "repost"].length}
      </span>
      })}
    </div>
  </div>
}
