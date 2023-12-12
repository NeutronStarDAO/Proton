import {createSlice} from "@reduxjs/toolkit"
import {RootState} from "../store";
import {useAppSelector} from "../hook";
import {PostImmutable} from "../../declarations/feed/feed";

type data = {
  allPost?: PostImmutable[],//自己发的
  allFeed?: PostImmutable[]//推流过来的
}

const initialState: data = {}
export const allDataSlice = createSlice({
  name: "allData",
  initialState,
  reducers: {
    update: (state, action: { type: string, payload: data }) => {
      return {...state, ...action.payload}
    },
  },
})

const {update} = allDataSlice.actions
const allData = (state: RootState) => state.allData
export const updateAllData = async (result: data) => {
  const store = await (await import("../store")).default
  store.dispatch(update(result))
}
export const useAllDataStore = (): data => useAppSelector(allData)
export default allDataSlice.reducer
