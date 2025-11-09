'use client'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import { useState } from "react"
import SearchIcon from "../components/searchIcon"
import { useRouter } from "next/navigation"

import { truncateTeamName } from "../components/fixtureCard"
import ProtectedRoute from "../components/protectedRoute"

// redux setup imports
import { AppDispatch } from "../app_state/store"
import { RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateGuestStakeAmountOnCurrentStakeData, 
    updateGuestStakePlacementOnCurrentStakeData, } from "../app_state/slices/stakingData"
import { guestFetchStakeDataApiCall, GuestFetchStakeDataApiResponse, guestStakePlacementApiCall, GuestStakePlacementResponse } from "../api/stakes"
import { StakeInterface } from "../app_state/slices/stakesData"
import { CurrentStakeData, invitedStakeDataApiResponse } from "../apiSchemas/stakingSchemas"
import { guestSetCurrentStakeData } from "../app_state/slices/stakingData"
import { setLoadingState } from "../app_state/slices/matchData"

function StakingPage () {

    // redux data setups
    const currentStakeData= useSelector((state: RootState)=> state.currentStakeData)
    const dispatch= useDispatch<AppDispatch>()

    // other data for use
    const quickAmountValues= [50, 100, 150, 200, 250, 300]

    // button click handlers
    const handleHomeButtonClick= ()=> {
        if (currentStakeData.guestStakePlacement === currentStakeData.homeTeam) {
            return ;
        }
        dispatch(updateGuestStakePlacementOnCurrentStakeData(currentStakeData.homeTeam));
    }

    const handleAwayButtonClick= ()=> {
        if (currentStakeData.guestStakePlacement === currentStakeData.awayTeam) {
            return;
        }
        dispatch(updateGuestStakePlacementOnCurrentStakeData(currentStakeData.awayTeam));
    }

    const handleDrawButtonClick= ()=> {
        if (currentStakeData.guestStakePlacement === 'draw') {
            return;
        }
        dispatch(updateGuestStakePlacementOnCurrentStakeData("draw"))
    }

    const handlePlaceBetButtonClick= async ()=> {
        setLoading(true)
        if (stakeAmount) {
            dispatch(updateGuestStakeAmountOnCurrentStakeData(stakeAmount))
        }

        const payload= {
            stakeId: currentStakeData.stakeId,
            stakeAmount: currentStakeData.guestStakeAmount,
            placement: currentStakeData.guestStakePlacement,
        }

        console.log(`the pyaload has been set to ${payload.stakeId}, ${payload.stakeAmount} and ${payload.placement}`)

        const response: GuestStakePlacementResponse | null= await guestStakePlacementApiCall(payload)
        // with a syccessful respne i think we need to show a success message then push the user to the stakes page after a few seconds right
        if (response) {
            if (response.status == 200) {
                setBetSuccessfulyPlaced(true)
                router.push("/stakes")
            }
        }
        setLoading(false)
    }

    const handleQrCodeToggleButton = () => {
        console.log('the qr code toggle button ahs been clicked')
        setScanWithLInk(!scanWithLink)
    }

    const handleDoneButtonClick= async ()=> {
        // make api call for fetching stake data for joining the stake
        // set the stake data to the redux store and update a few state thing for conditional rendering
        
        setLoading(true)
        if (enteredCode && enteredCode != null) {
            const invitedStakeData: GuestFetchStakeDataApiResponse | null = await guestFetchStakeDataApiCall(enteredCode)
            if (invitedStakeData) {
                const stakeData: CurrentStakeData= {
                    matchId: invitedStakeData.matchId,
                    stakeId: invitedStakeData.stakeId,
                    homeTeam: invitedStakeData.homeTeam,
                    awayTeam: invitedStakeData.awayTeam,
                    ownerStakeAmount: invitedStakeData.stakeOwner.stakeAmount,
                    ownerStakeplacement: invitedStakeData.stakeOwner.stakePlacement,
                    guestStakeAmount: 0,
                    guestStakePlacement: "",
            }; // solve this error here , the stake guesta data is comming back as undefined cause it is not returned

            dispatch(guestSetCurrentStakeData(stakeData))
            setStakeDataReceived(true)
            }
        }
        setLoading(false)

    }

    const [stakeDataReceived, setStakeDataReceived]= useState(false)
    const [stakeAmount, setStakeAmount]= useState<number | null>(null)
    const [enteredCode, setEnteredCode]= useState<string | null>(null)
    const [loading, setLoading]= useState<boolean>(false)
    const [betSuccessfulyPlaced, setBetSuccessfulyPlaced]= useState<boolean>(false)
    const router= useRouter()

    const [scanWithLink , setScanWithLInk] = useState<boolean>(true)

    if (loading) {
        return (
            <div className="min-h-screen bg-background-blue flex items-center justify-center">
                <h2 className="text-sm">loading...</h2>
            </div>
        )
    }

    return (
        <div>
            {stakeDataReceived ? (
                <div className = "bg-background-blue min-h-screen">
                    <HeaderComponent/>
                    {/* the staking main content goes here now */}
                    <div className="mt-8">
                        <h2 className = "text-4xl font-bold ml-4">Staking</h2>
                        <div className= " mx-4 mt-4  flex mr-2 ">
                            <div className ="flex flex-col w-1/2 h-35 ">
                            {/* the stake buttons are rendered conditionaly based on a copuple of factors : 
                            * if they are the game is selected by the stakeOwner they will be green and unclickable
                            * if they are the game on it is selected by the guest then they will be yellow just like in the stakingPage
                            */}
                                {(currentStakeData.ownerStakeplacement === currentStakeData.homeTeam) ? (
                                    <button
                                    className ="border border-black text-black bg-green-components rounded-lg mr-2 shadow-2xl text-xl my-2 h-1/2 ">
                                        {truncateTeamName(currentStakeData.homeTeam)}
                                    </button>
                                ) : (
                                    /* second render based on the stakeGuest => the same is applied to the other buttons*/
                                currentStakeData.guestStakePlacement === currentStakeData.homeTeam ? (
                                    <button
                                    onClick={()=> handleHomeButtonClick()}
                                    className ="border border-black text-black bg-yellow-components rounded-lg mr-2 shadow-2xl text-xl my-2 h-1/2 ">
                                        {truncateTeamName(currentStakeData.homeTeam)}
                                    </button>
                                ) : (
                                    <button
                                    onClick={()=> {handleHomeButtonClick()}}
                                    className ="border border-gray-500 bg-lightblue-components rounded-lg mr-2 shadow-2xl text-xl my-2 h-1/2 ">
                                        {truncateTeamName(currentStakeData.homeTeam)}
                                    </button>
                                )
                                )}
                                {(currentStakeData.ownerStakeplacement === currentStakeData.awayTeam) ? (
                                    <button
                                    className ="border bg-green-components text-black border-gray-500 rounded-lg  mr-2 shadow-2xl text-xl mb-2 h-1/2 ">
                                            {truncateTeamName(currentStakeData.awayTeam)}
                                        </button>
                                ) : (
                                    currentStakeData.guestStakePlacement === currentStakeData.awayTeam ? (
                                        <button
                                        onClick={()=> {handleAwayButtonClick()}}
                                        className ="border border-black text-black rounded-lg bg-yellow-components mr-2 shadow-2xl text-xl mb-2 h-1/2 ">
                                            {truncateTeamName(currentStakeData.awayTeam)}
                                        </button>
                                    ) : (
                                        <button
                                        onClick={()=> {handleAwayButtonClick()}}
                                        className ="border border-gray-500 rounded-lg bg-lightblue-components mr-2 shadow-2xl text-xl mb-2 h-1/2 ">
                                            {truncateTeamName(currentStakeData.awayTeam)}
                                        </button>
                                    )
                                )}
                            </div>
                            <div className="w-1/2 ">
                                {(currentStakeData.ownerStakeplacement === "draw") ? (
                                    <button 
                                    className="border border-gray-500 text-black bg-green-components h-30 rounded-lg w-40 shadow-2xl mx-2 my-2  text-xl">
                                        Draw
                                    </button>
                                ) : (
                                    currentStakeData.guestStakePlacement === "draw" ? (
                                        <button 
                                        onClick={()=> {handleDrawButtonClick()}}
                                        className="border border-black text-black bg-yellow-components h-30 rounded-lg w-40 shadow-2xl mx-2 my-2  text-xl">
                                        Draw
                                    </button>
                                    ) : (
                                        <button 
                                        onClick={()=> {handleDrawButtonClick()}}
                                        className="border border-gray-500 bg-lightblue-components h-30 rounded-lg w-40 shadow-2xl mx-2 my-2  text-xl">
                                        Draw
                                        </button>
                                    )
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
                        
                        {/* the footer at the bottom */}
                        <div className="mb-0 bottom-0 fixed w-full">
                            <FooterComponent currentPage={"home"} />
                        </div>
                    </div>
                </div>
            ) : (
                                
                <div className = "bg-background-blue min-h-screen ">
                    <HeaderComponent/>
                    {scanWithLink ? (
                        <div className = 'pl-10 mt-20 bg-lightblue-components py-4 rounded-lg mx-2 shadow-sm'>
                            <h2 className = 'text-2xl text-gray-300 font-bold'>enter invite link </h2>
                            <div className = "flex gap-4 w-full mt-10 items-center ">
                                
                                {/* invite code enterance part */}
                                <input
                                onChange={(e)=> {setEnteredCode(e.target.value)}}
                                type="text"
                                placeholder="enter link here"
                                className = 'border rounded-lg px-2 py w-60 h-10 text-white bg-gray-900 focus:border-gray-700' />

                                <button 
                                onClick={()=> {handleDoneButtonClick()}}
                                className = 'text-black bg-green-components px-2 h-10 rounded-lg'>done</button>
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
                        <FooterComponent currentPage={"home"}/>
                    </div>
                    </div>

                )}
            </div>
    )
}

export default function ProtectedStakingPage() {
    return (
        <ProtectedRoute>
            <StakingPage/>
        </ProtectedRoute>
    )
} 
