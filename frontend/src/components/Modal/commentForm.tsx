import React from 'react';
import {
  Form,notification
} from 'antd';
import Feed from "../../actors/feed";
import {EditModal} from "./EditModal";
import { LoadingOutlined, CheckOutlined ,CloseOutlined} from '@ant-design/icons';
import {useLocation} from "react-router-dom";
import {Principal} from "@dfinity/principal";

export function CommentForm(props: { postId: string, setOpen: Function, userFeedCai: Principal, setData: Function }) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const {pathname} = useLocation()
  const {userFeedCai, setData} = props

  const onFinish = async (values: { title: string, content: string }) => {
    const feedApi = new Feed(userFeedCai)
    api.info({
      message: 'Create Comment ing ...',
      key: 'createComment',
      duration: null,
      description: '',
      icon: <LoadingOutlined />
    });
    try {
      await feedApi.createComment(props.postId, values.content)
      if (pathname.includes("profile")) {
        await feedApi.getAllPost()
      } else if (pathname.includes("home")) {
        await feedApi.getLatestFeed(20)
      } else {
        const newPost = await feedApi.getPost(props.postId)
        if (!newPost[0]) return
        setData(newPost[0])
      }
      api.success({
        message: 'Create Comment Successful !',
        key: 'createComment',
        description: '',
        icon: <CheckOutlined />
      })
    }catch (e) {
      api.error({
        message: 'Create Comment Failed !',
        key: 'createComment',
        description: '',
        icon: <CloseOutlined />
      })
    }
    await feedApi.getAllPost()
    form.resetFields()
    props.setOpen(false)
  };

  return (
    <>
      {contextHolder}
      <EditModal form={form} onFinish={onFinish}/>
    </>
  );
};
