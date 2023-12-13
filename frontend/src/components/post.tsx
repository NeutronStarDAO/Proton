import {Avatar, message, Modal, Space, Typography} from "antd";
import {
  CommentOutlined,
  RedoOutlined,
  HeartOutlined
} from '@ant-design/icons';
import {PostImmutable} from "../declarations/feed/feed";
import {useAuth} from "../utils/useAuth";
import Feed from "../actors/feed";
import React, {useEffect, useState} from "react";
import {CommentForm} from "./Modal/commentForm";
import {useLocation, useNavigate} from "react-router-dom";

export default function Post(props: { content: PostImmutable, setPostItem?: Function, avatar?: string, name?: string }) {
  const {content, setPostItem} = props
  const {isAuth} = useAuth()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<any>()
  const {pathname} = useLocation()

  useEffect(() => {
    setData(content)
  }, [content])

  const navigate = useNavigate();

  const feedApi = React.useMemo(() => {
    return new Feed(content.feedCanister)
  }, [])

  const tip = () => message.warning("please login first")

  const update = async () => {
    if (!isAuth) return tip()
    if (pathname.includes("profile")) {
      await feedApi.getAllPost()
    } else if (pathname.includes("home")) {
      await feedApi.getLatestFeed(20)
    } else {
      const newPost = await feedApi.getPost(data.postId)
      if (!newPost[0]) return
      setData(newPost[0])
    }
  }

  const repost = async () => {
    if (!isAuth) return tip()
    await feedApi.createRepost(data.postId)
    update().then()
  }

  const like = async () => {
    if (!isAuth) return tip()
    await feedApi.createLike(data.postId)
    update().then()
  }

  return (
    <div className={"content"} style={{
      padding: "12px",
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: "20px",
      marginBottom: "20px",
    }}>
      <div style={{
        cursor: "pointer"
      }} onClick={() => setPostItem?.(data)}>
        <Space>
          <Avatar
            onClick={() => navigate(`/profile/${content.user.toString()}`)}
            size={32}
            src={props.avatar ? props.avatar : "https://avatars.githubusercontent.com/u/120618331?s=200&v=4"}
            style={{
              border: '1px solid #D3D540',
            }}
          />
          <p>{props.name ? props.name : 'NeutronStarDAO'}</p>
        </Space>
        <Typography.Paragraph style={{
          paddingLeft: '12px'
        }}>
          {data?.content}
        </Typography.Paragraph>
      </div>
      <Space
        size={140}
        style={{
          paddingLeft: '25px'
        }}
      >
        <Modal
          title="Edit"
          open={open}
          footer={null}
          onCancel={() => setOpen(false)}
        >
          <CommentForm setData={setData} userFeedCai={content.feedCanister} postId={data?.postId} setOpen={setOpen}/>
        </Modal>
        <div style={{cursor: "pointer"}} onClick={() => {
          if (!isAuth) return tip()
          setOpen(true)
        }}>
          <CommentOutlined/> &nbsp;
          {data?.comment.length}
        </div>
        <div style={{cursor: "pointer"}} onClick={repost}>
          <RedoOutlined/>
          &nbsp;
          {data?.repost.length}
        </div>
        <div style={{cursor: "pointer"}} onClick={like}>
          <HeartOutlined/>&nbsp;
          {data?.like.length}
        </div>
      </Space>
    </div>
  );
}
