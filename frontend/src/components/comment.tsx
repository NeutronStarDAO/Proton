import {Flex, Space, Avatar, Typography, Divider} from 'antd';
import {Comment} from "../declarations/feed/feed"


export function Comments(props: { content: Comment, avatar?: string, name?: string }) {
  const {content, avatar, name} = props
  return (
    <Flex
      vertical
      className={"content"}
      style={{padding: "0 20px"}}
    >
      <Space>
        <Avatar
          size={32}
          src={avatar ? avatar : "https://avatars.githubusercontent.com/u/120618331?s=200&v=4"}
          style={{
            border: '1px solid #D3D540',
          }}
        />
        <p>{name ? name : "NeutronStarDAO"}</p>
      </Space>
      <Typography.Paragraph>
        {content.content}
      </Typography.Paragraph>
      <Divider style={{marginBottom: "0"}}/>
    </Flex>
  )
}
