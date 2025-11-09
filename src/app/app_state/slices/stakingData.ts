import { CurrentStakeData } from "@/app/apiSchemas/stakingSchemas";
import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState : CurrentStakeData = {
    matchId: 0,
    stakeId: 0,
    homeTeam: "",
    awayTeam: "",
    ownerStakeAmount: 0,
    ownerStakeplacement: "",
    guestStakeAmount: 0,
    guestStakePlacement: "",
}

const currentStakeSlice= createSlice({
    name: "currentStakeData",
    initialState,
    reducers: {
        /**s
         * in the update we also update the hometeam and awayteam 
         */
        guestSetCurrentStakeData: (state, action: PayloadAction<CurrentStakeData>)=> {
            state.stakeId= action.payload.stakeId
            state.matchId= action.payload.matchId
            state.homeTeam= action.payload.homeTeam
            state.awayTeam= action.payload.awayTeam
            state.ownerStakeAmount= action.payload.ownerStakeAmount
            state.ownerStakeplacement= action.payload.ownerStakeplacement
        },

        addOwnerMatchIdAndPlacemntToCurrentStakeData: (state, action: PayloadAction<{matchId: number, placement: string, home: string, away: string}>)=> {
    
            state.matchId= action.payload.matchId
            state.ownerStakeplacement= action.payload.placement
            state.homeTeam= action.payload.home
            state.awayTeam= action.payload.away
        },
        updateOwnerPlacementOnCurrentStakeData: (state, action: PayloadAction<string>)=> {
            state.ownerStakeplacement= action.payload
        },
        updateOwnerStakeAmountOnCurrentStakeData: (state, action: PayloadAction<number>)=> {
            state.ownerStakeAmount= action.payload
        },
        updateGuestStakePlacementOnCurrentStakeData: (state, action: PayloadAction<string>)=> {
            state.guestStakePlacement= action.payload
        },
        updateGuestStakeAmountOnCurrentStakeData: (state, action: PayloadAction<number>)=> {
            state.guestStakeAmount= action.payload
        },
        resetCurrentStakeData: (state)=> initialState,
    },
    extraReducers: (builder) => {
    }
})

export default currentStakeSlice.reducer;
export const {addOwnerMatchIdAndPlacemntToCurrentStakeData,
    updateOwnerPlacementOnCurrentStakeData,
    updateOwnerStakeAmountOnCurrentStakeData,
    updateGuestStakeAmountOnCurrentStakeData,
    updateGuestStakePlacementOnCurrentStakeData,
    resetCurrentStakeData,
    guestSetCurrentStakeData
}= currentStakeSlice.actions;
