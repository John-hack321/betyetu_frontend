import axios from 'axios';

import { CurrentStakeData, StakeInitiatorPayload, StakeJoiningPayload, FetchStakeDataPayload } from '../apiSchemas/stakingSchemas';
import { access } from 'fs';
import { error } from 'console';
import { promise } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';


export interface StakeConnectionData {
    inviteCode : string;
}

export interface StakeInitializationResponse {
    statusCode: number;
    inviteCode: string;
}

export interface StakeJoiningApiResponse {
    statusCode: string;
    details: string;
}

export interface InsuficientAccountBalanceResponse {
    status_code: string;
    detail: string;
}

export const initializeStakeApiCall = async (payload : StakeInitiatorPayload): Promise<StakeInitializationResponse | null> => {
    try {
        const accessToken= localStorage.getItem('token');
        if (!accessToken) {
            throw new Error(`an error occured while fetching the access token from local storage`)
        }

        const response: StakeInitializationResponse = await axios.post(`${API_BASE_URL}/stakes/initiate_stake`,payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        return response

    } catch (err) {
        console.log(`an error occured while making the initialize stake api call ${err}`)
        return null;
    }
}


// figure out how the paylaod is placed in a get request
export const guestFetchStakeDataApiCall= async (payload: FetchStakeDataPayload)=> {
    try{
        const accessToken= localStorage.getItem('token')
        if (!accessToken) {
            throw new Error(`failed to fetch token from local storage: __guestFetchStakeDataApicall `)
        }

        const response= axios.get(`${API_BASE_URL}/stakes/get_stake_data`,{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        } )

    } catch (err) {
        console.log(`an error occred: __guestFetchStakeDataApiCall detail: ${err}`)
    }
}

export const guestStakePlacementApiCall= async (payload: StakeJoiningPayload)=> {
    try{
        const accessToken= localStorage.getItem('token')
        if (!accessToken) {
            throw new Error(`an error occured while fetching access token from local storage`)
        }

        const response: StakeJoiningApiResponse= await axios.post(`${API_BASE_URL}/stakes/place_guest_bet`)
        return response;
    } catch (err) {
        console.log(`an error occred: __joinStakeApiCall: detail : ${err}`)
    }
}