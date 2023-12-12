import {Menu, Button, Avatar, Flex, Card, Space} from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  SearchOutlined,
  ProfileOutlined,
  UserOutlined
} from '@ant-design/icons';
import type {MenuInfo} from 'rc-menu/lib/interface'
import type {MenuItemType} from 'antd/es/menu/hooks/useItems';
import {useNavigate} from "react-router-dom";
import {AuthClient} from "@dfinity/auth-client";
import {
  getPrincipal,
  checkIdentity
} from '../utils/common';
import {Principal} from "@dfinity/principal";
import {Identity} from "@dfinity/agent";
import {useAuth} from "../utils/useAuth";

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
): MenuItemType {
  return {
    key,
    icon,
    label,
  } as MenuItemType;
}

const items: MenuItemType[] = [

  getItem("Home", '1', <HomeOutlined style={{
    color: '#D3D540',
    fontSize: '20px'
  }}/>),
  getItem("Explore", '2', <SearchOutlined style={{
    color: '#D3D540',
    fontSize: '20px'
  }}/>),
  getItem("Profile", '3', <ProfileOutlined style={{
    color: '#D3D540',
    fontSize: '20px'
  }}/>),
  getItem("Settings", '4', <SettingOutlined style={{
    color: '#D3D540',
    fontSize: '20px'
  }}/>),

];
// const getUserProfile = (
//     user_principal: Principal
//     identity: Identity
// ) => {
//     const user = new User(identity);
//     user.actor.getProfile(user_principal)
// }

export default function Sider() {
  const navigate = useNavigate();
  const {isAuth, principal, logIn} = useAuth()

  const onClick = (info: MenuInfo) => {
    if (info.key === '1') {
      navigate('/');
    } else if (info.key === '2') {
      navigate('/explore');
    } else if (info.key === '3') {
      navigate('/profile');
    } else if (info.key === '4') {
      navigate('/settings');
    }
  }

  return (
    <Flex
      vertical={true}
      justify="space-between"
      style={{
        height: '100vh',
        paddingLeft: '20px',
        paddingBottom: '20px',
        borderRight: "1px solid rgba(0,0,0,0.2)"
      }}>
      <div>
        <h1 style={{
          fontSize: '40px',
          paddingLeft: '20px',
        }}>
          Proton
        </h1>

        <Menu
          className={"sider"}
          mode="vertical"
          items={items}
          style={{
            marginTop: '50px',
            border: "none"
          }}
          onClick={onClick}
        />

        <Button style={{
          marginLeft: '23px',
          width: '100px'
        }}> Post
        </Button>
      </div>
      {
        isAuth ? (
          <Card
            bordered={false}
          >
            <Card.Meta
              avatar={<Avatar
                size={{xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100}}
                src="https://avatars.githubusercontent.com/u/120618331?s=200&v=4"
                style={{
                  border: '1px solid #D3D540',
                }}
              />}
              title="NeutronStarDAO"
              description="@NeutronStarDAO"
            />
          </Card>) : (
          <Space onClick={() => logIn?.()}>
            <Button>II LogIn </Button>
          </Space>
        )
      }
    </Flex>
  )
}
