import {configureStore} from "@reduxjs/toolkit";
import allData from "./features/AllData"


const store = configureStore({
  reducer: {
    allData
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store | any>;
export type AppDispatch = typeof store.dispatch;
export default store
