import React, {useState} from 'react';
import {
  Button,
  Form,
  Input,
  notification,
} from 'antd';
import {Profile} from "../../declarations/user/user";
import {userApi} from '../../actors/user';
import {LoadingOutlined, CheckOutlined} from '@ant-design/icons';
import {updateProfile} from "../../redux";
import {useAuth} from "../../utils/useAuth";

interface DataNodeType {
  value: string;
  label: string;
  children?: DataNodeType[];
}

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

interface ProfileFormProps {
  userProfile: Profile | undefined;
  drawCallBack: () => void;
}

export default function ProfileForm(props: ProfileFormProps) {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const {principal} = useAuth()
  console.log(props.userProfile)
  console.log(props.userProfile?.feedCanister);

  const onFinish = async (values: any) => {
    api.info({
      message: 'Update Profile ing ...',
      key: 'updateProfile',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    })
    await userApi.createProfile({
      'backImgUrl': values.backImgUrl === undefined ? '' : values.backImgUrl,
      'name': values.name === undefined ? '' : values.name,
      'education': values.education === undefined ? '' : values.education,
      'biography': values.biography === undefined ? '' : values.biography,
      'company': values.company === undefined ? '' : values.company,
      'avatarUrl': values.avatarUrl === undefined ? '' : values.avatarUrl,
      'feedCanister': [],
    });
    if (principal) {
      const res = await userApi.getProfile(principal)
      if (!res[0]) return
      updateProfile(res[0])
    }
    api.success({
      message: 'Update Profile Successful !',
      key: 'updateProfile',
      description: '',
      icon: <CheckOutlined/>
    });
    props.drawCallBack();
    console.log('Received values of form: ', values);
  };

  return (
    <Form
      {...formItemLayout}
      form={form}
      name="register"
      onFinish={onFinish}
      initialValues={{
        name: props.userProfile?.name,
        company: props.userProfile?.company,
        education: props.userProfile?.education,
        backImgUrl: props.userProfile?.backImgUrl,
        avatarUrl: props.userProfile?.avatarUrl,
        feedCanister: (props.userProfile?.feedCanister !== undefined && props.userProfile?.feedCanister.length > 0) ? props.userProfile?.feedCanister[0]?.toString() : "",
        biography: props.userProfile?.biography
      }}
      style={{maxWidth: 600}}
      scrollToFirstError
    >
      {contextHolder}
      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Please input your name',
          },
        ]}
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="company"
        label="Company"
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="education"
        label="Education"
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="avatarUrl"
        label="AvatarUrl"
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="backImgUrl"
        label="BackImgUrl"
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="feedCanister"
        label="Feed Canister Id"
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="biography"
        label="Biography"
        rules={[{required: true, message: 'Please input Intro'}]}
      >
        <Input.TextArea showCount maxLength={160}/>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
