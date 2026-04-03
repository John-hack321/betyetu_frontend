import { FetchPoolStakesApiResponseInterface } from "../apiSchemas/poolMarkets";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

export const fetchPoolStakes = async (page: number = 1, limit: number = 100) : Promise<FetchPoolStakesApiResponseInterface> => {
    try {
        
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const response = await axios.get(`${API_BASE_URL}/pool_stakes/get_all_pool_stakes`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                page,
                limit
            }
        });

        const responseData: FetchPoolStakesApiResponseInterface = response.data;

        return responseData;

    } catch (error) {
        console.error('Failed to fetch pool stakes:', error);

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                // Handle unauthorized (token expired/invalid)
                // You might want to redirect to login here
                throw new Error('Session expired. Please log in again.');
            } else if (error.response?.status === 404) {
                throw new Error('Pool stakes not found');
            }
        }
        
        // Re-throw with a generic error message
        throw new Error('Failed to fetch pool stakes. Please try again later.');
    }
}