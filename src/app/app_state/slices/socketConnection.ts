import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketData{
    SocketConnected: boolean;
}

const initialState: SocketData = {
    SocketConnected: false,
}

const socketConnectionSlice= createSlice({
    name: 'socketConnectionStatus',
    initialState,
    reducers: {
        updateSocketConnecton: (state) => {
            state.SocketConnected= !state.SocketConnected
        }
    }
})

export default socketConnectionSlice.reducer;
export const {updateSocketConnecton}= socketConnectionSlice.actions;