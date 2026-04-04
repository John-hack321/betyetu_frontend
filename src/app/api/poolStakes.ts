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

export interface PoolStakeJoiningPayload{
    userStakeAmount: number;
    userStakeChoice: "home" | "away" | "draw";
    poolStakeId: number;
}

export const userJoinPoolStake = async (payload: PoolStakeJoiningPayload) => {
    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const response = await axios.post(`${API_BASE_URL}/pool_stakes/user_join_pool_stake`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;

    } catch (error) {
        console.error('Failed to join pool stake:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail;

            switch (status) {
                case 401:
                    throw new Error('Session expired. Please log in again.');
                case 403:
                    throw new Error('You are not authorized to join this pool stake.');
                case 404:
                    throw new Error('Pool stake not found.');
                case 423:
                    // Handle your specific locked stake error
                    throw new Error(detail || 'Stake is locked and cannot be joined.');
                case 400:
                    throw new Error(detail || 'Invalid request. Please check your stake details.');
                case 422:
                    throw new Error(detail || 'Invalid stake amount or choice.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(detail || 'Failed to join pool stake. Please try again later.');
            }
        }
        
        // Handle non-axios errors
        throw new Error('Network error. Please check your connection and try again.');
    }
}