import { CurrentStakeData } from "@/app/apiSchemas/stakingSchemas";
import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Updated interface with new flag
interface CurrentStakeDataExtended extends CurrentStakeData {
    isJoiningPublicStake?: boolean;
}

const initialState : CurrentStakeDataExtended = {
    matchId: 0,
    stakeId: 0,
    homeTeam: "",
    awayTeam: "",
    ownerStakeAmount: 0,
    ownerStakeplacement: "",
    guestStakeAmount: 0,
    guestStakePlacement: "",
    isJoiningPublicStake: false, // NEW: Track if joining public stake
}

const currentStakeSlice= createSlice({
    name: "currentStakeData",
    initialState,
    reducers: {
        /**
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

        /**
         * NOTE  : any redundancies and inconcistencies of the function will be solved later on , for now we just build 
         * the function below is for users joining public stakes only
         */
        guestSetCurrentStakeDataWhenJoiningPublicStake: (state, action: PayloadAction<CurrentStakeData>)=> {
            state.stakeId= action.payload.stakeId
            state.matchId= action.payload.matchId
            state.homeTeam= action.payload.homeTeam
            state.awayTeam= action.payload.awayTeam
            state.ownerStakeAmount= action.payload.ownerStakeAmount
            state.ownerStakeplacement= action.payload.ownerStakeplacement
            state.guestStakeAmount= action.payload.ownerStakeAmount // we are doing this to ensure the guest and owner stake amounts are always the same
            state.guestStakePlacement= action.payload.guestStakePlacement
            state.isJoiningPublicStake = true // NEW: Set flag when joining public stake
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
        // NEW: Set the public stake joining flag
        setIsJoiningPublicStake: (state, action: PayloadAction<boolean>) => {
            state.isJoiningPublicStake = action.payload
        },
        resetCurrentStakeData: (state)=> {
            return initialState // This will also reset isJoiningPublicStake to false
        },
    },
    extraReducers: (builder) => {
    }
})

export default currentStakeSlice.reducer;
export const {
    addOwnerMatchIdAndPlacemntToCurrentStakeData,
    updateOwnerPlacementOnCurrentStakeData,
    updateOwnerStakeAmountOnCurrentStakeData,
    updateGuestStakeAmountOnCurrentStakeData,
    updateGuestStakePlacementOnCurrentStakeData,
    resetCurrentStakeData,
    guestSetCurrentStakeData,
    guestSetCurrentStakeDataWhenJoiningPublicStake,
    setIsJoiningPublicStake, // NEW: Export the new action
}= currentStakeSlice.actions;