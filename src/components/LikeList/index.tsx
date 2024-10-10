import React, {CSSProperties} from "react";
import "./index.scss"
import Icon from "../../Icons/Icon";
import {Profile} from "../../declarations/user/user";
import {UserCard} from "../../view/FollowList";
import {Loading} from "../Loading";

export const LikeList = React.memo(({users, backApi, style}: {
  users: Profile[] | undefined,
  backApi: Function,

  style?: CSSProperties
}) => {
  return <div className={"like_list"} style={{...style}}>
    <div className={"title"}>
      <span style={{cursor: "pointer"}} onClick={() => backApi()}>
      <Icon name={"back"}/>
      </span>
      Liked by
    </div>
    {users ? users.map((v, k) => {
      return <UserCard isFollowerList={true} isOwner={false} profile={v} key={k}/>
    }) : <Loading isShow={true} style={{width: "100%"}}/>}
  </div>
})
