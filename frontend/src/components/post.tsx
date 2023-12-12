import {Card, Avatar, Divider, Space, Typography} from "antd";
import {
  CommentOutlined,
  RedoOutlined,
  HeartOutlined
} from '@ant-design/icons';
import {PostImmutable} from "../declarations/feed/feed";
import {useAuth} from "../utils/useAuth";
import Feed from "../actors/feed";
import React, {useState} from "react";

export default function Post(props: { content: PostImmutable, setPostItem?: Function }) {
  const {content: data, setPostItem} = props
  const {userFeedCai} = useAuth()
  const [content, setContent] = useState(data)

  const feedApi = React.useMemo(() => {
    if (!userFeedCai) return undefined
    return new Feed(userFeedCai)
  }, [userFeedCai])

  const update = async () => {
    if (!feedApi) return
    const updateData = await feedApi.getPost(content.postId)
    console.log("updateData", updateData)
    if (!updateData[0]) return
    setContent(updateData[0])
  }

  const repost = async () => {
    if (!feedApi) return
    await feedApi.createRepost(content.postId)
    update().then()
  }

  const like = async () => {
    if (!feedApi) return
    await feedApi.createLike(content.postId)
    update().then()
  }

  return (
    <div className={"content"} style={{
      padding: "12px",
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: "20px",
      marginBottom: "20px",
      cursor: "pointer"
    }} onClick={() => setPostItem?.(content)}>
      {/*<Divider/>*/}
      <Space>
        <Avatar
          size={32}
          src="https://avatars.githubusercontent.com/u/120618331?s=200&v=4"
          style={{
            border: '1px solid #D3D540',
          }}
        />
        <p>NeutronStarDAO</p>
      </Space>
      <Typography.Paragraph style={{
        paddingLeft: '12px'
      }}>
        {content.content}
      </Typography.Paragraph>
      <Space
        size={140}
        style={{
          paddingLeft: '25px'
        }}
      >
        <div style={{cursor: "pointer"}}>
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
