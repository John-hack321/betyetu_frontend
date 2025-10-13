// this file will hold our redux store 

import {configureStore} from "@reduxjs/toolkit";
import userProfileDataReducer from "./userData/LoginDataSlice"

export const store = configureStore({
    reducer : {
        userProfileData: userProfileDataReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


// and just like that we will have created our redux store