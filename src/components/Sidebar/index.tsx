import React from 'react';
import "./index.scss"
import Icon from "../../Icons/Icon";

export const Sidebar = () => {
  return <div className={"sidebar_wrap"}>
    <div className={"search_bar"}>
      <Icon name={"search"}/>
      <input placeholder={"Search"} type="text"/>
    </div>
    <div className="trends">
      <span style={{fontSize: "3.3rem"}}>Trends</span>
      <span>#Feature</span>
      <span>#To</span>
      <span>#Be</span>
      <span>#Released</span>
      <span>#Soon</span>
    </div>
    <div className="popular scroll_main">
      <span style={{fontSize: "3.3rem"}}>Popular Users</span>
      <div className={"user"}>
        <div style={{display: "flex", alignItems: 'center'}}>
          <img style={{objectFit:"cover"}} src="/img_3.png" alt=""/>
          <div style={{display: "flex", flexDirection: 'column', alignItems: 'start'}}>
            <span style={{fontSize: "2.5rem"}}>Nash</span>
            <span style={{fontSize: "2rem"}}>@nash.icp</span>
          </div>
        </div>
        <span style={{fontSize: '2.5rem'}}>Follow</span>
      </div>
      <div className={"user"}>
        <div style={{display: "flex", alignItems: 'center'}}>
          <img style={{objectFit:"cover"}} src="/img_3.png" alt=""/>
          <div style={{display: "flex", flexDirection: 'column', alignItems: 'start'}}>
            <span style={{fontSize: "2.5rem"}}>Nash</span>
            <span style={{fontSize: "2rem"}}>@nash.icp</span>
          </div>
        </div>
        <span style={{fontSize: '2.5rem'}}>Follow</span>
      </div>
      <div className={"user"}>
        <div style={{display: "flex", alignItems: 'center'}}>
          <img style={{objectFit:"cover"}} src="/img_3.png" alt=""/>
          <div style={{display: "flex", flexDirection: 'column', alignItems: 'start'}}>
            <span style={{fontSize: "2.5rem"}}>Nash</span>
            <span style={{fontSize: "2rem"}}>@nash.icp</span>
          </div>
        </div>
        <span style={{fontSize: '2.5rem'}}>Follow</span>
      </div>

    </div>
  </div>
}
