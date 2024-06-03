import {createSlice} from "@reduxjs/toolkit"
import {RootState} from "../store"
import {useAppSelector} from "../hook"
import {Post} from "../../declarations/feed/feed";


const initialState: Post | {} = {}
export const selectPostSlice = createSlice({
  name: "selectPost",
  initialState,
  reducers: {
    update: (state, action: { type: string, payload: Post | {} }) => {
      return action.payload
    }
  },
})

const {update} = selectPostSlice.actions
const selectPost = (state: RootState) => state.selectPost
export const updateSelectPost = async (result: Post | {}) => {
  const store = await (await import("../store")).default
  store.dispatch(update(result))
}
export const useSelectPostStore = (): Post | {} => useAppSelector(selectPost)
export default selectPostSlice.reducer
