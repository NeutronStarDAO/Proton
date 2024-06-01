import "./index.scss"

import React from "react"
import {Post} from "../Main";

export const Comment = () => {
  return <div className={"comment"}>
    <div className={"comment_wrap"}>
      <div className={"title"}>Comment</div>
      <div className={"comment_list"}>
        <div style={{width: "100%", height: "1px", background: "#679BF8"}}/>
        {/*<Post/>*/}
        {/*<Post/>*/}
        {/*<Post/>*/}
      </div>
    </div>
  </div>
}
