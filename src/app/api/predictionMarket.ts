import axios from "axios";

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

export const fetchActiveMarkets = async (
    page: number = 1,
    limit: number = 50,
    category?: string
): Promise<MarketsListResponse> => {
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

export const fetchMarketDetail = async (marketId: number): Promise<MarketDetail> => {
    const response = await axios.get(`${BASE_URL}/prediction_markets/${marketId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

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

