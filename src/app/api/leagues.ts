import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

export interface popularLeagues {
    id : number;
    name : string;
    localizedName : string;
    logoUrl : string;
    fixtureAdded : boolean;
}

const get_popular_leagues = async (): Promise<popularLeagues[] | null> => {
    try {
        const accessToken = localStorage.getItem('token')

        if (!accessToken) {
            throw new Error(`failed to fetch accesstoken from the local storage`)
        }

        const response : popularLeagues[] = await axios.get(`${API_BASE_URL}/leagues/available`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        return response
    }catch (err) {
        console.error(`an error occured while trying to fetch popular leagues`)
        return null;
    }
}