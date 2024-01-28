import React, {useEffect} from "react";
import {Content} from "./content";
import {useAllDataStore} from "../redux";
import {useAuth} from "../utils/useAuth";
import {useNavigate} from "react-router-dom";


export const Home = React.memo(() => {
  const {allFeed} = useAllDataStore()
  const {isAuth} = useAuth()
  const navigate = useNavigate()

  const change = () => {
    if (isAuth === false)
      navigate("/explore")
  }
  useEffect(() => {
    change()
  }, [isAuth])

  return <Content contents={allFeed}/>
})
