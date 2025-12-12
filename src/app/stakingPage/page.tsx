'use client'
import HeaderComponent from "../components/newHeader"
import DespositButton from "../components/depositButton"
import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"
import { initializeStakeApiCall, InsuficientAccountBalanceResponse, StakeConnectionData, StakeInitializationResponse } from "../api/stakes"
import GeneratedQrCode from "../components/qrCode"

import { useEffect, useState } from "react"

import { cancelStakePlacementApiCall } from "../api/stakes"

// redux import setup
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import ProtectedRoute from "../components/protectedRoute"
import { useDispatch } from "react-redux"
import { updateOwnerPlacementOnCurrentStakeData, updateOwnerStakeAmountOnCurrentStakeData } from "../app_state/slices/stakingData"
import { CurrentStakeData, StakeInitiatorPayload } from "../apiSchemas/stakingSchemas"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { updateInviteCode } from "../app_state/slices/stakeConnectionData"
import { resetCurrentStakeData } from "../app_state/slices/stakingData"
import { useRouter } from "next/navigation"

function Staking() {

    const thisPage= "home"

    const quickAmountValues= [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]

    // redux data setup
    const currentStakeData = useSelector((state: RootState) => state.currentStakeData)
    const matchesData = useSelector((state: RootState) => state.allFixturesData)
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page)
    const reduxStoreInviteCode= useSelector((state: RootState)=> state.stakeConnectionData.inviteCode)
    const dispatch= useDispatch<AppDispatch>()

    const currentMatchData : {home: string; away: string} | null = null

    const [stakeInitialized, setStakeInitialized]= useState<boolean>(false)
    const [useQrCode, setUseQrCode]= useState(true)
    const [stakeAmount, setStakeAmount]= useState<number | null>(null)
    const [inviteCode, setInviteCode]= useState<string | null>(null)
    const [isLoading, setIsLoading]= useState<boolean>(false)
    const router= useRouter()

    useEffect(()=> {
        const updatePageData= (page: string)=> {
            dispatch(updateCurrentPage(page))
        };

        updatePageData(thisPage)
    },[])


    const handlePlaceBetButtonClick = async () => {
        /**
         * create the payload and send it to the backend
         * update the redux store with the amount
         */
        console.log('the place bet button has been clicked')
        if (stakeAmount) { // null check
            console.log("this is in the the handleplacebutton")
            console.log('the vlaue of stake amount has been updated on the redux store now ')
            await dispatch(updateOwnerStakeAmountOnCurrentStakeData(stakeAmount))
        }

        // for debugging purposes
        console.log("this is in the handlePlaceButtonclick")
        console.log(`value of stake amount is ${stakeAmount} this is the local stake variable`)
        console.log(`the vlaue of stake amount from redux is ${currentStakeData.ownerStakeAmount}`)

        let numStakeAmount: number= 0
        if (stakeAmount) {
            numStakeAmount= stakeAmount
        }

        const payload: StakeInitiatorPayload= {
            placement: currentStakeData.ownerStakeplacement,
            stakeAmount: numStakeAmount,
            matchId: currentStakeData.matchId,
            home: currentStakeData.homeTeam,
            away: currentStakeData.awayTeam,
        }

        const response: StakeInitializationResponse | null = await initializeStakeApiCall(payload)
        
        if (response) {
            const connectionCode: string= response.inviteCode
            console.log(`we have receive the invite code as: ${connectionCode}`)

            console.log(`now updating the redux sotre invite code`)
            dispatch(updateInviteCode(connectionCode))
            console.log(`the updated invite code is : ${reduxStoreInviteCode}`)

            setStakeInitialized(true)

            setInviteCode(connectionCode)
            console.log(`the local invited has been updated and its value has been set to ${inviteCode}`)
        }

        
    }

    const handleQrCodeToggleButtonClick = () => {
        setUseQrCode(!useQrCode)
    }

    const handleHomeButtonClick= () => {
        if (currentStakeData.homeTeam === currentStakeData.ownerStakeplacement) {
            return;
        }
        dispatch(updateOwnerPlacementOnCurrentStakeData(currentStakeData.homeTeam))
    }

    const handleAwayButtonClick= () => {
        if (currentStakeData.awayTeam === currentStakeData.ownerStakeplacement) {
            return;
        }
        dispatch(updateOwnerPlacementOnCurrentStakeData(currentStakeData.awayTeam))
    }

    const handleDrawButtonClick= () => {
        if (currentStakeData.ownerStakeplacement === "draw") {
            return;
        }
        dispatch(updateOwnerPlacementOnCurrentStakeData("draw"))
    }

    const handleCancelbuttonClick= async() => {
        // write the logic for deleting the actual stake in the backend but in the time also return the data so that 
        // the user can still see the data on the screen if he decides to stake 

        console.log(`the invite code from teh re`)
        const response= await cancelStakePlacementApiCall(reduxStoreInviteCode)
        if (response && response.statusCode === 200) {
            setIsLoading(true)
            console.log(`isLoading has been set to ${isLoading}`)
            const stakeOwnerPlacement= currentStakeData.ownerStakeplacement
            console.log(`the local variable stakeOwnerPlacement has been set to ${stakeOwnerPlacement}`)
            dispatch(resetCurrentStakeData())
            console.log(`the redux store has been reset`)
            dispatch(updateOwnerPlacementOnCurrentStakeData(stakeOwnerPlacement))
            setIsLoading(false)
            console.log(`isLoading has been reset to ${isLoading} again`)
            router.push('/home')
        }
        
        
    }

    const handleConfirmButtonClick= () => {
        // for this one i dont see if there is alot of needed logic maybe just clearing the redux store to be back to the initial state and all 
        // set is laoding to true
        // clear the redux store when it comes to the data
        // push user to the stakes page

        console.log(`the confirm button has been clicked`)

        setIsLoading(true);
        dispatch(resetCurrentStakeData())
        router.push("/stakes")  
    }

    const handleQuickAmountButtonclick= (amount: number)=> {
        console.log('the quick amount button has been clicked')
        
        setStakeAmount(amount)
    }

    const handleStakeCodeCopyButtonClick= ()=> {
        console.log('the stake code copy button has been clicked')
        const code= `${inviteCode}`
        navigator.clipboard.writeText(code);
    }

    if (isLoading) {
        return (
            <div className="bg-background-blue min-h-screen flex items-center justify-center">
                <h2 className="text-custom-white-text-color">loading...</h2>
            </div>
        )
    }

    return (
        <div className = "bg-background-blue min-h-screen w-screen">
            <HeaderComponent/>
           {/* the staking main content goes here now */}
            <div className="mt-8 pb-30">
                <h2 className = "text-4xl font-bold ml-4">Staking</h2>
                
                <div>
                    {stakeInitialized && stakeInitialized === true ? (
                    <div className="bg-lightblue-components mx-4 mt-4 rounded-lg shadow-xl overflow-hidden">
                            {/* Success Header with accent */}
                            <div className="bg-green-components/10 border-l-4 border-green-components px-4 py-3">
                                <div className="flex items-center gap-2">
                                {/* Success icon - you can replace with an actual icon if available */}
                                <div className="w-8 h-8 rounded-full bg-green-components flex items-center justify-center">
                                    <span className="text-black text-xl font-bold">✓</span>
                                </div>
                                <div>
                                    <h2 className="text-green-components text-xl font-bold capitalize">Success!</h2>
                                    <p className="text-custom-white-text-color text-sm opacity-90">Your bet has been placed</p>
                                </div>
                                </div>
                            </div>
                            
                            {/* Bet Details Section */}
                            <div className="px-4 py-5 space-y-4">
                                {/* Amount */}
                                <div className="flex items-center justify-between p-3 bg-background-blue/30 rounded-lg">
                                <span className="text-custom-white-text-color text-base font-medium">Amount</span>
                                <span className="text-yellow-components text-2xl font-bold">
                                    {currentStakeData.ownerStakeAmount}
                                    <span className="text-sm ml-1 opacity-75">KES</span>
                                </span>
                                </div>
                            
                                {/* Placement */}
                                <div className="flex items-center justify-between p-3 bg-background-blue/30 rounded-lg">
                                <span className="text-custom-white-text-color text-base font-medium">Placement</span>
                                <span className="text-yellow-components text-lg font-bold capitalize">
                                    {currentStakeData.ownerStakeplacement}
                                </span>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 px-4 pb-4">
                                <button
                                onClick={() => {handleCancelbuttonClick()}}
                                className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-150 rounded-lg px-4 py-2 text-white font-semibold shadow-md"
                                >
                                Cancel
                                </button>
                                <button
                                onClick={() => {handleConfirmButtonClick()}}
                                className="flex-1 bg-green-components hover:bg-green-components/90 active:scale-95 transition-all duration-150 rounded-lg px-4 py-2 text-black font-semibold shadow-md"
                                >
                                Confirm
                                </button>
                            </div>
                        </div>
                    ) : (
                        /** */
                        <>
                            <div className= " mx-4 mt-4  flex mr-2 ">
                                <div className ="flex flex-col w-1/2 h-35 ">
                                {/* the different buttons are rendered conditionaly based on whether they are the ones in the currentstake placement */}
                                    {(currentStakeData.ownerStakeplacement === currentStakeData.homeTeam) ? (
                                        <button 
                                        onClick={()=> {handleHomeButtonClick()}}
                                        className ="border border-black text-black bg-yellow-components rounded-lg mr-2 shadow-2xl text-xl my-2 h-1/2 ">
                                            {truncateTeamName(currentStakeData.homeTeam)}
                                        </button>
                                    ) : (
                                        <button 
                                        onClick={()=> {handleHomeButtonClick()}}
                                        className ="border border-gray-500 rounded-lg bg-lightblue-components mr-2 shadow-2xl text-xl my-2 h-1/2 ">
                                            {truncateTeamName(currentStakeData.homeTeam)}
                                        </button>
                                    )}
                                    {(currentStakeData.ownerStakeplacement === currentStakeData.awayTeam) ? (
                                        <button
                                        onClick={()=> {handleAwayButtonClick()}}
                                        className ="border bg-yellow-components text-black border-gray-500 rounded-lg  mr-2 shadow-2xl text-xl mb-2 h-1/2 ">
                                                {truncateTeamName(currentStakeData.awayTeam)}
                                            </button>
                                    ) : (
                                        <button
                                        onClick={()=> {handleAwayButtonClick()}}
                                        className ="border border-gray-500 rounded-lg bg-lightblue-components mr-2 shadow-2xl text-xl mb-2 h-1/2 ">
                                            {truncateTeamName(currentStakeData.awayTeam)}
                                        </button>
                                    )}
                                </div>
                                <div className="w-1/2 ">
                                {(currentStakeData.ownerStakeplacement === "draw") ? (
                                    <button 
                                    onClick={()=> {handleDrawButtonClick()}}
                                    className="border border-gray-500 text-black bg-yellow-components h-30 rounded-lg w-40 shadow-2xl mx-2 my-2  text-xl">
                                            Draw
                                        </button>
                                ) : (
                                    <button 
                                    onClick={()=> {handleDrawButtonClick()}}
                                    className="border border-gray-500 bg-lightblue-components h-30 rounded-lg w-40 shadow-2xl mx-2 my-2  text-xl">
                                        Draw
                                    </button>
                                )}
                                </div>
                            </div>

                            {/* staking amount entrance point */}
                            <div className="flex mt-3 ml-4 gap-3">
                                <h2 className = "text-xl">amount</h2>
                                <div className = "items-center justify-center flex px-2 py-1 border-1 border-gray-100 placeholder:text-black rounded-lg w-34 hover:bg-amber-200">
                                    <input type="text"
                                    onChange={(e)=> {setStakeAmount(parseFloat(e.target.value))}}
                                    value={stakeAmount || ''}
                                    className = "text-white focus:outline-none focus:ring-yellow-50 focus:border-transparent hover:font-extrabold font-bold w-38 pl-4" />
                                </div>
                                <button className = "bg-yellow-components  text-center text-black px-6 py-1 rounded-full"
                                onClick={() => {handlePlaceBetButtonClick()}}>place bet</button>
                            </div>
                            {/* deposit and place bet button */}
                            <div className="mt-2 flex ml-4 flex-col">
                                <h2 className= "text-sm">quick amounts</h2>
                                <div className="flex rounded-full gap-4 mt-2 border-r py-2 border-r-gray-500 border-l border-l-gray-500 flex-1 overflow-x-auto w-78">
                                    {quickAmountValues.map((amount) => (
                                            <button key={amount}
                                            onClick={()=> {handleQuickAmountButtonclick(amount)}}
                                            className= "px-3 py-1 rounded-full text-white  bg-lightblue-components">{amount}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {/* bet invite part */}
                {stakeInitialized ? (
                     <div className='mt-4 mx-4 p-4 rounded-lg bg-lightblue-components'>
                        {useQrCode ? (
                            <div className='flex flex-col items-center'>
                                <h2 className='text-lg font-medium mb-2'>Invite a Friend</h2>
                                <p className='mb-4 text-center'>Scan the QR code below to share your bet</p>
                                
                                <div className='mb-4'>
                                    {reduxStoreInviteCode && reduxStoreInviteCode != null ? (
                                        <div className='flex justify-center'>
                                            <GeneratedQrCode code={reduxStoreInviteCode}/>
                                        </div>
                                    ) : (
                                        <div>Loading QR code...</div>
                                    )}
                                </div>
                                
                                <button
                                    onClick={handleQrCodeToggleButtonClick}
                                    className='text-sm underline hover:text-blue-200'
                                >
                                    Use invite code instead
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2 ml-4 mr-4  pb-2 shadow-2xl flex-col  rounded-lg flex items-center w-90 justify-center">
                                 <div>
                                    <h2>copy invite link below</h2>
                                    <div className="flex gap-2">
                                        {reduxStoreInviteCode && reduxStoreInviteCode != null ? (
                                            <h2 className="text-xl">{reduxStoreInviteCode}</h2>
                                        ) : (
                                            <h2>loading ...</h2>
                                        )}
                                        <button
                                        onClick={()=> {handleStakeCodeCopyButtonClick()}}
                                        className="bg-background-blue rounded-lg px-3 py text-white">copy</button>
                                    </div>

                                 </div>
                                 <button 
                                 onClick={() => {handleQrCodeToggleButtonClick()}}
                                 className='underline text-white text-sm mt-4'>use QR code</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className = 'h-90 mt-2 ml-4 bg-lightblue-components pb-2 shadow-2xl mr-10 rounded-lg flex items-center justify-center'>
                        <h2 className= "text-white text-sm">Staking...</h2>
                    </div>
                )}
                {/* the footer at the bottom */}
                <div className="mb-0 bottom-0 fixed w-screen">
                    <FooterComponent currentPage={currentPage} />
                </div>
           </div>
        </div>
      
    )
}

export default function StakingPage() {
    return (
        <ProtectedRoute>
            <Staking/>
        </ProtectedRoute>
    )
}