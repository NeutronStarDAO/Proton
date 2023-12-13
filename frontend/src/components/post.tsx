import {Avatar, message, Modal, Space, Typography} from "antd";
import {
  CommentOutlined,
  RedoOutlined,
  HeartOutlined
} from '@ant-design/icons';
import {PostImmutable} from "../declarations/feed/feed";
import {useAuth} from "../utils/useAuth";
import Feed from "../actors/feed";
import React, {useState} from "react";
import {CommentForm} from "./Modal/commentForm";

export default function Post(props: { content: PostImmutable, setPostItem?: Function, avatar?: string, name?: string}) {
  const {content, setPostItem} = props
  const {userFeedCai} = useAuth()
  const [open, setOpen] = useState(false)

  const feedApi = React.useMemo(() => {
    if (!userFeedCai) return undefined
    return new Feed(userFeedCai)
  }, [userFeedCai])

  const tip = () => message.warning("please login first")

  const update = async () => {
    if (!feedApi) return tip()
    await feedApi.getAllPost()
  }

  const repost = async () => {
    if (!feedApi) return tip()
    await feedApi.createRepost(content.postId)
    update().then()
  }

  const like = async () => {
    if (!feedApi) return tip()
    await feedApi.createLike(content.postId)
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
      }} onClick={() => setPostItem?.(content)}>
        <Space>
          <Avatar
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
          {content.content}
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
          <CommentForm postId={content.postId} setOpen={setOpen}/>
        </Modal>
        <div style={{cursor: "pointer"}} onClick={() => {
          if (!feedApi) return tip()
          setOpen(true)
        }}>
          <CommentOutlined/> &nbsp;
          {content.comment.length}
        </div>
        <div style={{cursor: "pointer"}} onClick={repost}>
          <RedoOutlined/>
          &nbsp;
          {content.repost.length}
        </div>
        <div style={{cursor: "pointer"}} onClick={like}>
          <HeartOutlined/>&nbsp;
          {content.like.length}
        </div>
      </Space>
    </div>
  );
}
