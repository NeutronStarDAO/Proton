import React, {useState, useEffect} from 'react';
import {Layout, Image, Typography, Avatar, Flex, Space, Button, Modal, message} from 'antd';
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
import {useAllDataStore} from "../redux";
import {useAuth} from "../utils/useAuth";
import { profile } from 'console';

export default function UserProfile() {
  const {principal: me} = useAuth()
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | undefined>();
  const [postItem, setPostItem] = useState<PostImmutable>()
  const [following, setFollowing] = useState(0)
  const [followers, setFollowers] = useState(0)
  const [allPosts, setAllPosts] = useState<PostImmutable[]>()
  const {userid} = useParams()
  const {allPost} = useAllDataStore()
  const principal = React.useMemo(() => {
    try {
      return Principal.from(userid)
    } catch (e) {
      message.warning("id is illegal")
      navigate("/")
    }
  }, [userid])

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
    userApi.getProfile(principal).then(res => {
      if (!res[0]) {
        // message.warning("User does not exist")
        // navigate("/")
        return
      }
      setUserProfile(res[0])
    })
    userApi.getFollowerNumber(principal).then(res => setFollowers(res))
    userApi.getFollowingNumber(principal).then(res => setFollowing(res))
  }

  useEffect(() => {
    getInfo()
  }, [userid]);

  useEffect(() => {
    getAllPost()
  }, [userid, me, allPost])


  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const handleClick = async () => {
    if (isMe) {
      handleEditProfile()
    } else {
      if (!principal) return
      userApi.follow(principal).then()
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
        borderRight: '1px solid',
      }}>
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
          <Button onClick={handleClick}> {isMe ? "Edit Profile" : "Follow"} </Button>
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
          return <Post setPostItem={setPostItem} content={v} key={k}/>
        })}
      </Layout.Content>

      <Layout.Content className={"posts"} style={{
        backgroundColor: 'white',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        padding: "40px 20px"
      }}>
        {postItem && postItem.comment.map((v, k) => {
          return <Comments content={v} key={k}/>
        })}
      </Layout.Content>
    </>
  )
}
