import React, {CSSProperties, useEffect} from "react"
import "./index.scss"

export const Loading = ({isShow, style}: { isShow: boolean, style?: CSSProperties }) => {
  const [dots, setDots] = React.useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : ""));
    }, 500);
    return () => {
      clearInterval(interval)
    };
  }, []);

  return <div className={"loading_wrap"} style={{display: isShow ? "flex" : "none", ...style}}>
    <img src="/img_1.png" alt="Loading"/>
  </div>
}
