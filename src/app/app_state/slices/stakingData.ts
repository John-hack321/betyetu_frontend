import { CurrentStakeData } from "@/app/apiSchemas/stakingSchemas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MatchIdAndPlacement } from "@/app/apiSchemas/stakingSchemas";

const initialState : CurrentStakeData = {
    placement: "",
    amount: 0,
    userId: 0,
    matchId: 0,
}

const currentStakeSlice= createSlice({
    name: "currentStakeData",
    initialState,
    reducers: {
        updateMatchIdAndPlacement: (state , action: PayloadAction<MatchIdAndPlacement>) => {
            state.matchId = action.payload.matchId;
            state.placement = action.payload.placement;
        },
        updateUserIdAndAmount: (state, action: PayloadAction<CurrentStakeData>) => {
            state.userId = action.payload.userId;
            state.placement = action.payload.placement;
        }
    },
    extraReducers: (builder) => {

    }
})

export default currentStakeSlice.reducer;
export const {updateMatchIdAndPlacement, updateUserIdAndAmount}= currentStakeSlice.actions;