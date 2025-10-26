import axios from 'axios';

import { CurrentStakeData, StakeInitiatorPayload } from '../apiSchemas/stakingSchemas';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';


export interface StakeConnectionData {
    code : string;
}

export interface StakeInitializationResponse {
    status: string;
    message: string;
    data: StakeConnectionData
}



export const initializeStakeApiCall = async (payload : StakeInitiatorPayload): Promise<StakeInitializationResponse | null > => {
    try {
        const accessToken= localStorage.getItem('token');
        if (!accessToken) {
            throw new Error(`an error occured while fetching the access token from local storage`)
        }

        const response : StakeInitializationResponse = await axios.post(`${API_BASE_URL}/stakes/initiate_stake`,payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        return response;

    } catch (err) {
        console.log(`an error occured while making the initialize stake api call ${err}`)
        return null;
    }
}