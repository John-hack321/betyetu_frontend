'use client'
import HeaderComponent from "../components/newHeader"
import DespositButton from "../components/depositButton"
import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"
import { initializeStakeApiCall, StakeConnectionData, StakeInitializationResponse } from "../api/stakes"

import { useEffect, useState } from "react"

// redux import setup
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import ProtectedRoute from "../components/protectedRoute"
import { useDispatch } from "react-redux"
import { updateOwnerPlacementOnCurrentStakeData, updateOwnerStakeAmountOnCurrentStakeData } from "../app_state/slices/stakingData"
import { CurrentStakeData, StakeInitiatorPayload } from "../apiSchemas/stakingSchemas"
import { updateCurrentPage } from "../app_state/slices/pageTracking"

function Staking() {

    const thisPage= "home"

    const quickAmountValues= [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]

    // redux data setup
    const currentStakeData = useSelector((state: RootState) => state.currentStakeData)
    const matchesData = useSelector((state: RootState) => state.allFixturesData)
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page)
    const dispatch= useDispatch<AppDispatch>()

    const currentMatchData : {home: string; away: string} | null = null

    const [stakeInitialized, setStakeInitialized]= useState<boolean>(false)
    const [useQrCode, setUseQrCode]= useState(true)
    const [stakeAmount, setStakeAmount]= useState<number | null>(null)
    const [connectionData, setConnectionData]= useState<StakeConnectionData | null >(null)

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
            dispatch(updateOwnerStakeAmountOnCurrentStakeData(stakeAmount))
        }
        const payload: StakeInitiatorPayload= {
            placement: currentStakeData.ownerStakeplacement,
            stakeAmount: currentStakeData.ownerStakeAmount,
            matchId: currentStakeData.matchId,
            home: currentStakeData.homeTeam,
            away: currentStakeData.awayTeam,
        }
        console.log(`${payload}`)

        const response: StakeInitializationResponse | null = await initializeStakeApiCall(payload)
        
        if (response) {
            const responseData= response.data
            setConnectionData(responseData);
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

    return (
        <div className = "bg-background-blue min-h-screen">
           <HeaderComponent/>
           {/* the staking main content goes here now */}
           <div className="mt-8">
                <h2 className = "text-4xl font-bold ml-4">Staking</h2>
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
                    <div className = "items-center justify-center flex px-2 py-1 border-1 border-gray-100 placeholder:text-black rounded-lg w-38 hover:bg-amber-200">
                        <input type="text"
                        onChange={(e)=> {setStakeAmount(parseFloat(e.target.value))}}
                        placeholder="100"
                        className = "text-white focus:outline-none focus:ring-yellow-50 focus:border-transparent hover:font-extrabold font-bold w-38 pl-4" />
                    </div>
                    <button className = "bg-yellow-components  text-center text-black px-6 py-1 rounded-full"
                    onClick={() => {handlePlaceBetButtonClick()}}>place bet</button>
                </div>
                {/* deposit and place bet button */}
                <div className="mt-2 flex ml-4 flex-col">
                    <h2 className= "text-sm">quick amounts</h2>
                    <div className="flex rounded-full gap-4 mt-2 border-r py-2 border-r-gray-500 border-l border-l-gray-500 flex-1 overflow-x-auto w-88">
                        {quickAmountValues.map((amount) => (
                                <button
                                className= "px-3 py-1 rounded-full text-white  bg-lightblue-components">{amount}</button>
                        ))}
                    </div>
                </div>
                {/* bet invite part */}
                {stakeInitialized ? (
                     <div className = 'mt-2 ml-4 rounded-lg bg-lightblue-components flex flex-col justify-center items-center w-90 h-90'>
                        {useQrCode ? (
                            <div className="flex items-center justify-center flex-col">
                                <h2 className = "ml-4">Invite : Scan QR code below</h2>
                                <div className = " mt-2  px-2 w-70 items-center justify-center">
                                    <img src="/example_qr.png" alt="" />
                                </div>
                                <button
                                onClick={() => [handleQrCodeToggleButtonClick()]}
                                 className= "mt-2 underline text-sm">use invite code</button>
                            </div>
                        ) : (
                            <div className="mt-2 ml-4 mr-4  pb-2 shadow-2xl flex-col  rounded-lg flex items-center w-90 justify-center">
                                 <div>
                                    <h2>copy invite link below</h2>
                                    <div className="flex gap-2">
                                        <h2 className="text-xl">alfaijfhas</h2>
                                        <button className="bg-background-blue rounded-lg px-3 py text-white">copy</button>
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
                <div className="mb-0 bottom-0 fixed w-full">
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