import {createSlice} from "@reduxjs/toolkit"
import {RootState} from "../store"
import {useAppSelector} from "../hook"
import {Principal} from "@dfinity/principal";


type followType = {
  followers?: Principal[],
  followings?: Principal[]
}

const initialState: followType = {}
export const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    update: (state, action: { type: string, payload: followType }) => {
      return {...state, ...action.payload}
    },
  },
})

const {update} = followSlice.actions
const follow = (state: RootState) => state.follow
export const updateFollow = async (result: followType) => {
  const store = await (await import("../store")).default
  store.dispatch(update(result))
}
export const useFollowStore = (): followType => useAppSelector(follow)
export default followSlice.reducer
