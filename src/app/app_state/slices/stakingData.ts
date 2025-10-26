import { CurrentStakeData } from "@/app/apiSchemas/stakingSchemas";
import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState : CurrentStakeData = {
    matchId: 0,
    stakeId: 0,
    homeTeam: "",
    awayTeam: "",
    stakeOwner: {stakeAmount: 0, stakePlacement: ""},
    stakeGuest: {stakeAmount: 0, stakePlacement: ""},
}

const currentStakeSlice= createSlice({
    name: "currentStakeData",
    initialState,
    reducers: {
        /**s
         * in the update we also update the hometeam and awayteam 
         */
        addOwnerMatchIdAndPlacemntToCurrentStakeData: (state, action: PayloadAction<{matchId: number, placement: string, home: string, away: string}>)=> {
            if (!state.stakeOwner) {
                state.stakeOwner= {stakeAmount: 0, stakePlacement: ""}
            }

            state.matchId= action.payload.matchId
            state.stakeOwner.stakePlacement= action.payload.placement
            state.homeTeam= action.payload.home
            state.awayTeam= action.payload.away
        },
        updateOwnerPlacementOnCurrentStakeData: (state, action: PayloadAction<string>)=> {
            state.stakeOwner.stakePlacement= action.payload
        },
        updateOwnerStakeAmountOnCurrentStakeData: (state, action: PayloadAction<number>)=> {
            state.stakeOwner.stakeAmount= action.payload
        }
    },
    extraReducers: (builder) => {
    }
})

export default currentStakeSlice.reducer;
export const {addOwnerMatchIdAndPlacemntToCurrentStakeData,
    updateOwnerPlacementOnCurrentStakeData,
    updateOwnerStakeAmountOnCurrentStakeData
}= currentStakeSlice.actions;
