import {Card, Avatar, Divider, Space, Typography} from "antd";
import {
  CommentOutlined,
  RedoOutlined,
  HeartOutlined
} from '@ant-design/icons';
import {PostImmutable} from "../declarations/feed/feed";

export default function Post(props: { content: PostImmutable }) {
  const {content} = props
  return (
    <div className={"content"} style={{
      padding: "12px",
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: "20px",
      marginBottom: "20px",
    }}>
      {/*<Divider/>*/}
      <Space>
        <Avatar
          size={32}
          src="https://avatars.githubusercontent.com/u/120618331?s=200&v=4"
          style={{
            border: '1px solid #D3D540',
          }}
        />
        <p>NeutronStarDAO</p>
      </Space>
      <Typography.Paragraph style={{
        paddingLeft: '12px'
      }}>
        {content.content}
      </Typography.Paragraph>
      <Space
        size={140}
        style={{
          paddingLeft: '25px'
        }}
      >
        <div>
          <CommentOutlined/> &nbsp;
          {content.comment.length}
        </div>
        <div>
          <RedoOutlined/>
          &nbsp;
          {content.repost.length}
        </div>
        <div>
          <HeartOutlined/>&nbsp;
          {content.like.length}
        </div>
      </Space>
    </div>
  );
}
