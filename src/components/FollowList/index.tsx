import React, {useEffect} from "react"
import "./index.scss"
import {useLocation, useParams} from "react-router-dom";
import {Profile} from "../../declarations/user/user";
import {userApi} from "../../actors/user";
import {Principal} from "@dfinity/principal";

export const FollowList = React.memo(() => {
  const {pathname} = useLocation()
  const {id} = useParams()
  const [useridList, setUseridList] = React.useState<Principal[]>([])
  const [users, setUsers] = React.useState<Profile[]>([])

  const isFollowerList = React.useMemo(() => {
    return pathname.includes("followers")
  }, [pathname])

  const init = async () => {
    if (!id) return
    if (isFollowerList) {
      const res = await userApi.getFollowerList(Principal.from(id))
      setUseridList(res)
    } else {
      const res = await userApi.getFollowingList(Principal.from(id))
      setUseridList(res)
    }
  }

  useEffect(() => {
    userApi.batchGetProfile(useridList).then(e => {
      setUsers(e)
    })
  }, [useridList]);

  useEffect(() => {
    init()
  }, [id, isFollowerList]);


  return <div className={"follow_main"}>
    {users.map((v, k) => {
      return <UserCard profile={v} key={k}/>
    })}
  </div>
})

const UserCard = React.memo(({profile}: { profile: Profile }) => {
  return <div className={"user_card"}>
    <img src={profile.avatar_url ? profile.avatar_url : "./img_5.png"} alt=""/>
    <div>
      <div className={"card_head"}>
        <div className={"user_info"}>
          <div className={"name"}>
            <p>{profile.name}</p>
            <p>{profile.handle}</p>
          </div>
        </div>
        <div className={"name"} style={{cursor: "pointerm m"}}>
          Following
        </div>
      </div>
      <div className={"des"}>
        Synapse - neuron manager (http://synapse.vote) CodeGov - project founder (http://codegov.org) Chemist by
        education; Analyzer Engineer by career
      </div>
    </div>
  </div>
})
