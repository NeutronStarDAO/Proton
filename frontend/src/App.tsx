import React from 'react';
import './App.css';
import {Layout} from 'antd';
import Sider from './components/sider';
import {Routes, Route} from "react-router-dom";
import ErrorPage from './components/errorPage';
import Explore from './routes/explore';
import Profile from './routes/profile';
import Settings from './routes/settings';
import {Home} from "./routes/home";

function App() {

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
          width={300}
        >
          <Sider/>
        </Layout.Sider>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="home" element={<Home/>}/>
          <Route path="explore" element={<Explore/>}/>
          <Route path="profile" element={<Profile/>}/>
          <Route path="settings" element={<Settings/>}/>
          <Route path="*" element={<ErrorPage/>}/>
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
