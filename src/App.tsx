import React, {useEffect, useState} from 'react';
import './App.css';
import {Side} from "./components/Sider";
import {Main} from "./components/Main";
import {Wallet} from "./components/Wallet";
import {Settings} from "./components/Setting";
import {Routes, Route} from "react-router-dom";
import {Profile} from "./components/Profile";
import {Comment} from "./components/Comment";
import {useAuth} from "./utils/useAuth";
import {userApi} from "./actors/user";
import {updateProfile} from "./redux";

function App() {

  const {principal} = useAuth()

  useEffect(() => {
    if (principal) {
      userApi.getProfile(principal).then(e => {
        if (e) {
          updateProfile(e)
        }
      })
    }
  }, [principal])

  return (
    <div className={"App"}>
      <Side/>
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="home" element={<Main/>}/>
        <Route path="explore" element={<Main/>}/>
        <Route path="wallet" element={<Wallet/>}/>
        <Route path="settings" element={<Settings/>}/>
        <Route path="profile" element={<Profile/>}/>
        {/*<Route path="*" element={<ErrorPage/>}/>*/}
      </Routes>
      {/*<Sidebar/>*/}
      <Comment/>
    </div>
  );
}

export default App;
