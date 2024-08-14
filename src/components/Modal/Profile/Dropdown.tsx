import "./dropdwon.scss"

import React, {useEffect} from "react"

export const Dropdown = ({dropdownList, setItem, item}: { dropdownList: string[], setItem?: Function, item?: any }) => {
  const [open, setOpen] = React.useState<boolean>(false)
  return <div>
    <div className="dropdown">
      <span className="dropbtn" onClick={() => setOpen(!open)}>{item}</span>
      <div className="dropdown-content" style={{display: open ? "block" : "none"}}>
        {dropdownList.map((item, index) => {
          return <div key={index} onClick={() => {
            setItem?.(item)
            setOpen(false)
          }}>{item}</div>
        })}
      </div>
    </div>
  </div>
}
