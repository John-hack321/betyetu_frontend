import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

export interface LeagueInterface {
    id : number;
    name : string;
    localizedName : string;
    logoUrl : string;
    fixtureAdded : boolean;
}

export const getAvailableLeagues = async (): Promise<LeagueInterface[] | null> => {
    try {
        const accessToken = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') 
        : null;

        if (!accessToken) {
            throw new Error(`failed to fetch accesstoken from the local storage`)
        }

        const response  = await axios.get(`${API_BASE_URL}/leagues/available`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const responseData: LeagueInterface[]= response.data
        return responseData
    }catch (err) {
        console.error(`an error occured while trying to fetch popular leagues`)
        return null;
    }
}