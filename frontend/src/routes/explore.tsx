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

  return <Content contents={contents}/>
}
