import axios from "axios";

interface RefreshTokenResponse {
    access_token: string;
    token_type: string;
}

// import { AuthProvider } from "../context/authContext";
// import { useAuth } from "../context/authContext";
// useAuth()

// sconst {logout}= useAuth()

export const refreshAccessToken= async () /* Promise<RefreshTokenResponse> */ => {
    try {

        const refreshToken= localStorage.getItem('refresh_token')
        
        if (!refreshToken) {
            console.error(`an error occured: refresh token not found in localStorage`)
        }

        const response = await axios.post('http://localhost:8000/auth/token/refresh', null, {
            headers: {
            'Authorization': `Bearer ${refreshToken}`
            }
        });

        const newAccessToken= response.data.access_token

        localStorage.setItem('accessToken', newAccessToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        return newAccessToken

    } catch (error) {

        console.error('an error occured while sendind refresh token request', error)
        //logout() // if the authoraizatoin falls we log out the user out of the sytem once nad for all
    }
}