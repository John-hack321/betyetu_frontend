// src/app/api/users.ts
import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

/**
 * Fetches the authenticated user's profile data from the backend
 * @returns Promise containing the user's profile data
 * @throws {Error} If the request fails or the user is not authenticated
 */

// src/types/index.ts
export interface UserProfileResponse {
    username: string;
    email: string;
    phone: string;
    account_balance: number;
}

// You can add more types here as your application grows


export const fetchUserProfile = async (): Promise<UserProfileResponse> => {
    try {
        const accessToken = localStorage.getItem('token');
        
        if (!accessToken) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;

    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        
        // Handle specific error cases
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                // Handle unauthorized (token expired/invalid)
                // You might want to redirect to login here
                throw new Error('Session expired. Please log in again.');
            } else if (error.response?.status === 404) {
                throw new Error('User not found');
            }
        }
        
        // Re-throw with a generic error message
        throw new Error('Failed to fetch user data. Please try again later.');
    }
};


export const doTransaction = async (amount : number , transaction_type : number) => {
    console.log('do transaction has started here')
    try{
        const accessToken = localStorage.getItem('token')
    if (!accessToken){
        throw new Error('No authentication token found')
    }

    const payload = {
        'amount' : amount,
        'transaction_type' : transaction_type,
    }

    console.log('the access token has been found')
    const response = await axios.post(`${API_BASE_URL}/transactions` , payload , {
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    console.log("response has been sent")

    return response.data; 

    }catch (error) {
        console.error("failed to complete the transaction")

        if (axios.isAxiosError(error)){
            if (error.response?.status === 401){
                // this is for the errors related to the token not being valid or being expired 
                throw new Error('there is a problem with the token access token')
            }
        }
    }
    throw new Error('failed to complete the transaction')
}