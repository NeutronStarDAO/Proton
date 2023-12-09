import {Layout, Image, Typography, Avatar, Flex, Space, Button} from 'antd';
import Sider from '../components/sider';
import {useAuth} from "../utils/useAuth";

export default function Settings() {
  const {logOut} = useAuth()
  return (
    <>
      <Layout.Content style={{
        backgroundColor: "white",
        // paddingLeft: '3px',
        // paddingRight: '3px',
        width: '200px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        borderRight: '1px solid',
      }}>
        <Flex
          vertical
          style={{
            paddingTop: '50px',
            paddingLeft: '50px'
          }}
        >
          <Space
            size='large'
            style={{
              marginBottom: '20px',
            }}
          >
            <Button>Dark</Button>
            <Button>Light</Button>
          </Space>
          <Space>
            <Button onClick={() => logOut?.()}>LogOut</Button>
          </Space>
        </Flex>

      </Layout.Content>

      <Layout.Content style={{
        backgroundColor: 'white',
      }}>
      </Layout.Content>
    </>
  )
}
