// this will hold the list of all the matches fetched from the backend

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AllFixturesApiResponse, AllFixturesReduxStoreInterface } from "@/app/apiSchemas/matcheSchemas";

const initialState : AllFixturesReduxStoreInterface = {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: true,
    data: [],
    isLoading: false,
    hasReachedEnd: false,
}

const allFixturesDataSlice= createSlice({
    name: "allFixturesData",
    initialState,
    reducers: {
        updateAllFixturesData: (state , action: PayloadAction<AllFixturesApiResponse>) => {
            state.page= action.payload.page
            state.limit= action.payload.limit
            state.total= action.payload.total
            state.total_pages= action.payload.total_page
            state.has_next_page= action.payload.has_next_page
            state.data= action.payload.data
        },
        appendFixturesData: (state, action : PayloadAction<AllFixturesApiResponse>) => {
            state.page= action.payload.page
            state.has_next_page= action.payload.has_next_page
            state.isLoading= false
            state.data= [...state.data, ...action.payload.data]

        },
        setLoadingState: (state)=> {
            state.isLoading= !state.isLoading
        }
    },
    extraReducers: (builder) => {}
})


export default allFixturesDataSlice.reducer;
export const {updateAllFixturesData,
    appendFixturesData,
    setLoadingState
}= allFixturesDataSlice.actions;