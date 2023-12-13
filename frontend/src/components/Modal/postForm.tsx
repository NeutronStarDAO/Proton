import React from 'react';
import {
  Form,
  notification
} from 'antd';
import {LoadingOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons';
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {EditModal} from "./EditModal";

export function PostForm(props: { setOpen: Function }) {
  const {userFeedCai} = useAuth()
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values: { title: string, content: string }) => {
    if (!userFeedCai) return
    const feedApi = new Feed(userFeedCai)
    api.info({
      message: 'Create Post ing ...',
      key: 'createPost',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    });
    try {
      await feedApi.createPost(values.title, values.content)
      api.success({
        message: 'Create Post Successful !',
        key: 'createPost',
        description: '',
        icon: <CheckOutlined/>
      })
    } catch (e) {
      api.error({
        message: 'Create Post failed !',
        key: 'createPost',
        description: '',
        icon: <CloseOutlined/>
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
