import React, {useEffect, useState} from "react";
import {Layout, Spin, Flex} from "antd";
import Post from "../components/post";
import {Comments} from "../components/comment";
import {PostImmutable} from "../declarations/feed/feed";
import {Profile} from '../declarations/user/user';
import {userApi} from '../actors/user';

export const Content = React.memo((props: { contents?: PostImmutable[] }) => {
  const {contents} = props
  const [postItem, setPostItem] = useState<PostImmutable>()
  const [userProfileArray, setUserProfileArray] = useState<Profile[]>();
  const [onLoading, setOnloading] = useState(true);
  const [commentProfiles, setCommentProfiles] = useState<Profile[]>()
  const [commentLoading, setCommentLoading] = useState(true)

  const getAllUserProfile = async () => {
    if (!contents) return setUserProfileArray([])
    const userPrincipalArray = contents.map(v => v.user)
    const result = await userApi.batchGetProfile(userPrincipalArray)
    setUserProfileArray(result)
    setOnloading(false)
  }

  useEffect(() => {
    getAllUserProfile()
  }, [contents]);

  const getAllCommentProfiles = async () => {
    if (!postItem) return setCommentProfiles([])
    const comments = postItem.comment
    const allIds = comments.map(v => v.user)
    const result = await userApi.batchGetProfile(allIds);
    setCommentProfiles(result)
    setCommentLoading(false)
  }

  useEffect(() => {
    getAllCommentProfiles()
  }, [postItem])

  return <>
    <Layout.Content className={"posts"} style={{
      backgroundColor: "white",
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      width: '200px',
      borderRight: '1px solid rgba(0,0,0,0.2)',
      padding: "40px 20px"
    }}>
      {onLoading && <Flex align="center" justify="center">
        <Spin size="large"/>
      </Flex>}
      {!onLoading && contents && contents.map((v, k) => {
        return <Post setPostItem={setPostItem} content={v} key={k}
                     avatar={userProfileArray?.[k] ? userProfileArray[k].avatarUrl : ""}
                     name={userProfileArray?.[k] ? userProfileArray[k].name : ""}/>
      })}
    </Layout.Content>
    <Layout.Content className={"posts"} style={{
      backgroundColor: 'white',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      padding: "40px 20px"
    }}>
      {postItem ? !commentLoading ? postItem.comment.map((v, k) => {
        return <Comments avatar={commentProfiles?.[k] ? commentProfiles [k]?.avatarUrl : ""}
                         name={commentProfiles?.[k] ? commentProfiles [k]?.name : ""}
                         content={v} key={k}/>
      }) : <Flex align="center" justify="center">
        <Spin size="large"/>
      </Flex> : <></>}
    </Layout.Content>
  </>

})
