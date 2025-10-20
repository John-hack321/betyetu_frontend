// this file will hold our redux store 

import {configureStore} from "@reduxjs/toolkit";
import userDataReducer from "./slices/userData"
import allFixturesDataReducer from "./slices/matchData"
import  currentStakeDataReducer  from "./slices/stakingData"

export const store = configureStore({
    reducer : {
        userData: userDataReducer,
        allFixturesData: allFixturesDataReducer,
        currentStakeDAta: currentStakeDataReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


// and just like that we will have created our redux store