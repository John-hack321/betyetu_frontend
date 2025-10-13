import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

import { AllFixturesApiResponse , Fixture } from '../apiSchemas/matcheSchemas';

export const fetchAllFixtures = async (): Promise<AllFixturesApiResponse | null> => {
    try {
        const accessToken = localStorage.getItem('token');
        if (!accessToken) {
            throw new Error("No authentication token found");
        }

        const response = await axios.get(`${API_BASE_URL}/fixtures/`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const response_data : AllFixturesApiResponse = response.data
        
        console.log('API Response:', response);
        return response_data;
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return null;
    }
}

// we will decicde soon on whether this is the optimal way of doing this or if we can just sort the general fixture
// data based on the league id
export const fetchFixturesByLeagueId = async (leagueId : number): Promise<Fixture[] | null> => {
    try{
        const accessToken = localStorage.get('token')

        if (!accessToken) {
            throw new Error(`no access token was found`) 
            // TODO : i believe on the event of lack of an access token the system should have already logged out the user
        }

        const payload = {
            'leagueId' : leagueId
        }

        // find a way to attach the league payload to the get request and send it to the backend
        const response : Fixture[] = await axios.get(`${API_BASE_URL}/fixtures/fixtures_by_leagues`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        return response;
    }catch(err) {
        console.log(`an unexpected error occured while fetchig fixtures based on league id ${err}`)
        return null;
    }
}
