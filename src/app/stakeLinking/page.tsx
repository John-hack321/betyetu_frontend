'use client'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import { useState } from "react"
import SearchIcon from "../components/searchIcon"

export default function StakingPage () {

    const handleQrCodeToggleButton = () => {
        console.log('the qr code toggle button ahs been clicked')
        setScanWithLInk(!scanWithLink)
    }

    const [scanWithLink , setScanWithLInk] = useState<boolean>(true)
    return (
        <div className = "bg-background-blue min-h-screen ">
            <HeaderComponent/>
            {scanWithLink ? (
                 <div className = 'pl-10 mt-20 bg-lightblue-components py-4 rounded-lg mx-2 shadow-sm'>
                    <h2 className = 'text-2xl text-gray-300 font-bold'>enter invite link </h2>
                    <div className = "flex gap-4 w-full mt-10 items-center ">
                        <input type="text"
                        placeholder="enter link here"
                        className = 'border rounded-lg px-2 py w-60 h-10 text-white bg-gray-900 focus:border-gray-700' />
                        <button className = 'text-black bg-green-components px-2 h-10 rounded-lg'>done</button>
                    </div>
                    <div className = 'flex mt-4 gap-2 items-center pb-4'>
                        <h2 className = 'text-custom-white-text-color'>click</h2>
                        <button
                        onClick={handleQrCodeToggleButton}
                        className = 'text-black bg-green-components rounded-lg px-3 py shadow-sm'>here</button>
                        <h2 className = 'text-custom-white-text-color'>to scan QR code instead</h2>
                    </div>
                </div>
            ) : (
                <div className = 'mt-20 bg-lightblue-components py-4 rounded-lg mx-2 shadow-sm px-2'>
                    <h2 className = "text-2xl font-bold text-custom-white-text-color">Scan QR code</h2>
                    <h2 className = 'text-sm mt-4 text-custom-white-text-color'>Note: Ensure QR code is in frame</h2>
                    <div className = 'rounded-lg bg-background-blue items-center justify-center flex mt-4 h-80'>                        
                        <div className = 'flex'>
                            <SearchIcon />
                            <h2>scanning...</h2>
                        </div>
                    </div>
                    <div className = 'flex gap-2 mt-4'>
                        <h2 className = 'text-sm text-custom-white-text-color'>QR code not working ?</h2>
                        <button 
                        onClick={handleQrCodeToggleButton}
                        className = 'text-green-components underline font-bold roundedfull shadow-2xl px-3 text-sm'>use link</button>
                    </div>
                </div>
            )}
            <div className = "bottom-0 mb-0 fixed w-full ">
                <FooterComponent/>
            </div>
        </div>
    )
}