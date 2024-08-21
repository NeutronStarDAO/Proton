import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {Side} from "./components/Sider";
import {Main} from "./components/Main";
import {Settings} from "./components/Setting";
import {Routes, Route} from "react-router-dom";
import {Profile} from "./components/Profile";
import {Comment} from "./components/Comment";
import {useAuth} from "./utils/useAuth";
import {userApi} from "./actors/user";
import {updateProfile, useProfileStore} from "./redux";
import {Sidebar} from "./components/Sidebar";
import {useSelectPostStore} from "./redux/features/SelectPost";
import {ProfileModal} from "./components/Modal/Profile";
import {FollowList} from "./components/FollowList";
import {Wallet} from "./components/Wallet";
import {Principal} from "@dfinity/principal";

function App() {

  const selectPost = useSelectPostStore()
  const {principal, isAuth, isDark} = useAuth()
  const scrollContainerRef = useRef(null);
  const [open, setOpen] = useState(false)

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
    if (isDark){
      document.documentElement.classList.toggle('dark-theme', true);
        document.documentElement.classList.toggle('light-theme', false);
    }
    else {
      document.documentElement.classList.toggle('light-theme', true);
        document.documentElement.classList.toggle('dark-theme', false);
    }
  }, [isDark]);

  return (
    <div className={"App"} style={{background: isDark ? "#23233c" : ""}}>
      <ProfileModal setOpen={setOpen} open={open} canClose={false}/>
      <Side scrollToTop={scrollToTop}/>
      <Routes>
        <Route path="/" element={<Main scrollContainerRef={scrollContainerRef}/>}/>
        <Route path="home" element={<Main scrollContainerRef={scrollContainerRef}/>}/>
        <Route path="explore" element={<Main scrollContainerRef={scrollContainerRef}/>}/>
        {/*<Route path="wallet" element={<Wallet/>}/>*/}
        <Route path="settings" element={<Settings/>}/>
        <Route path="followers/:id" element={<FollowList/>}/>
        <Route path="following/:id" element={<FollowList/>}/>
        <Route path="profile/:id"
               element={<Profile scrollContainerRef={scrollContainerRef} scrollToTop={scrollToTop}/>}/>
        {/*<Route path="*" element={<ErrorPage/>}/>*/}
      </Routes>
      {"comment" in selectPost ?
        <Comment comments={selectPost.comment}/>
        : <Sidebar/>
      }

    </div>
  );
}

export default App;
