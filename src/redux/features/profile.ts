import {createSlice} from "@reduxjs/toolkit"
import {RootState} from "../store"
import {useAppSelector} from "../hook"
import {Profile} from "../../declarations/user/user"


const initialState = {}
export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    update: (state, action: { type: string, payload: Profile }) => {
      return action.payload
    },
  },
})

const {update} = profileSlice.actions
const profile = (state: RootState) => state.profile
export const updateProfile = async (result: Profile) => {
  const store = await (await import("../store")).default
  store.dispatch(update(result))
}
export const useProfileStore = (): Profile => useAppSelector(profile)
export default profileSlice.reducer