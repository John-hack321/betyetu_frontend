import { CurrentStakeData } from "@/app/apiSchemas/stakingSchemas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MatchIdAndPlacement } from "@/app/apiSchemas/stakingSchemas";

const initialState : CurrentStakeData = {
    placement: "",
    amount: 0,
    matchId: 0,
    homeTeam: "",
    awayTeam: "",
}

const currentStakeSlice= createSlice({
    name: "currentStakeData",
    initialState,
    reducers: {
        /**
         * in the update we also update the hometeam and awayteam 
         */
        updateMatchIdAndPlacement: (state , action: PayloadAction<MatchIdAndPlacement>) => {
            state.matchId= action.payload.matchId;
            state.placement= action.payload.placement;
            state.homeTeam= action.payload.homeTeam;
            state.awayTeam= action.payload.awayTeam;
        },
        updateAmount: (state, action: PayloadAction<CurrentStakeData>) => {
            state.placement = action.payload.placement;
        }
    },
    extraReducers: (builder) => {
    }
})

export default currentStakeSlice.reducer;
export const {updateMatchIdAndPlacement, updateAmount}= currentStakeSlice.actions;