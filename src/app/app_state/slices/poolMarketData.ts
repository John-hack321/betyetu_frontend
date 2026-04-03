import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchPoolStakesApiResponseInterface } from "@/app/apiSchemas/poolMarkets";

const initialState: FetchPoolStakesApiResponseInterface = {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: true,
    has_previous_page: false,
    isLoading: false,
    data: []
}

const poolMarketDataSlice = createSlice({
    name: "poolMarketData",
    initialState,
    reducers: {
        updatePoolMarketData: (state, action: PayloadAction<FetchPoolStakesApiResponseInterface>) => {
            state.page = action.payload.page
            state.limit = action.payload.limit
            state.total = action.payload.total
            state.total_pages = action.payload.total_pages
            state.has_next_page = action.payload.has_next_page
            state.has_previous_page = action.payload.has_previous_page
            state.isLoading = action.payload.isLoading
            state.data = action.payload.data
        }
    }
})

export const { updatePoolMarketData } = poolMarketDataSlice.actions
export default poolMarketDataSlice.reducer