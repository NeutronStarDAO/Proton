import React, {useState, useEffect} from 'react';
import {Layout, Image, Typography, Avatar, Flex, Space, Button, Modal, message, notification, Spin} from 'antd';
import Post from '../components/post';
import {userApi} from '../actors/user';
import {Profile} from '../declarations/user/user';
import ProfileForm from "../components/Modal/form";
import {Comments} from "../components/comment";
import {PostImmutable} from "../declarations/feed/feed";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {Principal} from "@dfinity/principal";
import {rootFeedApi} from "../actors/rootFeed";
import Feed from "../actors/feed";
import {useAllDataStore, useProfileStore} from "../redux";
import {useAuth} from "../utils/useAuth";
import {LoadingOutlined, CheckOutlined} from '@ant-design/icons';


export default function UserProfile() {
  const {principal: me} = useAuth()
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | undefined>();
  const myProfile = useProfileStore()
  const [postItem, setPostItem] = useState<PostImmutable>()
  const [following, setFollowing] = useState(0)
  const [followers, setFollowers] = useState(0)
  const [allPosts, setAllPosts] = useState<PostImmutable[]>()
  const [isFollowed, setIsFollowed] = useState(true)
  const [api, contextHolder] = notification.useNotification();
  const {userid} = useParams()
  const [commentProfiles, setCommentProfiles] = useState<Profile[]>()
  const [commentLoading, setCommentLoading] = useState(true)
  const {allPost} = useAllDataStore()
  const getAllCommentProfiles = async () => {
    if (!postItem) return setCommentProfiles([])
    const comments = postItem.comment
    const allIds = comments.map(v => v.user)
    const result = await userApi.batchGetProfile(allIds);
    setCommentProfiles(result)
    setCommentLoading(false)
  }

  useEffect(() => {
    getAllCommentProfiles()
  }, [postItem])


  const principal = React.useMemo(() => {
    try {
      return Principal.from(userid)
    } catch (e) {
      message.warning("id is illegal")
      navigate("/")
    }
  }, [userid])

  const isFollow = async () => {
    if (me && principal) {
      const e = await userApi.isFollowed(me, principal)
      setIsFollowed(e)
    }
  }

  useEffect(() => {
    isFollow()
  }, [me, principal])


  const isMe: boolean = React.useMemo(() => {
    if (!me) return false
    if (!principal) return false
    return principal.toText() === me.toString()
  }, [principal, me])


  const getAllPost = async () => {
    if (!principal || !me) {
      setAllPosts([])
      return
    }
    if (isMe) return setAllPosts(allPost)
    const userFeedCai = await rootFeedApi.getUserFeedCanister(principal)
    if (!userFeedCai) {
      setAllPosts([])
      return
    }
    const feedApi = new Feed(userFeedCai)
    const posts = await feedApi.getAllPostWithoutUpate()
    setAllPosts(posts)
  }


  const getInfo = () => {
    if (!principal) return
    if (isMe) setUserProfile(myProfile)
    else userApi.getProfile(principal).then(res => {
      if (!res[0]) {
        return
      }
      setUserProfile(res[0])
    })
    userApi.getFollowerNumber(principal).then(res => setFollowers(res))
    userApi.getFollowingNumber(principal).then(res => setFollowing(res))
  }

  useEffect(() => {
    getInfo()
  }, [principal, isMe, myProfile]);

  useEffect(() => {
    getAllPost()
  }, [userid, isMe, allPost])


  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const handleFollow = async () => {
    if (isMe) {
      handleEditProfile()
    } else {
      if (!principal) return
      api.info({
        message: 'Follow ing ...',
        key: 'follow',
        duration: null,
        description: '',
        icon: <LoadingOutlined/>
      })
      await userApi.follow(principal);
      await isFollow()
      api.success({
        message: 'Follow Successful !',
        key: 'follow',
        description: '',
        icon: <CheckOutlined/>
      });
    }
  }

  return (
    <>
      <Layout.Content className={"posts"} style={{
        backgroundColor: "white",
        padding: "0 20px",
        width: '200px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        borderRight: '1px solid rgba(0,0,0,0.2)',
      }}>
        {contextHolder}
        <Image
          style={{borderRadius: "5px", maxHeight: '100px', maxWidth: '100%'}}
          src={userProfile?.backImgUrl ? userProfile.backImgUrl : 'https://infura-ipfs.mora.host/ipfs/QmbEN76wm4PExViLVmUbKf4vDfx3XkpnYvm6qr3JKCSPDT'}
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
            <Typography.Text strong>{userProfile?.name}</Typography.Text>
          </Space>
          <Button style={{display: !isMe && isFollowed ? "none" : "flex"}}
                  onClick={handleFollow}> {isMe ? "Edit Profile" : "Follow"} </Button>
          <Modal
            title="Edit Profile Information"
            open={isModalOpen}
            footer={null}
            onCancel={() => setIsModalOpen(false)}
          >
            <ProfileForm userProfile={userProfile} drawCallBack={() => setIsModalOpen(false)}/>
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
        {allPosts && allPosts.map((v, k) => {
          return <Post name={userProfile?.name} avatar={userProfile?.avatarUrl} setPostItem={setPostItem} content={v}
                       key={k}/>
        })}
      </Layout.Content>

      <Layout.Content className={"posts"} style={{
        backgroundColor: 'white',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        padding: "40px 20px"
      }}>
        {postItem ? !commentLoading ? postItem.comment.map((v, k) => {
          return <Comments avatar={commentProfiles?.[k] ? commentProfiles [k]?.avatarUrl : ""}
                           name={commentProfiles?.[k] ? commentProfiles [k]?.name : ""}
                           content={v} key={k}/>
        }) : <Flex align="center" justify="center">
          <Spin size="large"/>
        </Flex> : <></>}
      </Layout.Content>
    </>
  )
}
