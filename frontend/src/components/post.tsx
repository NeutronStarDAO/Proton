import {Card, Avatar, Divider, Space, Typography} from "antd";
import {
  CommentOutlined,
  RedoOutlined,
  HeartOutlined
} from '@ant-design/icons';

export default function Post() {

  return (
    <div style={{
      padding: "12px",
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: "20px",
      marginBottom:"20px",
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
        If you’ve been in the Ordinals space for a while the experience on Bioniq is going to be different, but in a
        good way I hope. You don’t need a browser extension wallet, you login with a Google account (non-custodial via
        Web3Auth), and we have a cross-chain wallet built directly into Bioniq.
      </Typography.Paragraph>
      <Space
        size={140}
        style={{
          paddingLeft: '25px'
        }}
      >
        <CommentOutlined/>
        <RedoOutlined/>
        <HeartOutlined/>
      </Space>
    </div>
  );
}
