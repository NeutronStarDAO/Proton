import React, {useState, useEffect} from 'react';
import {Layout, Image, Typography, Avatar, Flex, Space, Button, Modal, notification} from 'antd';
import Post from '../components/post';
import ProfileForm from '../components/form';
import {userApi} from '../actors/user';
import {Profile} from '../declarations/user/user';
import {useAuth} from "../utils/useAuth";
import {PostImmutable} from "../declarations/feed/feed";
import Feed from "../actors/feed";

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function UserProfile() {
  const {principal} = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | undefined>();
  const [following, setFollowing] = useState(0)
  const [followers, setFollowers] = useState(0)
  const {userFeedCai} = useAuth()
  const [contents, setContents] = useState<PostImmutable[]>([])

  const fetch = async () => {
    if (!userFeedCai) return
    const feedApi = new Feed(userFeedCai)
    const posts = await feedApi.getAllPost()
    console.log(posts)
    setContents(posts)
    // await feedApi.createPost()
  }

  useEffect(() => {
    fetch()
  }, [userFeedCai])

  const getInfo = () => {
    if (!principal) return
    userApi.getProfile(principal).then(res => {
      if (!res[0]) return
      setUserProfile(res[0])
    })
    userApi.getFollowerNumber(principal).then(res => setFollowers(res))
    userApi.getFollowingNumber(principal).then(res => setFollowing(res))
  }

  useEffect(() => {
    getInfo()
  }, [principal]);

  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: 'Not Login',
      description:
        'You should login to edit profile/',
      duration: 1
    });
  };

  const handleEditProfile = () => {
    if (!principal) {
      openNotificationWithIcon('error')
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Layout.Content className={"posts"} style={{
        backgroundColor: "white",
        padding: "0 20px",
        width: '200px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        borderRight: '1px solid',
      }}>
        <Image
          style={{borderRadius: "5px"}}
          src='https://infura-ipfs.mora.host/ipfs/QmbEN76wm4PExViLVmUbKf4vDfx3XkpnYvm6qr3JKCSPDT'
          alt='Profile Bakcground Picture'
        />
        <Flex
          align='center'
          justify='space-between'
          style={{
            marginTop: '10px',
            marginBottom: "2px",
            paddingLeft: '12px',
            paddingRight: '10px',
          }}
        >
          <Space size='middle'>
            <Avatar
              size={{xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100}}
              src={userProfile?.avatarUrl}
              style={{
                border: '1px solid #D3D540',
              }}
            />
            <Typography.Text>{userProfile?.name}</Typography.Text>
          </Space>
          {contextHolder}
          <Button onClick={handleEditProfile}> Edit Profile </Button>
          <Modal
            title="Edit Profile Information"
            open={isModalOpen}
            footer={null}
            onCancel={() => setIsModalOpen(false)}
          >
            <ProfileForm userProfile={userProfile}/>
          </Modal>
        </Flex>
        <div style={{
          paddingLeft: '20px',
          marginBottom: "20px"
        }}>
          <Space size='large'>
            <Typography.Text>Education : {userProfile?.education}</Typography.Text>
            <Typography.Text>Company : {userProfile?.company}</Typography.Text>
          </Space>
          <br></br>
          <Typography.Text>Biography: {userProfile?.biography}</Typography.Text>
          <br/>
          <Space size='middle'>
            <Typography.Text>{following} Following</Typography.Text>
            <Typography.Text>{followers} Followers</Typography.Text>
          </Space>
        </div>
        {contents.map((v, k) => {
          return <Post content={v} key={k}/>
        })}
      </Layout.Content>

      <Layout.Content style={{
        backgroundColor: 'white',
      }}>
      </Layout.Content>
    </>
  )
}
