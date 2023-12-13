import React from 'react';
import {
  Form,
} from 'antd';
import Feed from "../../actors/feed";
import {EditModal} from "./EditModal";
import {Principal} from "@dfinity/principal";
import {useLocation} from "react-router-dom";

export function CommentForm(props: { postId: string, setOpen: Function, userFeedCai: Principal, setData: Function }) {
  const [form] = Form.useForm();
  const {userFeedCai, setData} = props
  const {pathname} = useLocation()

  const onFinish = async (values: { title: string, content: string }) => {
    const feedApi = new Feed(userFeedCai)
    await feedApi.createComment(props.postId, values.content)
    await feedApi.getAllPost()
    if (pathname.includes("profile")) {
      await feedApi.getAllPost()
    } else if (pathname.includes("home")) {
      await feedApi.getLatestFeed(20)
    } else {
      const newPost = await feedApi.getPost(props.postId)
      if (!newPost[0]) return
      setData(newPost[0])
    }
    form.resetFields()
    props.setOpen(false)
  };

  return (
    <EditModal form={form} onFinish={onFinish}/>
  );
};
