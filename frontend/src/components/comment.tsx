import { Flex, Space, Avatar, Typography, Divider } from 'antd';

export default function Comment() {
    return (
        <Flex
            vertical
            style={{
                paddingLeft: '10px',
            }}
        >
            <Divider />
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
            <Typography.Paragraph>
                This is Comment;This is Comment;This is Comment;
                This is Comment;This is Comment;This is Comment;
                This is Comment;This is Comment;This is Comment;
                This is Comment;This is Comment;This is Comment;
            </Typography.Paragraph>
        </Flex>
    )
}