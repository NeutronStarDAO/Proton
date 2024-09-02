import "./index.scss"
import ShowMoreText from 'react-show-more-text';
import React, {useEffect, useState} from "react"
import {Comment as comment_type} from "../../declarations/bucket/bucket";
import {shortenString} from "../Sider";
import Icon from "../../Icons/Icon";
import {Profile} from "../../declarations/user/user";
import {message, Spin, Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {getTime} from "../../utils/util";
import {updateSelectPost, useSelectPostStore} from "../../redux/features/SelectPost";
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {CommentInput} from "../Common";
import {CommentToComment, CommentTreeNode, Like} from "../../declarations/feed/feed";
import {Principal} from "@dfinity/principal";

export const Comment = () => {
  const {isDark} = useAuth()
  const {CommentTree} = useSelectPostStore()

  return <>
    <div className={"comment"} style={{background: isDark ? "#23233c" : "#fff"}}>
      <div className={"comment_wrap"}>
        <div className={`comment_header ${isDark ? "dark_comment_header" : ""}`}
             style={{width: "100%", textAlign: "start"}}>
          <span style={{cursor: "pointer"}}
                onClick={() => updateSelectPost({})}>
            <Icon name={"back"}/>
          </span>
          <div className={"title"} style={{padding: "0"}}>Comment</div>
        </div>
        {CommentTree ? <CommentList commentTree={CommentTree}/> : <Spin spinning={true}/>}
      </div>
      <div className="close_comment_button" style={{cursor: "pointer"}}
           onClick={() => updateSelectPost({})}>
        ✕
      </div>
    </div>
  </>
}

const CommentTreeNodeComponent = ({node, allNodes}: { node: CommentTreeNode, allNodes: CommentTreeNode[] }) => {
  const {profiles} = useSelectPostStore()
  const children = React.useMemo(() => {
    return allNodes.filter(
      n =>
        (n.father === node.comment[0]?.index[0] || n.father === node.comment_to_comment[0]?.index) &&
        n !== node // 确保节点不是递归自身
    );
  }, [node, allNodes])

  const profile = React.useMemo(() => {
    if (!profiles) return undefined
    const index = allNodes.findIndex(e => {
      if (e.comment.length !== 0 && node.comment.length !== 0) {
        return Number(e.comment[0].index[0]) === Number(node.comment[0].index[0])
      }
      if (e.comment_to_comment.length !== 0 && node.comment_to_comment.length !== 0) {
        return Number(e.comment_to_comment[0].index) === Number(node.comment_to_comment[0].index)
      }
      return undefined
    })
    return profiles[index]
  }, [node, allNodes, profiles])

  const countChildren = (node: CommentTreeNode, allNodes: CommentTreeNode[], visited = new Set()) => {
    // 如果节点已经访问过，直接返回0，避免死循环
    if (visited.has(node.comment[0]?.index[0] || node.comment_to_comment[0]?.index)) {
      return 0;
    }

    // 标记当前节点为已访问
    visited.add(node.comment[0]?.index[0] || node.comment_to_comment[0]?.index);

    // 过滤出当前节点的直接子节点
    const children = allNodes.filter(
      n =>
        (n.father === node.comment[0]?.index[0] || n.father === node.comment_to_comment[0]?.index) &&
        n !== node // 确保节点不是递归自身
    );

    // 递归计算子节点的子节点数
    let count = children.length;
    children.forEach(child => {
      count += countChildren(child, allNodes, visited);
    });

    return count;
  };


  return (
    <div className="comment-tree-node">
      <CommentCon2 commentCount={countChildren(node, allNodes)} profile={profile}
                   comment1={node.comment.length !== 0 ? node.comment[0] : undefined}
                   commentToComment={node.comment_to_comment.length !== 0 ? node.comment_to_comment[0] : undefined}
      />
      {children.length > 0 && children.map((childNode, k) => (
        <CommentTreeNodeComponent key={k} node={childNode} allNodes={allNodes}/>
      ))}
    </div>
  );
};

const CommentList = ({commentTree}: { commentTree: CommentTreeNode[] }) => {
  return (
    <div className="comment-list">
      {commentTree.filter(node => Number(node.dep) === 0).map((rootNode, k) => (
        <CommentTreeNodeComponent key={k} node={rootNode} allNodes={commentTree}/>
      ))}
    </div>
  );
};


const CommentCon = React.memo(({comment, profile}: { comment: comment_type, profile: Profile }) => {
  const [avatar, setAvatar] = useState("")
  const [isLoad, setIsLoad] = useState(false)
  const {isDark, userFeedCai, principal} = useAuth()
  const [isLike, setIsLike] = useState(false)
  const navigate = useNavigate()
  const {post: selectPost} = useSelectPostStore()
  const [open, setOpen] = useState(false)
  const [replyContent, setReplyContent] = useState("")

  const feedApi = React.useMemo(() => {
    return userFeedCai ? new Feed(userFeedCai) : undefined
  }, [userFeedCai])

  const update1 = async () => {
    if (!feedApi || !selectPost) return
    const res = await feedApi.getPost(selectPost.post_id)
    if (res.length !== 0) {
      updateSelectPost({post: res[0]})
    }
  }

  const likes = React.useMemo(() => {
    return comment.like.length !== 0 ? comment.like[0] : []
  }, [comment])


  useEffect(() => {
    if (principal) {
      return likes.some(v => v.user.toText() === principal.toString()) ? setIsLike(true) : setIsLike(false)
    }
  }, [likes, principal]);

  const load = () => {
    setIsLoad(true)
  }

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url) setAvatar(profile.avatar_url)
      else setAvatar("/img_3.png")
    } else {
      setIsLoad(false)
    }
  }, [profile])

  const sendReply = async () => {
    if (!feedApi || !selectPost) return
    if (replyContent.length === 0) return 0
    setOpen(false)
    feedApi.comment_comment(selectPost.post_id, comment.index.length !== 0 ? (comment.index[0]) : BigInt(0), replyContent).then((e) => {
      if (!e) {
        message.error("Failed to comment")
      } else {
        update1()
      }
    }).catch(() => {
      message.error("Failed to comment")
    })
  }

  const handleClick = async (type: string) => {
    if (!feedApi || !selectPost) return
    if (type === "like") {
      setIsLike(true)
      feedApi.like_comment(selectPost.post_id, comment.index.length !== 0 ? (comment.index[0]) : BigInt(0)).then((e) => {
        if (!e) {
          message.error("Failed to like")
          setIsLike(false)
        }
        update1()
      }).catch(() => {
        message.error("Failed to like")
        setIsLike(false)
      })
    } else if (type === "comment") setOpen(true)
  }


  const a = async () => {
    if (!feedApi || !selectPost) return
    console.log(selectPost.post_id)
    const res = await feedApi.get_post_comment_tree(selectPost.post_id)
    console.log(res)
  }


  return <div className={"comment_main"} onClick={a}>
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
              color: "rgba(0,0,0,0.5)"
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
          <div style={{fontWeight: "500", color: "rgba(0,0,0,0.5)"}}>
            {getTime(comment.created_at)}
          </div>
        </div>
      </div>
    </div>
    <ShowMoreTest content={comment.content} className={"tweet"}/>
    <div className={`post_bottom ${isDark ? "dark_post_bottom" : ""}`} onClick={e => e.stopPropagation()}>
      <span style={{cursor: "pointer", color: isLike ? "red" : "black"}} onClick={() => handleClick("like")}>
        <Icon name={isLike ? "like_click" : "like"}/> {likes.length}
      </span>
      <span style={{cursor: "pointer"}} onClick={() => handleClick("comment")}>
        <Icon name={"comment"}/> {0}
      </span>
    </div>

    <CommentInput open={open} setOpen={setOpen} replyContent={replyContent} setReplyContent={setReplyContent}
                  callBack={sendReply} rows={1}/>
  </div>
})

