'use client'

import { useSelector } from "react-redux"
import { RootState } from "../app_state/store"

export default function ReduxTest() {

    // we use rootsate for typing now here 
    const userData = useSelector((state : RootState) => state.userProfileData)
    return (
        <div>
            <div>this is the redux test page okay</div>
            <div className = 'flex flex-col'>
                <h2>the current user data is : </h2>
                <div className = 'px-8 py-4 m-20 bg-green-components'>
                    <h2 className = 'text-custom-white-text-color text-sm'>{userData.username}</h2>
                    <h2 className = 'text-custom-white-text-color text-sm'>{userData.email}</h2>
                    <h2 className = 'text-custom-white-text-color text-sm'>{userData.phone}</h2>
                    <h2 className = 'text-custom-white-text-color text-sm'>{userData.account_balance}</h2>
                </div>

            </div>
        </div>
    )
}