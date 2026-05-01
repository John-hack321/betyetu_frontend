import axios from "axios";
import { PredictionMarket, PredictionMarketState } from "../app_state/slices/predictionMarketData";
import { RecentPredMktTradeActivity, RecentPredMktTradeActivityReturnType } from "../markets/[id]/page";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    console.log("DEBUG: Token exists:", !!token);
    console.log("DEBUG: Token length:", token?.length || 0);
    console.log("DEBUG: BASE_URL:", BASE_URL);
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface MarketSummary {
    id: number;
    question: string;
    description: string;
    category: string;
    market_status: string;
    yes_price: number;
    no_price: number;
    total_collected: number;
    locks_at: string | null;
    resolution_date: string | null;
    outcome: string | null;
}

export interface MarketsListResponse {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    data: MarketSummary[];
}

export interface MarketDetail {
    id: number;
    question: string;
    description: string;
    category: string;
    market_status: string;
    yes_price: number;
    no_price: number;
    yes_shares_issued: number;
    no_shares_issued: number;
    total_collected: number;
    trade_count: number;
    locks_at: string | null;
    resolution_date: string | null;
    resolution_source: string | null;
    outcome: string | null;
    outcome_notes: string | null;
}

export interface PricePoint {
    timestamp: string;
    yes_price: number;
    no_price: number;
    trade_type: string;
    side: string;
}

export interface BuyQuote {
    market_id: number;
    side: string;
    shares: number;
    cost_kes: number;
    yes_price_after: number;
    no_price_after: number;
}

export interface SellQuote {
    market_id: number;
    side: string;
    shares: number;
    payout_kes: number;
    yes_price_after: number;
    no_price_after: number;
}

export interface UserPosition {
    market_id: number;
    question: string;
    market_status: string;
    side: string;
    shares_held: number;
    total_cost: number;
    average_cost_per_share: number;
    current_price: number;
    current_value: number;
    unrealised_pnl: number;
    position_status: string;
    settled_payout: number | null;
}

// this one is self written
// do extensive error handing for this model
export const fetchMarkets = async (
    page: number =1,
    limit: number = 100,
    category?: string // though I don't think this should be here since all filtering should be done on the frontend
) : Promise<PredictionMarketState> => {
    try {
        const params: Record<string, string | number> = { page, limit };
        if (category) params.category = category;
        
        const response = await axios.get(`${BASE_URL}/prediction_markets/all_markets`, {
            params,
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            // Clear invalid token and redirect to login
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userData");
                window.location.href = "/login";
            }
            throw new Error("Authentication expired. Please login again.");
        }
        throw error;
    }
}

export const fetchActiveMarkets = async (
    page: number = 1,
    limit: number = 50,
    category?: string
): Promise<PredictionMarketState> => {
    const params: Record<string, string | number> = { page, limit };
    if (category) params.category = category;
    
    try {
        const response = await axios.get(`${BASE_URL}/prediction_markets/`, {
            params,
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            // Clear invalid token and redirect to login
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userData");
                window.location.href = "/login";
            }
            throw new Error("Authentication expired. Please login again.");
        }
        throw error;
    }
};


// don't forget to update these returns to only return data that is needed and block off any other that is not.
export interface PredictionMarketReturnType {
    type: "prediction";
    id: number;
    question: string;
    description: string;
    category: string;
    q_yes: number;
    q_no: number;
    p_yes: number;
    total_collected: number;
    locks_at: string;
    resolution_date: string;
    resolution_source: string;
    outcome: string;
    outcome_notes: string;
    admin_notes: string;
    featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface PredictionMarketPriceHistory {
    created_at: string;
    yes_price_at_trade: number;
    trade_type: string;
    side: string;
}

export interface PredictionMarketDetailReturn {
    market: PredictionMarketReturnType;
    price_history: PredictionMarketPriceHistory[];
}


export interface MatchPredictionMarketReturnType {
    type: "fixture";
    id: number;
    fixture_id: number;
    creator_id?: number | null;
    question: number;  
    description: string;
    category: string;
    q_home: number;
    q_draw: number;
    q_away: number;
    total_collected: number;
    market_status: string;
    locks_at: string;
    resolution_date: string;
    resolution_source: string;
    featured: boolean;
    created_at: string;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
}

export interface MatchPredictionMarketPriceHistory {
    created_at: string;
    home_price_at_trade: number;
    draw_price_at_trade: number;
    away_price_at_trade: number;
    trade_type: string;
    side: "home" | "draw" | "away"
}

export interface MatchPredictionMarketDetailReturn {
    market: MatchPredictionMarketReturnType;
    price_history: MatchPredictionMarketPriceHistory[];
}

export interface PredictionMarketGroupReturnType{
    type: "group";
}

export interface PredictionMarketGroupPriceHistory {}

export interface PredictionMarketGroupDetailReturn {
    market: PredictionMarketGroupReturnType
    price_histoy: PredictionMarketGroupPriceHistory[]
}

export const fetchMarketDetail = async (marketId: number, market_type: string): Promise<PredictionMarketDetailReturn | MatchPredictionMarketDetailReturn | PredictionMarketGroupDetailReturn> => {
    const response = await axios.get(`${BASE_URL}/prediction_markets/${marketId}?market_type=${market_type}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};


export const fetchPredMktRecentTradeData = async (
    market_id: number
) : Promise<RecentPredMktTradeActivityReturnType> => {
    const respoonse = await axios.get(`${BASE_URL}/prediction_markets/recent_activity/${market_id}`, {
        headers: getAuthHeaders(),
    });
    return respoonse.data;
}



export const fetchPriceHistory = async (
    marketId: number,
    limit: number = 100
): Promise<PricePoint[]> => {
    const response = await axios.get(`${BASE_URL}/prediction_markets/${marketId}/price_history`, {
        params: { limit },
        headers: getAuthHeaders(),
    });
    return response.data;
};

// but what a favout is it to be alble to build it from scratch at the same time too .
export const fetchBuyQuote = async (
    marketId: number,
    side: string,
    shares: number
): Promise<BuyQuote> => {
    const response = await axios.get(`${BASE_URL}/prediction_markets/${marketId}/quote/buy`, {
        params: { side, shares },
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const fetchSellQuote = async (
    marketId: number,
    side: string,
    shares: number
): Promise<SellQuote> => {
    const response = await axios.get(`${BASE_URL}/prediction_markets/${marketId}/quote/sell`, {
        params: { side, shares },
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const executeBuy = async (
    marketId: number,
    side: string,
    shares: number
): Promise<unknown> => {
    const response = await axios.post(
        `${BASE_URL}/prediction_markets/buy`,
        { market_id: marketId, side, shares },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

export const executeSell = async (
    marketId: number,
    side: string,
    shares: number
): Promise<unknown> => {
    const response = await axios.post(
        `${BASE_URL}/prediction_markets/sell`,
        { market_id: marketId, side, shares },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

export const fetchMyPositions = async (): Promise<UserPosition[]> => {
    const response = await axios.get(`${BASE_URL}/prediction_markets/my/positions`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

