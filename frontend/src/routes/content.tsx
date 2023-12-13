import React, {useEffect, useState} from "react";
import {Layout, Spin, Flex} from "antd";
import Post from "../components/post";
import {Comments} from "../components/comment";
import {Like, PostId, PostImmutable, Repost, Time, UserId} from "../declarations/feed/feed";
import {Profile} from '../declarations/user/user';
import { userApi } from '../actors/user';
import { Principal } from "@dfinity/principal";

export const Content = React.memo((props: { contents?: PostImmutable[] }) => {
  const {contents} = props
  const [postItem, setPostItem] = useState<PostImmutable>()
  const [userProfileArray, setUserProfileArray] = useState<Profile[]>();
  const [onLoading, setOnloading] = useState(false);

  useEffect(() => {
    const initUserProfileArray = async () => {
      if(contents !== undefined) {
        const userPrincipalArray = (Array.from(contents!.reduce((uniqueUsers, value) => {
          uniqueUsers.add(value.user.toString());
          return uniqueUsers;
        }, new Set<string>()))).map(value => Principal.fromText(value));
        if(userPrincipalArray !== undefined && userPrincipalArray?.length > 0) {
          const result = await userApi.batchGetProfile(userPrincipalArray!);
          setUserProfileArray(result)
          setOnloading(true)
        }
      }
    };
    initUserProfileArray()
  }, [contents]);

  if(onLoading) {
    return <>
      <Layout.Content className={"posts"} style={{
        backgroundColor: "white",
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        width: '200px',
        borderRight: '1px solid rgba(0,0,0,0.2)',
        padding: "40px 20px"
      }}>
        {contents && contents.map((v, k) => {
          const _userProfile = userProfileArray?.find(item => {
            return item.id.toString() === v.user.toString()
          });
          return <Post setPostItem={setPostItem} content={v} key={k} avatar={_userProfile?.avatarUrl} name={_userProfile?.name}/>
        })}
      </Layout.Content>
      <Layout.Content className={"posts"} style={{
        backgroundColor: 'white',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        padding: "40px 20px"
      }}>
        {postItem && postItem.comment.map((v, k) => {
          return <Comments content={v} key={k}/>
        })}
      </Layout.Content>
    </>
  } else {
    return <>
      <Layout.Content className={"posts"} style={{
        backgroundColor: "white",
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        width: '200px',
        borderRight: '1px solid rgba(0,0,0,0.2)',
        padding: "40px 20px"
      }}>
        <Flex align="center" justify="center">
          <Spin size="large" />
        </Flex>
      </Layout.Content>
      <Layout.Content className={"posts"} style={{
        backgroundColor: 'white',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        padding: "40px 20px"
      }}>
      </Layout.Content>
    </>
  }

})
