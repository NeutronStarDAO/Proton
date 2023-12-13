import {Content} from "./content";
import React, {useEffect, useState} from "react";
import {rootPostApi} from "../actors/rootPost";
import Bucket from "../actors/bucket";
import {PostImmutable} from "../declarations/feed/feed";
import { Layout, Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

export default function Explore() {
  const [contents, setContents] = useState<PostImmutable[]>([])
  const fetch = async () => {
    const bucket = await rootPostApi.getAvailableBucket()
    if (!bucket[0]) return
    const bucketApi = new Bucket(bucket[0])
    const res = await bucketApi.getLatestFeed(30)
    setContents(res)
  }

  useEffect(() => {
    fetch()
  }, [])

  if(contents.length > 0) {
    return <Content contents={contents}/>
  } else {
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
          subTitle="Please Refresh The Website"
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
    </>)
  }
}
