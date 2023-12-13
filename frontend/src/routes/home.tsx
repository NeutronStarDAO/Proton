import React from "react";
import {Content} from "./content";
import {useAllDataStore} from "../redux";


export const Home = React.memo(() => {
  const {allFeed} = useAllDataStore()

  return <Content contents={allFeed}/>
})
