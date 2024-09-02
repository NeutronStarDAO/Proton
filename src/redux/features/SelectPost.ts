import {createSlice} from "@reduxjs/toolkit"
import {RootState} from "../store"
import {useAppSelector} from "../hook"
import {CommentTreeNode, Post} from "../../declarations/feed/feed";
import {Profile} from "../../declarations/user/user";

type init = {
  post?: Post,
  CommentTree?: CommentTreeNode[]
  profiles?: Profile[]
}

const initialState: init = {}
export const selectPostSlice = createSlice({
  name: "selectPost",
  initialState,
  reducers: {
    update: (state, action: { type: string, payload: init }) => {
      if (action.payload.post === undefined && action.payload.CommentTree === undefined && action.payload.profiles === undefined) {
        return {}
      }
      return {...state, ...action.payload}
    }
  },
})

const {update} = selectPostSlice.actions
const selectPost = (state: RootState) => state.selectPost
export const updateSelectPost = async (result: init) => {
  const store = await (await import("../store")).default
  store.dispatch(update(result))
}
export const useSelectPostStore = (): init => useAppSelector(selectPost)
export default selectPostSlice.reducer
