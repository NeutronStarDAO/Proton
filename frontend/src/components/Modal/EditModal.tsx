import React from 'react';
import {
  Button,
  Form, FormInstance,
  Input,
} from 'antd';

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


export function EditModal(props: { onFinish: (values: any) => void, form: FormInstance<any> | undefined }) {
  const {onFinish, form} = props

  return (
    <Form
      {...formItemLayout}
      form={form}
      name="register"
      onFinish={onFinish}
      style={{maxWidth: 600}}
      scrollToFirstError
    >

      <Form.Item
        name="content"
        label="Content"
        rules={[
          {
            required: true,
            message: 'Please enter content',
          },
        ]}
      >
        <Input.TextArea showCount/>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
