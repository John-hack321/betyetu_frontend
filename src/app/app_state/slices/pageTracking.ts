import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// this is for tracking what page we currently are on for the sake of the navbar at the bottom
export interface  CurrentPage {
    page: string
}

const initialState = {
    page: ""
}

const currentPageSlice= createSlice({
    name: "currentPageData",
    initialState,
    reducers: {
        updateCurrentPage: (state, action: PayloadAction<string>)=> {
            state.page= action.payload
        },
    }
})


export default currentPageSlice.reducer;
export const {updateCurrentPage}= currentPageSlice.actions;