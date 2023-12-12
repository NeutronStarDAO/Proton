import React from "react";
import {Layout} from "antd";
import Post from "../components/post";
import Comment from "../components/comment";
import {Like, PostId, PostImmutable, Repost, Time, UserId} from "../declarations/feed/feed";

export const Content = React.memo((props: { contents: PostImmutable[] }) => {
  const {contents} = props
  return <>
    <Layout.Content className={"posts"} style={{
      backgroundColor: "white",
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      width: '200px',
      borderRight: '1px solid rgba(0,0,0,0.2)',
      padding: "40px 20px"
    }}>
      {contents.map((v, k) => {
        return <Post content={v} key={k}/>
      })}
    </Layout.Content>
    {/*<Layout.Content className={"posts"} style={{*/}
    {/*  backgroundColor: 'white',*/}
    {/*  overflowY: 'auto',*/}
    {/*  scrollbarWidth: 'thin',*/}
    {/*  padding:"40px 20px"*/}
    {/*}}>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*  <Comment/>*/}
    {/*</Layout.Content>*/}
  </>
})
