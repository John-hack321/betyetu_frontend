import axios from 'axios';

import { CurrentStakeData, StakeInitiatorPayload, StakeJoiningPayload, FetchStakeDataPayload } from '../apiSchemas/stakingSchemas';
import { access } from 'fs';
import { error } from 'console';
import { promise } from 'zod';
import { StakeInterface } from '../app_state/slices/stakesData';

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

export interface StakeCancellationResponse {
    statusCode: number;
    message: string;
}

export const initializeStakeApiCall = async (payload : StakeInitiatorPayload): Promise<StakeInitializationResponse | null> => {
    try {
        const accessToken= localStorage.getItem('token');
        if (!accessToken) {
            throw new Error(`an error occured while fetching the access token from local storage`)
        }

        const response = await axios.post(`${API_BASE_URL}/stakes/initiate_stake`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const data: StakeInitializationResponse = response.data;
        
        console.log('Received from backend:', data);
        
        return data;

    } catch (err) {
        console.error(`Error in initializeStakeApiCall:`, err);
        if (axios.isAxiosError(err)) {
            console.error('Response error:', err.response?.data);
            console.error('Status:', err.response?.status);
        }
        return null;
    }
}

export interface StakeOwner {
    stakeAmount: number;
    stakePlacement: string;
}

export interface StakeGuest {
    stakeAmount: number;
    stakePlacemnt: string;
}
export interface GuestFetchStakeDataApiResponse {
    matchId: number;
    stakeId: number;
    homeTeam: string;
    awayTeam: string;
    stakeOwner: StakeOwner;
    stakeGuest: StakeGuest;
}

// figure out how the paylaod is placed in a get request
// the payload for this will be the invite code which is a string
export const guestFetchStakeDataApiCall= async (inviteCode: string): Promise<GuestFetchStakeDataApiResponse | null> => {
    try{
        const accessToken= localStorage.getItem('token')
        if (!accessToken) {
            throw new Error(`failed to fetch token from local storage: __guestFetchStakeDataApicall `)
        }

        const response= await axios.get(`${API_BASE_URL}/stakes/get_stake_data`,{
            params: {
                invite_code: inviteCode,
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        } )

        const data: GuestFetchStakeDataApiResponse= await response.data // dont forget to parse this data before passing it to the redux store fist

        return data

    } catch (err) {
        console.log(`an error occred: __guestFetchStakeDataApiCall detail: ${err}`)
        return null
    }
}

export interface GuestStakePlacementResponse {
    status: number;
    message: string;
}
export const guestStakePlacementApiCall= async (payload: StakeJoiningPayload): Promise<GuestStakePlacementResponse | null> => {
    try{
        const accessToken= localStorage.getItem('token')
        if (!accessToken) {
            throw new Error(`an error occured while fetching access token from local storage`)
        }

        const response= await axios.post(`${API_BASE_URL}/stakes/join_initiated_stake`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })
        
        const data: GuestStakePlacementResponse | null= await response.data
        
        return data

    } catch (err) {
        console.log(`an error occred: __joinStakeApiCall: detail : ${err}`)
        return null
    }
}



export const cancelStakePlacementApiCall= async (payload: string): Promise<StakeCancellationResponse | null> => {
    try {
        const accessToken= localStorage.getItem('token')
        if (!accessToken) {
            throw new Error(`no access Token find in the local storage in the browser`)
        }

        const response= await axios.post(`${API_BASE_URL}/stakes/cancel_stake`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const data: StakeCancellationResponse= await response.data

        return data

    } catch (err) {
        console.log(`an error occured while cancelling stake in the backend ${err}`)
        return null
    }
}


export const getUserStakesData= async (): Promise<StakeInterface[] | null> => {
    try {
        const accessToken= localStorage.getItem('token')
        if (!accessToken) {
            throw new Error(`no access token found in local storage`)
        }

        const response= await axios.get(`${API_BASE_URL}/stakes/get_user_stakes`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const data: StakeInterface[]= await response.data

        return data // this is the list of the stakes returned from the backend

    } catch (err) {
        console.log(`an error occured while trying to fetch user stakes data`)
        return null
    }
}