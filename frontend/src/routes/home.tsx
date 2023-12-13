import React from "react";
import {Content} from "./content";
import {useAllDataStore} from "../redux";
import { useAuth } from "../utils/useAuth";
import { SmileOutlined } from '@ant-design/icons';
import { Layout, Result } from 'antd';

export const Home = React.memo(() => {
  const {allFeed} = useAllDataStore()
  
  if(allFeed?.length === 0 || allFeed === undefined) {
    return (
      <>
        <Layout.Content className={"posts"} style={{
          backgroundColor: "white",
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          width: '200px',
          borderRight: '1px solid rgba(0,0,0,0.2)',
          padding: "40px 20px",
        }}>
          <Result
            icon={<SmileOutlined />}
            title="There Is No Feed !"
            subTitle="Please Follow SomeOne To Get Feed"
            style={{
              backgroundColor: 'white'
            }}
          />
        </Layout.Content>
        <Layout.Content className={"posts"} style={{
          backgroundColor: 'white',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          padding: "40px 20px"
        }}>

        </Layout.Content>
      </>
    )

  } else {
    return <Content contents={allFeed}/>
  };
})
