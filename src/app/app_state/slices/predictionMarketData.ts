import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketSummary } from "@/app/api/predictionMarket";

export interface PredictionMarketState {
    markets: MarketSummary[];
    page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    isLoading: boolean;
    selectedCategory: string;
}

const initialState: PredictionMarketState = {
    markets: [],
    page: 1,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    isLoading: false,
    selectedCategory: "all",
};

const predictionMarketSlice = createSlice({
    name: "predictionMarketData",
    initialState,
    reducers: {
        setMarkets: (state, action: PayloadAction<{
            markets: MarketSummary[];
            page: number;
            total: number;
            total_pages: number;
            has_next_page: boolean;
        }>) => {
            state.markets = action.payload.markets;
            state.page = action.payload.page;
            state.total = action.payload.total;
            state.total_pages = action.payload.total_pages;
            state.has_next_page = action.payload.has_next_page;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },
    },
});

export const { setMarkets, setLoading, setSelectedCategory } = predictionMarketSlice.actions;
export default predictionMarketSlice.reducer;
