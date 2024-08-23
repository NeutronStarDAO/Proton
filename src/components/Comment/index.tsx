import "./index.scss"
import ShowMoreText from 'react-show-more-text';

import React, {CSSProperties, useEffect, useRef, useState} from "react"
import {Comment as comment_type} from "../../declarations/bucket/bucket";
import {shortenString} from "../Sider";
import Icon, {Name} from "../../Icons/Icon";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {getTime} from "../../utils/util";
import {updateSelectPost} from "../../redux/features/SelectPost";
import {useAuth} from "../../utils/useAuth";

export const Comment = ({comments}: { comments: comment_type[] }) => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const {isDark} = useAuth()
  useEffect(() => {
    setProfiles([])
    if (comments.length !== 0) {
      const users = comments.map((v) => v.user)
      userApi.batchGetProfile(users).then(e => {
        setProfiles(e)
      })
    }
  }, [comments])

  return <>
    <div className={"comment"} style={{background: isDark ? "#23233c" : "#fff"}}>
      <div className={"comment_wrap"}>
        <div className={`comment_header ${isDark ? "dark_comment_header" : ""}`}
             style={{width: "100%", textAlign: "start"}}>
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
      <div className="close_comment_button" style={{cursor: "pointer"}} onClick={() => updateSelectPost({})}>
        ✕
      </div>
    </div>
  </>
}
const kk = [{label: "like", hoverColor: "rgba(249,24,128,0.6)"}, {
  label: "comment",
  hoverColor: "#1C9BEF"
},
  // {label: "repost", hoverColor: "rgb(0,186,124,0.6)"}
]
const CommentCon = ({comment, profile}: { comment: comment_type, profile: Profile }) => {
  const [avatar, setAvatar] = useState("")
  const [isLoad, setIsLoad] = useState(false)
  const {isDark} = useAuth()
  const navigate = useNavigate()

  const load = () => {
    setIsLoad(true)
  }

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url) setAvatar(profile.avatar_url)
      else setAvatar("/img_3.png")
    } else setIsLoad(false)
  }, [profile])

  return <div className={"comment_main"}>
    <div className={`author ${isDark ? "dark_author" : ""}`}>
      <div style={{position: "relative"}}>
        <Tooltip title={profile?.name}>
          <img style={{borderRadius: "50%", objectFit: "cover"}} className={"avatar"}
               onClick={() => navigate(`/profile/${profile?.id.toString()}`)}
               src={avatar} alt="" onLoad={load}/>
        </Tooltip>
        <div className="skeleton skeleton-avatar" style={{display: !isLoad ? "block" : "none"}}/>
      </div>
      <div className={isDark ? "com_user_info" : ""}
           style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center"}}>
        {profile ? <div style={{fontSize: "2rem"}}>{profile?.name}</div> :
          <div className="skeleton skeleton-title"/>
        }

        <div style={{display: "flex", alignItems: "center", fontSize: "1.5rem", gap: "1rem"}}>
          {profile ?
            <div style={{
              fontSize: "1.7rem",
              fontWeight: "500",

            }}>
              {profile ? shortenString(profile.handle.toString(), 10) : ""}
            </div> :
            <div className="skeleton skeleton-text"/>
          }

          <span style={{
            width: "0.5rem",
            height: "0.5rem",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%"
          }}/>
          <div style={{fontWeight: "500"}}>
            {getTime(comment.created_at)}
          </div>
        </div>
      </div>
    </div>
    <ShowMoreTest content={comment.content} className={"tweet"}/>
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


export const ShowMoreTest = React.memo(({content, className}: { content: string, className?: string }) => {
    const formattedText = content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br/>
      </React.Fragment>
    ));
    return (
      <div>
        <ShowMoreText
          lines={7}
          more="Show More"
          less="Show Less"
          expanded={false}
          truncatedEndingComponent={"...   "}
          className={className}
        >
          {formattedText}
        </ShowMoreText>
      </div>
    );
  }
)
