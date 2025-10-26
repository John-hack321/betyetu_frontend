import { invitedStakeDataApiResponse } from "@/app/apiSchemas/stakingSchemas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InvitedStakeDataInterface {
    stakeId: number
    home: string
    away: string
    inviterPlacement: string
    inviterStakeAmount: number
    inviteePlacement: string
    inviteeAmount: number
}

const initialState: InvitedStakeDataInterface= {
    stakeId: 0,
    home: "",
    away: "",
    inviterPlacement: "",
    inviterStakeAmount: 0,
    inviteePlacement: "",
    inviteeAmount: 0,
}

const invitedStakelice= createSlice({
    name: "invitedStakeData",
    initialState,
    reducers: {
        updateInvitedStakeSliceWithInviterData: (state, action: PayloadAction<invitedStakeDataApiResponse>)=> {
            state.home= action.payload.home
            state.away= action.payload.away
            state.stakeId= action.payload.stakeId
            state.inviterPlacement= action.payload.inviterPlacement
            state.inviterStakeAmount= action.payload.inviterStakeAmount
        },

        updateInvitedStakeSliceWtihInviteeStakeData: (state, action: PayloadAction<{inviteePlacement: string, inviteeStakeAmount: number}>)=> {
            state.inviteeAmount= action.payload.inviteeStakeAmount
            state.inviteePlacement= action.payload.inviteePlacement
        },
    },
    extraReducers: (builder)=> {}
})

export default invitedStakelice.reducer;
export const {updateInvitedStakeSliceWithInviterData,
     updateInvitedStakeSliceWtihInviteeStakeData} = invitedStakelice.actions;