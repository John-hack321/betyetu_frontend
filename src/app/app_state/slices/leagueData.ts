import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeagueInterface } from "@/app/api/leagues";

interface AvailableLeagueDataInterface {
    leagues_list: LeagueInterface[];
}

const initialState: AvailableLeagueDataInterface= {
    leagues_list: [],
}

const leagueDataSlice= createSlice({
    name: "leagueData",
    initialState,
    reducers: {
        updateLeagueData: (state, action: PayloadAction<LeagueInterface[]>) => {
            state.leagues_list= action.payload
        }
    },
    extraReducers: (buider)=> {}
})

export default leagueDataSlice.reducer;
export const {updateLeagueData}= leagueDataSlice.actions;