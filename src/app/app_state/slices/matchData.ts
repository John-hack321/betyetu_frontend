// this will hold the list of all the matches fetched from the backend

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AllFixturesApiResponse } from "@/app/apiSchemas/matcheSchemas";

const initialState : AllFixturesApiResponse = {
    page: 0,
    limit: 0,
    total: 0,
    total_page: 0,
    has_next_page: true,
    data: []
}

const allFixturesDataSlice= createSlice({
    name: "allFixturesData",
    initialState,
    reducers: {
        updateAllFixturesData: (state , action: PayloadAction<AllFixturesApiResponse>) => {
            return action.payload
        }
    },
    extraReducers: (builder) => {}
})


export default allFixturesDataSlice.reducer;
export const {updateAllFixturesData}= allFixturesDataSlice.actions;