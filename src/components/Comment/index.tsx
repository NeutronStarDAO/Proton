import "./index.scss"

import React, {useEffect, useState} from "react"
import {Comment as comment_type} from "../../declarations/bucket/bucket";
import {shortenString} from "../Sider";
import Icon, {Name} from "../../Icons/Icon";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {getTime} from "../../utils/util";
import {updateSelectPost} from "../../redux/features/SelectPost";

export const Comment = ({comments}: { comments: comment_type[] }) => {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    if (comments.length !== 0) {
      const users = comments.map((v) => v.user)
      userApi.batchGetProfile(users).then(e => {
        setProfiles(e)
      })
    }
  }, [comments])
  console.log(comments)

  return <div className={"comment"}>
    <div className={"comment_wrap"}>
      <div className={"comment_header"} style={{width: "100%", textAlign: "start"}}>
        <span style={{cursor: "pointer"}} onClick={() => updateSelectPost({})}>
          <Icon name={"back"}/>
        </span>
        <div className={"title"} style={{padding: "0"}}>Comment</div>
      </div>
      <div className={"comment_list"}>
        <div style={{width: "100%", height: "1px", background: "#679BF8"}}/>
        {comments.map((v, k) => {
          return <CommentCon comment={v} profile={profiles[k]} key={k}/>
        })}
      </div>
    </div>
  </div>
}
const kk = [{label: "like", hoverColor: "rgba(249,24,128,0.6)"}, {
  label: "comment",
  hoverColor: "#1C9BEF"
},
  // {label: "repost", hoverColor: "rgb(0,186,124,0.6)"}
]
const CommentCon = ({comment, profile}: { comment: comment_type, profile: Profile }) => {
  const navigate = useNavigate()
  return <div className={"comment_main"}>
    <div className={"author"}>
      <Tooltip title={profile?.name}>
        <img style={{borderRadius: "50%",objectFit:"cover"}} className={"avatar"}
             onClick={() => navigate(`/profile/${profile?.id.toString()}`)}
             src={profile?.avatar_url ? profile.avatar_url : "/img_3.png"} alt=""/>
      </Tooltip>
      <div style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center"}}>
        <div style={{fontSize: "2rem"}}>{profile?.name}</div>
        <div style={{display: "flex", alignItems: "center", fontSize: "1.5rem", color: "#737373", gap: "1rem"}}>
          <div style={{
            fontSize: "2rem",
            color: "rgba(0,0,0,0.5)"
          }}>
            {profile ? shortenString(profile.handle.toString(), 10) : ""}
          </div>
          <span style={{
            width: "0.5rem",
            height: "0.5rem",
            background: "#737373",
            borderRadius: "50%"
          }}/>
          <div style={{color: "#737373"}}>
            {getTime(comment.created_at)}
          </div>
        </div>
      </div>
    </div>
    <pre className={"tweet"}>
      {comment.content}
    </pre>
    <div className={"post_bottom"}>
      {kk.map((v, k) => {
        return <span key={k}>
      <Icon name={v.label as Name}/>
          {0}
      </span>
      })}
    </div>
  </div>
}
