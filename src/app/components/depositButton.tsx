'use client'

import LogOutButton from "./logoutButton"

export default function DespositButton() {

    const handleDepositButtonClick = () => {
        console.log('the deposit button has been clicked')
    }
    return (
        <button 
        onClick={handleDepositButtonClick}
        className = "text-black rounded-full bg-yellow-components px-3 py-1 ">
            deposit
        </button>
    )
}