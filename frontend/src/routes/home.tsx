import React, {useEffect, useState} from "react";

import {Content} from "./content";
import {useAuth} from "../utils/useAuth";
import Feed from "../actors/feed";
import {PostImmutable} from "../declarations/feed/feed";

export const Home = React.memo(() => {
  const {userFeedCai} = useAuth()
  const [content, setContent] = useState<PostImmutable[]>([])

  const fetch = async () => {
    if (!userFeedCai) return
    const feedApi = new Feed(userFeedCai)
    const feeds = await feedApi.getLatestFeed(20)
    setContent(feeds)
  }

  useEffect(() => {
    fetch()
  }, [userFeedCai])
  return <Content content={content}/>
})
