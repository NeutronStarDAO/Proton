import React from "react";
import {Layout} from "antd";
import Post from "../components/post";
import Comment from "../components/comment";
import {PostImmutable} from "../declarations/feed/feed";

export const Content = React.memo((props:{content:PostImmutable[]})=>{
  return <>
    <Layout.Content className={"posts"} style={{
      backgroundColor: "white",
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      width: '200px',
      borderRight: '1px solid rgba(0,0,0,0.2)',
      padding:"40px 20px"
    }}>
      <Post/>
      <Post/>
      <Post/>
      <Post/>
      <Post/>
      <Post/>
      <Post/>
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
