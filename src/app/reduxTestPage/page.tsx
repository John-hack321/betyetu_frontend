'use client'

import { useSelector } from "react-redux"
import { RootState } from "../app_state/store"
import { useState } from "react"

import { useDispatch } from "react-redux"
import { updateUserDataAsync, UserDataInterface } from "../app_state/slices/userData"
import { AppDispatch } from "../app_state/store"


export default function ReduxTest() {

    // we use rootsate for typing now here
    const userData = useSelector((state : RootState) => state.userData)

    const [email , setEmail] = useState('')
    const [username , setUsername] = useState('')
    const [account_balance , setAccount_balance] = useState('')
    const [phone , setPhone] = useState('')

    const dispatch = useDispatch<AppDispatch>()


    const handleUpdateButtonClick = () => {
        console.log('the update button has been clicked now')

        const userData : UserDataInterface = {
            id : 1,
            username : username,
            email : email,
            phone : phone,
            account_balance : parseFloat(account_balance),
        }
        dispatch(updateUserDataAsync(userData))
    }

    return (
        <div className = 'bg-background-blue min-h-screen'>
            <div>this is the redux test page okay</div>
            <div className = 'flex flex-col'>
                <h2>the current user data is : </h2>
                <div className = 'px-8 py-4 m-20 bg-green-components rounded-lg shadow-2xls'>
                    <h2 className = 'text-black font-bold text-xl'>{userData.username}</h2>
                    <h2 className = 'text-black font-bold text-xl'>{userData.email}</h2>
                    <h2 className = 'text-black font-bold text-xl'>{userData.phone}</h2>
                    <h2 className = 'text-black font-bold text-xl'>{userData.account_balance}</h2>
                </div>

                <div className = "m-20 px-8 py-4 rounded-lg bg-lightblue-components">
                    <h2>update user data</h2>
                    <div className = 'py-2 mt-2 flex flex-col gap-6'>
                        <input type="text"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="enter username"
                        className = "rounded-lg border-background-blue border-2 w-50 pl-2" />

                        <input type="text"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="enter email"
                        className = "rounded-lg border-background-blue border-2 w-50 pl-2" />

                        <input type="text"
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="enter phone number"
                        className = "rounded-lg border-background-blue border-2 w-50 pl-2" />

                        <input type="number"
                        onChange={(e) => setAccount_balance(e.target.value)}
                        placeholder="enter balance"
                        className = "rounded-lg border-background-blue border-2 w-50 pl-2" />
                    </div>
                    <button 
                    onClick={handleUpdateButtonClick}
                    className = 'rounded-full px-3 py bg-yellow-components text-black mt-5 ml-30'>update
                    </button>
                </div>

            </div>
        </div>
    )
}