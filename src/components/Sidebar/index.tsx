import React from 'react';
import "./index.scss"
import Icon from "../../Icons/Icon";

export const Sidebar = () => {
  return <div className={"sidebar_wrap"}>
    <div className={"search_bar"}>
      <Icon name={"search"}/>
      <input placeholder={"Looking For?"} type="text"/>
    </div>
    <div className="trends">
      <span style={{fontSize: "3.7rem"}}>Trends</span>
      <span>#Feature</span>
      <span>#To</span>
      <span>#Be</span>
      <span>#Released</span>
      <span>#Soon</span>
    </div>
    <div className="popular scroll_main">
      <span style={{fontSize: "3.7rem"}}>Popular Users</span>
      <div className={"user"}>
        <div style={{display: "flex", alignItems: 'center'}}>
          <img src="./img_2.png" alt=""/>
          <div style={{display: "flex", flexDirection: 'column', alignItems: 'start'}}>
            <span style={{fontSize: "2.5rem"}}>Nash</span>
            <span style={{fontSize: "2rem"}}>@nash.icp1234567 </span>
          </div>
        </div>
        <span style={{fontSize: '2.5rem'}}>Follow</span>
      </div>
      <div className={"user"}>
        <div style={{display: "flex", alignItems: 'center'}}>
          <img src="./img_2.png" alt=""/>
          <div style={{display: "flex", flexDirection: 'column', alignItems: 'start'}}>
            <span style={{fontSize: "2.5rem"}}>Nash</span>
            <span style={{fontSize: "2rem"}}>@nash.icp1234567 </span>
          </div>
        </div>
        <span style={{fontSize: '2.5rem'}}>Follow</span>
      </div>
      <div className={"user"}>
        <div style={{display: "flex", alignItems: 'center'}}>
          <img src="./img_2.png" alt=""/>
          <div style={{display: "flex", flexDirection: 'column', alignItems: 'start'}}>
            <span style={{fontSize: "2.5rem"}}>Nash</span>
            <span style={{fontSize: "2rem"}}>@nash.icp1234567 </span>
          </div>
        </div>
        <span style={{fontSize: '2.5rem'}}>Follow</span>
      </div>

    </div>
  </div>
}
