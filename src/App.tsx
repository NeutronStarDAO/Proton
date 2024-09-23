import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {Side} from "./components/Sider";
import {Main} from "./components/Main";
import {Settings} from "./components/Setting";
import {Routes, Route, Navigate} from "react-router-dom";
import {Profile} from "./components/Profile";
import {Comment} from "./components/Comment";
import {useAuth} from "./utils/useAuth";
import {userApi} from "./actors/user";
import {updateProfile, useProfileStore} from "./redux";
import {Sidebar} from "./components/Sidebar";
import {updateSelectPost, useSelectPostStore} from "./redux/features/SelectPost";
import {ProfileModal} from "./components/Modal/Profile";
import {FollowList} from "./components/FollowList";
import {Wallet} from "./components/Wallet";
import Feed from "./actors/feed";
import {CommentTreeNode} from "./declarations/feed/feed";
import {Principal} from "@dfinity/principal";
import {SinglePost} from "./components/Main/SinglePost";

const userFeedCai = Principal.from("mai5z-6yaaa-aaaan-qmtmq-cai")

function App() {

  const {post: selectPost} = useSelectPostStore()
  const {principal, isAuth, isDark} = useAuth()
  const scrollContainerRef = useRef(null);
  const [open, setOpen] = useState(false)

  const getProfile = async (tree: CommentTreeNode[]) => {
    const profileIds: Principal[] = []
    tree.forEach(e => {
      e.comment.forEach(e => {
        profileIds.push(e.user)
      })
      e.comment_to_comment.forEach(e => {
        profileIds.push(e.from_user)
      })
    })
    const res = await userApi.batchGetProfile(profileIds)
    updateSelectPost({profiles: res})
  }

  const getCommentTree = async () => {
    if (!selectPost) return
    const feedApi = new Feed(userFeedCai)
    const res = await feedApi.get_post_comment_tree(selectPost.post_id)
    getProfile(res)
    // feedApi.comment_comment(selectPost.post_id, BigInt(3),"评论的评论的评论")
    updateSelectPost({CommentTree: res})
  }

  useEffect(() => {
    getCommentTree()
  }, [selectPost]);

  useEffect(() => {
    if (principal && isAuth) {
      userApi.getProfile(principal).then(e => {
        if (e) {
          updateProfile(e)
          setOpen(false)
        } else {
          setOpen(true)
        }
      })
    }
  }, [principal, isAuth])

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      //@ts-ignore
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth' // 使用平滑滚动
      });
    }
  };


  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.toggle('dark-theme', true);
      document.documentElement.classList.toggle('light-theme', false);
    } else {
      document.documentElement.classList.toggle('light-theme', true);
      document.documentElement.classList.toggle('dark-theme', false);
    }
  }, [isDark]);

  return (
    <div className={"App"} style={{background: isDark ? "#23233c" : ""}}>
      <ProfileModal setOpen={setOpen} open={open} canClose={false}/>
      <Side scrollToTop={scrollToTop}/>
      <Routes>
        <Route path="/" element={<Navigate to={"home"}/>}/>
        <Route path="home" element={<Main scrollContainerRef={scrollContainerRef}/>}/>
        <Route path="/post/:postId" element={<SinglePost/>}/>
        <Route path="explore" element={<Main scrollContainerRef={scrollContainerRef}/>}/>
        <Route path="wallet" element={<Wallet/>}/>
        <Route path="settings" element={<Settings/>}/>
        <Route path="followers/:id" element={<FollowList/>}/>
        <Route path="following/:id" element={<FollowList/>}/>
        <Route path="profile/:id"
               element={<Profile scrollContainerRef={scrollContainerRef} scrollToTop={scrollToTop}/>}/>
        <Route path="*" element={<Navigate to={"home"}/>}/>
      </Routes>
      {selectPost ? <Comment/> : <Sidebar/>}
    </div>
  );
}

export default App;
