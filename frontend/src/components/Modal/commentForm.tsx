import React from 'react';
import {
  Form, notification
} from 'antd';
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {EditModal} from "./EditModal";
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons';

export function CommentForm(props: {postId:string, setOpen: Function }) {
  const {userFeedCai} = useAuth()
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values: { title: string, content: string }) => {
    if (!userFeedCai) return
    api.info({
      message: 'Create Comment ing ...',
      key: 'createComment',
      duration: null,
      description: '',
      icon: <LoadingOutlined />
    });
    const feedApi = new Feed(userFeedCai)
    await feedApi.createComment(props.postId, values.content)
    await feedApi.getAllPost()
    api.success({
      message: 'Create Comment Successful !',
      key: 'createComment',
      description: '',
      icon: <CheckOutlined />
    })
    form.resetFields()
    props.setOpen(false)
  };

  return (
    <>
      {contextHolder}
      <EditModal isComment={true} form={form} onFinish={onFinish}/>
    </>
  );
};
