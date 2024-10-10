import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Post as PostType} from "../../../declarations/feed/feed";
import Feed from "../../../actors/feed";
import {Principal} from "@dfinity/principal";
import {LikeList} from "../../../components/LikeList";
import {Profile} from "../../../declarations/user/user";
import {useSelectPostStore} from "../../../redux/features/SelectPost";
import {userApi} from "../../../actors/user";
import {Post} from "../index";
import {Loading} from "../../../components/Loading";
import {Empty} from "antd";
import Icon from "../../../Icons/Icon";

export const SinglePost = React.memo(() => {
  const {postId} = useParams()
  const [post, setPost] = useState<PostType>()
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<Profile[]>()
  const {post: selectPost} = useSelectPostStore()
  const [error, setError] = useState<boolean>(false)
  const [profile, setProfile] = useState<Profile>()

  const {cid, userId, newPostId} = React.useMemo(() => {
    if (!postId) return {cid: "", userId: "", newPostId: ""}
    const newStr = postId.replace(/_/g, '#');
    const slice = newStr?.split("#")
    if (!slice) return {cid: "", userId: "", newPostId: ""}
    return {cid: slice[0], userId: slice[1], newPostId: newStr}
  }, [postId])

  const init = async () => {
    if (!cid || !postId || !userId) return
    try {
      const p_id = Principal.from(cid)
      const api = new Feed(p_id)
      userApi.getProfile(Principal.from(userId)).then(res => {
        setProfile(res)
      })
      const res = await api.getPost(newPostId)
      if (res.length > 0)
        setPost(res[0])
      else throw new Error("post not found")
    } catch (e) {
      console.log(e)
      setError(true)
    }
  }


  useEffect(() => {
    postId && init()
  }, [postId, userId, cid]);

  return <>
    <LikeList style={{display: showLikeList ? "flex" : "none"}} backApi={() => {
      setShowLikeList(false)
      setLikeUsers(undefined)
    }}
              users={likeUsers}/>
    <div style={{display: showLikeList ? "none" : "flex"}} id={"content_main"}
         className={"main_wrap"}>
      <div className={"title"}>
          <span style={{cursor: "pointer", marginRight: "1rem"}} onClick={() => window.history.back()}>
          <Icon name={"back"}/>
      </span>
        Shared Post
      </div>
      {post ? <Post setLikeUsers={setLikeUsers} profile={profile}
                    selectedID={selectPost ? selectPost.post_id : ""}
                    updateFunction={init}
                    post={post} setShowLikeList={setShowLikeList}/> :
        error ? <Empty style={{width: "100%"}}/> :
          <Loading isShow={true} style={{width: "100%"}}/>}
    </div>
  </>
})
