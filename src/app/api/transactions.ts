import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';


export interface DepositInitiationPayload {
    amount: number;
    transaction_type: number;
}

export interface WithdrawalInitiationPayload {
    amount: number;
    transaction_type: number;
}

export const depositMoneyApiCall= async (amount: number, transactionType: number) => {
    try{
        const accessToken= localStorage.getItem('access_token')
        if (!accessToken) {
            throw new Error(`error accessing accessToken for localStorage`)
            // return; // we then return early on this refusal of access toknea acdess 
        }

        const payload :DepositInitiationPayload = {
            amount: amount,
            transaction_type: transactionType,
        }

        const response= await axios.post(`${API_BASE_URL}/transactions/deposit`,payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const data= await response.data
        console.log(`the data received back is `, data)
        
        return data

    } catch (err) {
        console.log(`an error occured`, err)
    }
}


export const withdrawMoneyApiCall= async (amount: number, transactionType: number )=> {
    try {
        const accessToken= localStorage.getItem('access_token')
        if (!accessToken) {
            throw new Error("an unexpected error occured: could not find the access token ")
        }

        const payload: WithdrawalInitiationPayload = {
            amount: amount,
            transaction_type: transactionType,
        }

        const response= await axios.post(`${API_BASE_URL}/transactions/withdrawal`,payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })
        
        const data= await response.data

        return data

    } catch (err) {
        console.log(`an error occured: `, err)
    }
}