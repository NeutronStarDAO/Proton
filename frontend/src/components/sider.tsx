import {Menu, Button, Avatar, Flex, Card, Space, Modal, message, Typography} from "antd";
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
import {useAuth} from "../utils/useAuth";
import React, {useEffect, useState} from "react";
import {PostForm} from "./Modal/postForm";
import {Profile} from "../declarations/user/user";
import { userApi } from "../actors/user";

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

export default function Sider() {
  const navigate = useNavigate();
  const {isAuth, logIn, principal} = useAuth();
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const initUserProfile = async () => {
      if(principal?._isPrincipal === true) {
        const _profile = await userApi.getProfile(principal);
        console.log('side bar init profile : ', _profile);
        if(_profile.length > 0) {
          setProfile(_profile[0]);
        };
      };
    };

    initUserProfile();

  }, [principal]);

  const onClick = (info: MenuInfo) => {
    if (info.key === '1') {
      navigate('/');
    } else if (info.key === '2') {
      navigate('/explore');
    } else if (info.key === '3') {
      if (!principal) return message.warning("please login first")
      navigate(`/profile/${principal.toText()}`);
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
        <Modal
          title="Edit"
          open={open}
          footer={null}
          onCancel={() => setOpen(false)}
        >
          <PostForm setOpen={setOpen}/>
        </Modal>
        <Button style={{
          marginLeft: '23px',
          width: '100px'
        }} onClick={() => setOpen(true)}> Post
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
                src={ profile?.avatarUrl ? profile.avatarUrl : "https://avatars.githubusercontent.com/u/120618331?s=200&v=4" }
                style={{
                  border: '1px solid #D3D540',
                }}
              />}
              title={
                profile ? profile.name : "NeutronstarDao"
              }
              description={
                <Typography.Text
                  copyable={true}
                  // style={{width: '100px'}}
                  ellipsis
                >
                {principal?.toString()}
                </Typography.Text>
              }
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
