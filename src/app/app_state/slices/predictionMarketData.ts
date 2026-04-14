import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketSummary } from "@/app/api/predictionMarket";


export interface GroupMarket {
    id: number;
    market_type: "group";
    question: string;
    description: string;
    locks_at: string;
    resolution_date: string;
    resolution_source: string;
    total_collected: number;
    featured: boolean;
    category: string;
    resolved: boolean;
    sub_markets: GroupSubMarket[];
}

export interface GroupSubMarket {
    id: number;
    question: number;
    market_status: string;
    yes_price: number;
    no_price: number;
    total_collected: number;
    locks_at: string;
}

export interface PredictionMarket {
    id: number;
    market_type: "prediction";
    question: string;
    description: string;
    created_at: string;
    locks_at: string;
    resolution_date: string;
    resolution_source: string,
    total_collected: number,
    featured: boolean,
    category: string,
    market_status: string,
    yes_price: number,
    no_price: number,
    b: number,
}

// we will soon rewrite most of the logic to remove the parts we will not be using here on the frontend.
interface MatchPredictionMarket {
    id: number;
    market_type: "fixture";
    question: string;
    description: string;
    created_at: string;
    locks_at: string;
    resolution_date: string;
    resolution_source: string;
    total_collected: number;
    featured: boolean;
    category: string;
    market_status: string;
    home_team: string;
    away_team: string;
    fixture_id: number;
    home_price: number;
    draw_price: number;
    away_price: number;
    b: number;
}

export interface PredictionMarketState {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: true,
    data: (PredictionMarket | GroupMarket | MatchPredictionMarket)[]
    isLoading: boolean,
}

const initialState: PredictionMarketState = {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
    has_next_page: true,
    data: [],
    isLoading: false,
};

const predictionMarketSlice = createSlice({
    name: "predictionMarketData",
    initialState,
    reducers: {
        setMarkets: (state, action: PayloadAction<PredictionMarketState>) => {
            state.page = action.payload.page;
            state.limit = action.payload.limit;
            state.total = action.payload.total;
            state.total_pages = action.payload.total_pages;
            state.has_next_page = action.payload.has_next_page;
            state.data = action.payload.data;
            state.isLoading = action.payload.isLoading;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setSelectedCategory: (state, action: PayloadAction<string>) => {
           // state.selectedCategory = action.payload;  I dont we think we need this since we are rewriting everything.
        },
    },
});

export const { setMarkets, setLoading, setSelectedCategory } = predictionMarketSlice.actions;
export default predictionMarketSlice.reducer;