const CommentCon2 = React.memo(({comment1, commentToComment, commentCount, profile}: {
  comment1?: comment_type,
  commentToComment?: CommentToComment, commentCount: number, profile: Profile | undefined
}) => {
  const [avatar, setAvatar] = useState("")
  const [isLoad, setIsLoad] = useState(false)
  const {isDark, userFeedCai, principal, isAuth} = useAuth()
  const [isLike, setIsLike] = useState(false)
  const navigate = useNavigate()
  const {post: selectPost, profiles} = useSelectPostStore()
  const [open, setOpen] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [likes, setLikes] = useState<Like[]>([])
  const [hoverOne, setHoverOne] = useState(-1)

  useEffect(() => {
    if (commentToComment) {
      setLikes(commentToComment.like)
    } else if (comment1) {
      setLikes(comment1.like.length !== 0 ? comment1.like[0] : [])
    }
  }, [commentToComment, comment1]);

  const feedApi = React.useMemo(() => {
    return userFeedCai ? new Feed(userFeedCai) : undefined
  }, [userFeedCai])

  const update1 = async () => {
    if (!feedApi || !selectPost) return
    const res = await feedApi.getPost(selectPost.post_id)
    if (res.length !== 0) {
      updateSelectPost({post: res[0]})
    }
  }

  useEffect(() => {
    if (principal) {
      return likes?.some(v => v.user.toText() === principal.toString()) ? setIsLike(true) : setIsLike(false)
    }
  }, [likes, principal]);

  const load = () => {
    setIsLoad(true)
  }

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url) setAvatar(profile.avatar_url)
      else setAvatar("/img_3.png")
    } else {
      setIsLoad(false)
    }
  }, [profile])

  const sendReply = async () => {
    if (!feedApi || !selectPost) return
    if (replyContent.length === 0) return 0
    setOpen(false)
    const index = comment1 ? comment1.index[0] : commentToComment?.index
    if (index === undefined) return
    feedApi.comment_comment(selectPost.post_id, index, replyContent).then((e) => !e && message.error("Failed to comment"))
    .catch(() => message.error("Failed to comment"))
    .finally(() => update1())
  }

  const handleClick = async (type: string) => {
    if (!feedApi || !selectPost) return
    if (type === "like") {
      setIsLike(true)
      setLikes((e) => e.concat({user: principal as Principal, created_at: BigInt(0)}))
      const index = comment1 ? comment1.index[0] : commentToComment?.index
      if (index === undefined) return
      feedApi[comment1 ? "like_comment" : "like_comment_comment"](selectPost.post_id, index).then((e) => {
        if (!e) message.error("Failed to like")
      }).catch(() => {
        message.error("Failed to like")
      }).finally(() => {
        update1()
      })
    } else if (type === "comment") setOpen(true)
  }

  return <div className={"comment_main"}
              style={{
                width: commentToComment ? "88%" : "",
                border: commentToComment ? "none" : "",
                float: commentToComment ? "right" : "none"
              }}>
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
        {profile ?
          commentToComment ?
            <div style={{fontSize: "2rem"}}>{profile?.name} <span
              style={{color: "#10499F"}}>Reply</span> {profiles && profiles[Number(commentToComment.to_index)].name}
            </div> :
            <div style={{fontSize: "2rem"}}>{profile?.name}</div>
          : <div className="skeleton skeleton-title"/>
        }

        <div style={{display: "flex", alignItems: "center", fontSize: "1.5rem", gap: "1rem"}}>
          {profile ?
            commentToComment ?
              <div style={{
                fontSize: "1.7rem",
                fontWeight: "500",
                color: "rgba(0,0,0,0.5)"
              }}>
                {profile ? shortenString(profile.handle.toString(), 10) : ""} Reply {profiles && profiles[Number(commentToComment.to_index)].handle}
              </div>
              : <div style={{
                fontSize: "1.7rem",
                fontWeight: "500",
                color: "rgba(0,0,0,0.5)"
              }}>
                {profile ? shortenString(profile.handle.toString(), 10) : ""}
              </div>
            : <div className="skeleton skeleton-text"/>
          }

          <span style={{
            width: "0.5rem",
            height: "0.5rem",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%"
          }}/>
          <div style={{fontWeight: "500", color: "rgba(0,0,0,0.5)"}}>
            {getTime(comment1 ? comment1.created_at : commentToComment ? commentToComment.created_at : BigInt(0))}
          </div>
        </div>
      </div>
    </div>
    <ShowMoreTest content={comment1 ? comment1.content : commentToComment ? commentToComment.content : ''}
                  className={"tweet"}/>
    <div className={`post_bottom ${isDark ? "dark_post_bottom" : ""}`} onClick={e => e.stopPropagation()}>
      <Tooltip title={!isAuth ? "please login first" : ""}>
         <span style={{
           color: !isAuth ? "black" : isLike || hoverOne === 0 ? "red" : "black",
           cursor: !isAuth ? "no-drop" : "pointer"
         }}
               onClick={() => handleClick("like")}
               onMouseEnter={e => setHoverOne(0)}
               onMouseLeave={e => setHoverOne(-1)}>
        <Icon name={!isAuth ? "like" : hoverOne === 0 || isLike ? "like_click" : "like"}/> {likes.length}
      </span>
      </Tooltip>
      <Tooltip title={!isAuth ? "please login first" : ""}>
        <span style={{
          color: !isAuth ? "black" : hoverOne === 1 ? "#1C9BEF" : "black",
          cursor: !isAuth ? "no-drop" : "pointer"
        }}
              onClick={() => handleClick("comment")} onMouseEnter={e => setHoverOne(1)}
              onMouseLeave={e => setHoverOne(-1)}>
       <Icon color={!isAuth ? "black" : hoverOne === 1 ? "#1C9BEF" : "black"} name={"comment"}/> {"reply"}
      </span>
      </Tooltip>
    </div>

    <CommentInput open={open} setOpen={setOpen} replyContent={replyContent} setReplyContent={setReplyContent}
                  callBack={sendReply} rows={1}/>
  </div>
})


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
          more={"Show more"}
          less={"Show less"}
          truncatedEndingComponent={"...   "}
          className={className}
        >
          {formattedText}
        </ShowMoreText>
      </div>
    );
  }
)
