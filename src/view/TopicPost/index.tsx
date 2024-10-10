import "./index.scss"
import React, {useEffect, useRef, useState} from 'react';
import {useParams, useSearchParams} from "react-router-dom";
import {Post as postType} from "../../declarations/feed/feed";
import {Empty} from "antd";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {useSelectPostStore} from "../../redux/features/SelectPost";
import {Loading} from "../../components/Loading";
import {LikeList} from "../../components/LikeList";
import {dataAnalysisApi} from "../../actors/dataAnalysis";
import {Post} from "../Main";

const pageCount = 30
export const TopicPost = () => {
  const [data, setData] = useState<postType[]>()
  const [page, setPage] = useState(0);
  const [isEnd, setIsEnd] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<Profile[]>()
  const {post: selectPost} = useSelectPostStore()
  const loader = useRef(null)
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("t")

  const getData = React.useCallback(async () => {
    const res = await dataAnalysisApi.get_topic_post(tag ? "#" + tag : "", page * pageCount, pageCount)
    if (page === 0) {
      if (res.length < 30) setIsEnd(true)
      return setData(res)
    }
    if (res.length < 30 || res.length === 0) setIsEnd(true)
    const newArr = [...(data ?? []), ...res]
    setData(newArr);
  }, [page, tag])

  useEffect(() => {
    data && userApi.batchGetProfile(data.map(v => v.user)).then(e => setProfiles(e))
  }, [data]);

  useEffect(() => {
    setData(undefined)
    getData()
  }, [getData]);


  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1)
      }
    }, {threshold: 0})

    loader.current && ob.observe(loader.current)

    return () => {
      loader.current && ob.unobserve(loader.current)
    }
  }, [loader.current])


  return <>
    <LikeList style={{display: showLikeList ? "flex" : "none"}} backApi={() => {
      setShowLikeList(false)
      setLikeUsers(undefined)
    }}
              users={likeUsers}/>
    <div style={{display: showLikeList ? "none" : "flex"}} id={"content_main"}
         className={"main_wrap scroll_main"}>
      <div className={"title"}>Topic {"#" + tag}</div>
      {data ? data.length === 0 ? <Empty style={{width: "100%"}}/>
        : data.map((v, k) => {
          return <Post setLikeUsers={setLikeUsers} key={k} profile={profiles[k]}
                       selectedID={selectPost ? selectPost.post_id : ""}
                       updateFunction={getData}
                       post={v} setShowLikeList={setShowLikeList}/>
        }) : <Loading isShow={true} style={{width: "100%"}}/>}
      <div ref={loader} style={{width: "100%", display: data && !isEnd ? "" : "none"}}>
        <Loading isShow={true} style={{width: "100%"}}/>
      </div>
    </div>
  </>
}

