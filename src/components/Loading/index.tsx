import React, {CSSProperties} from "react"
import "./index.scss"

export const Loading = ({isShow, style}: { isShow: boolean, style?: CSSProperties }) => {

  return <div className={"loading_wrap"} style={{display: isShow ? "flex" : "none", ...style}}>
    <img src="/img_1.png" alt="Loading"/>
  </div>
}
