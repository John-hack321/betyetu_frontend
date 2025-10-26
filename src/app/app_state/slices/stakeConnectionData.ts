import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Playball } from "next/font/google";



interface StakeConnectionData {
    inviteCode: string;
}

const initialState : StakeConnectionData = {
    inviteCode: "",
}

const stakeConnectionSlice= createSlice({
    name: "stakeConnectionData",
    initialState,
    reducers: {
        updateInviteCode: (state, action: PayloadAction<string>)=> {
            state.inviteCode= action.payload;
        }
    },
    extraReducers: (builder)=> {}
})

export default stakeConnectionSlice.reducer;