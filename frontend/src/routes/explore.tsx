import { Layout } from 'antd';
import Sider from '../components/sider';
import Post from '../components/post';
import Comment from '../components/comment';

export default function Explore() {
    return (
        <div>
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
              <Sider />
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