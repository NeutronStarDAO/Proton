import { useState, useEffect } from 'react'; 
import { Layout, Image, Typography, Avatar, Flex, Space, Button, Modal, notification } from 'antd';
import Sider from '../components/sider';
import Post from '../components/post';
import { AuthClient} from "@dfinity/auth-client";
import ProfileForm from '../components/form';
import User from '../actors/user';
import { Profile } from '../declarations/user/user.did';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function UserProfile() {
  const [authClient, setAuthClient] = useState<AuthClient | undefined>();
  const [isLogin, setIsLogin] = useState<Boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | undefined>();

  const handleLogIn = async () =>  {
    const _authClient = await AuthClient.create();
    _authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      onSuccess: async () => {
        setAuthClient(_authClient);
        setIsLogin(true);
        localStorage.setItem('authClient', JSON.stringify(_authClient));
        localStorage.setItem('isLogin', JSON.stringify(true));
    }});
    _authClient
  }
  
  useEffect(() => {

    const loadAuthFromLocalStorage = async () => {
      const storedAuthClient = localStorage.getItem('authClient');
      const storedIsLogin = localStorage.getItem('isLogin');
  
      if (storedAuthClient && storedIsLogin) {
        const _auth = JSON.parse(storedAuthClient);
        console.log('_auth : ', _auth);
        try {
          const createdAuthClient = await AuthClient.create({
            identity: _auth._identity,
            idleOptions: _auth._idleManager,
            storage: _auth._storage,
          });
          setAuthClient(createdAuthClient);
          setIsLogin(JSON.parse(storedIsLogin));
        } catch (error) {
          console.error('Error creating AuthClient:', error);
        }
      }
    };
    
    // if (storedAuthClient && storedIsLogin) {
    //   const _auth = JSON.parse(storedAuthClient);
    //   console.log('_auth : ', _auth);
    //   setAuthClient(
    //     awaiAuthClient.create({
    //       identity: _auth._identity,
    //       idleOptions:  _auth._idleManager,
    //       storage: _auth._storage
    //     })
    //   );
    //   setIsLogin(JSON.parse(storedIsLogin));
    // }

    if(isLogin) {
      const userActor = new User(authClient!.getIdentity());
      const userPrincipal = authClient!.getIdentity().getPrincipal();
      userActor.actor.getProfile(userPrincipal).then(
        (result) => {
          if(result.length > 0) {
            setUserProfile(result[0]);
          }
        },
        (error) => {
          console.error('query profile error : ', error);
        }
      );
    }
  }, [isLogin]);
  
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: 'Not Login',
      description:
        'You should login to edit profile/',
      duration: 1
    });
  };

  const handleEditProfile =  () => {
    if(!isLogin) {
      openNotificationWithIcon('error')
    } else {
      setIsModalOpen(true);
    }
  };

  useEffect( () => {

  }, [authClient, isLogin]);

  return (
      <div className="App">
      <Layout 
        hasSider={true} 
        style={{
          height: '100vh',
        }}
      >
        <Layout.Sider
          theme='light'
          width={370}
        >
          <Sider 
            authClient={authClient}
            isLogIn={isLogin}
            handleLogIn={handleLogIn}
          />
        </Layout.Sider>

        <Layout.Content style={{
          backgroundColor: "white",
          // paddingLeft: '3px',
          // paddingRight: '3px',
          width: '200px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          borderRight: '1px solid',
        }}>
          <Image
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
                size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                src={userProfile?.avatarUrl}
                style={{
                    border: '1px solid #D3D540',
                }}
              />
              <Typography.Text >{userProfile?.name}</Typography.Text>
            </Space>
            {contextHolder}
            <Button onClick={handleEditProfile}> Edit Profile </Button>
            <Modal 
              title="Edit Profile Information" 
              open={isModalOpen} 
              footer={null}
              onCancel={() => setIsModalOpen(false)}
            >
              <ProfileForm userProfile={userProfile} />
            </Modal>
          </Flex>
          <div style={{
            paddingLeft: '20px',
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
          backgroundColor : 'white',
        }}>
        </Layout.Content>
      </Layout>
    </div>
  )
}
