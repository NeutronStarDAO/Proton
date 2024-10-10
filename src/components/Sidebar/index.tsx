import React, {useEffect} from 'react';
import "./index.scss"
import Icon from "../../Icons/Icon";
import {useAuth} from "../../utils/useAuth";
import {dataAnalysisApi} from "../../actors/dataAnalysis";
import {Loading} from "../Loading";
import {useLocation, useNavigate} from "react-router-dom";

export const Sidebar = () => {
  const {isDark} = useAuth()
  const [trends, setTrends] = React.useState<string[]>()
  const navigator = useNavigate()
  const [tag, setTag] = React.useState<string>("")
  const path = useLocation()

  useEffect(() => {
    setTag("")
  }, [path.pathname]);

  const getTrends = async () => {
    const res = await dataAnalysisApi.get_hot_topic(BigInt(7))
    setTrends(res.map(r => r[0]))
  }
  useEffect(() => {
    getTrends()
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (tag.startsWith("#"))
        navigator(`/tag?t=${tag.slice(1, tag.length)}`)
      else
        navigator(`/tag?t=${tag}`)
    }
  };

  const handleInput = (e: any) => {
    const text = e.target.value
    setTag(text)
  }

  return <div className={`sidebar_wrap ${isDark ? "dark_sidebar_wrap" : ""}`}>
    <div className={"search_bar"}>
      <Icon name={"search"}/>
      <input onKeyDown={handleKeyDown} value={tag} onChange={handleInput} placeholder={"Search"}
             type="text"/>
    </div>
    <div className="trends">
      <span style={{fontSize: "3.3rem"}}>Trends</span>
      {trends ? trends.map((v, k) => {
        return <span className={"trends_tag"} key={k}
                     onClick={() => {
                       setTag(v)
                       navigator(`/tag?t=${v.slice(1, v.length)}`)
                     }}>{v}</span>
      }) : <Loading isShow={true}/>}
    </div>
  </div>
}
