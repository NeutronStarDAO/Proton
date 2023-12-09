import {useState, useEffect} from 'react';
import {Layout, Image, Typography, Avatar, Flex, Space, Button, Modal, notification} from 'antd';
import Post from '../components/post';
import ProfileForm from '../components/form';
import User from '../actors/user';
import {Profile} from '../declarations/user/user.did';
import {useAuth} from "../utils/useAuth";

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function UserProfile() {
  const {isAuth, identity, principal} = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | undefined>();

  // useEffect(() => {
  //   if (!isAuth || !identity || !principal) return
  //   const userActor = new User(identity);
  //   userActor.actor.getProfile(principal).then(
  //     (result) => {
  //       if (result.length > 0) {
  //         setUserProfile(result[0]);
  //       }
  //     },
  //     (error) => {
  //       console.error('query profile error : ', error);
  //     }
  //   );
  // }, [isAuth, identity]);

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
    if (!isAuth) {
      openNotificationWithIcon('error')
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Layout.Content className={"posts"} style={{
        backgroundColor: "white",
        padding:"0 20px",
        width: '200px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        borderRight: '1px solid',
      }}>
        <Image
          style={{borderRadius:"5px"}}
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
          marginBottom:"20px"
        }}>
          <Space size='large'>
            <Typography.Text>Education : {userProfile?.education}</Typography.Text>
            <Typography.Text>Company : {userProfile?.company}</Typography.Text>
          </Space>
          <br></br>
          <Typography.Text>Biography: {userProfile?.biography}</Typography.Text>
          <br/>
          <Space size='middle'>
            <Typography.Text>111 Following</Typography.Text>
            <Typography.Text>222 Followers</Typography.Text>
          </Space>
        </div>
        <Post/>
        <Post/>
        <Post/>
        <Post/>
        <Post/>
        <Post/>
      </Layout.Content>

      <Layout.Content style={{
        backgroundColor: 'white',
      }}>
      </Layout.Content>
    </>
  )
}
