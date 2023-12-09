import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout } from 'antd';
import Sider from './components/sider';
import { Outlet, Link } from "react-router-dom";
import Post from './components/post';
import Comment from './components/comment';
import { AuthClient} from "@dfinity/auth-client";

// const { Header, Content, Footer, Sider } = Layout;
function App() {
  const [authClient, setAuthClient] = useState<AuthClient | undefined>();
  const [isLogin, setIsLogin] = useState<Boolean>(false);
  
  const handleLogIn = async () =>  {
    const _authClient = await AuthClient.create();
    _authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      onSuccess: async () => {
        setAuthClient(_authClient);
        setIsLogin(true);
    }});
  }

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
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          width: '200px',
          borderRight: '1px solid',
        }}>
          <Post/>
          <Post/>
          <Post/>
          <Post/>
          <Post/>
          <Post/>
          <Post/>
        </Layout.Content>
        
        <Layout.Content style={{
          backgroundColor : 'white',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
        }}>
          <Comment />
          <Comment />
          <Comment />
          <Comment />
          <Comment />
          <Comment />
          <Comment />
          <Comment />
        </Layout.Content>
      </Layout>
    </div>
  );
}

export default App;
