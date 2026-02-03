import { AllFixturesApiResponse } from "@/app/apiSchemas/matcheSchemas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchPublicStakesApiResponseInterface } from "@/app/apiSchemas/stakingSchemas";

const initialState: FetchPublicStakesApiResponseInterface = {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
    isLoading:false,
    data: [],
}

const publicStakesDataSlice= createSlice({
    name: "publicStakesData",
    initialState,
    reducers: {
        updatePublicStakesData: (state, action : PayloadAction<FetchPublicStakesApiResponseInterface>) => {
            state.page= action.payload.page
            state.limit= action.payload.limit
            state.total= action.payload.total
            state.total_pages= action.payload.total_pages
            state.has_next_page= action.payload.has_next_page
            state.has_previous_page= action.payload.has_previous_page
            state.data= action.payload.data
        },

        appendPublicStakesData: (state, action: PayloadAction<FetchPublicStakesApiResponseInterface>)=> {
            state.page= action.payload.page
            state.has_next_page= action.payload.has_next_page
            state.has_previous_page= action.payload.has_previous_page
            state.isLoading= false
            state.data= [...state.data , ...action.payload.data]
        },

        setLoadingState: (state)=> {
            state.isLoading= !state.isLoading;
        }
    }, 
    extraReducers: (builder)=> {}
})

export default publicStakesDataSlice.reducer;
export const {
    updatePublicStakesData,
    appendPublicStakesData,
    setLoadingState,
} = publicStakesDataSlice.actions;