'use client'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Import the QR Scanner component
import QRCodeScanner from "../components/qrComponent"

import { truncateTeamName } from "../components/fixtureCard"
import ProtectedRoute from "../components/protectedRoute"

// Redux imports
import { AppDispatch } from "../app_state/store"
import { RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { 
    updateGuestStakeAmountOnCurrentStakeData, 
    updateGuestStakePlacementOnCurrentStakeData,
    guestSetCurrentStakeData 
} from "../app_state/slices/stakingData"
import { 
    guestFetchStakeDataApiCall, 
    GuestFetchStakeDataApiResponse, 
    guestStakePlacementApiCall, 
    GuestStakePlacementResponse 
} from "../api/stakes"
import { CurrentStakeData } from "../apiSchemas/stakingSchemas"

function StakingPage() {
    // Redux setup
    const currentStakeData = useSelector((state: RootState) => state.currentStakeData)
    const dispatch = useDispatch<AppDispatch>()

    // State
    const quickAmountValues = [50, 100, 150, 200, 250, 300]
    const [stakeDataReceived, setStakeDataReceived] = useState(false)
    const [stakeAmount, setStakeAmount] = useState<number | null>(null)
    const [enteredCode, setEnteredCode] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [betSuccessfulyPlaced, setBetSuccessfulyPlaced] = useState<boolean>(false)
    const [scanWithLink, setScanWithLink] = useState<boolean>(true)
    const [showQRScanner, setShowQRScanner] = useState<boolean>(false)
    const router = useRouter()

    // Button handlers
    const handleHomeButtonClick = () => {
        if (currentStakeData.guestStakePlacement === currentStakeData.homeTeam) {
            return;
        }
        dispatch(updateGuestStakePlacementOnCurrentStakeData(currentStakeData.homeTeam));
    }

    const handleAwayButtonClick = () => {
        if (currentStakeData.guestStakePlacement === currentStakeData.awayTeam) {
            return;
        }
        dispatch(updateGuestStakePlacementOnCurrentStakeData(currentStakeData.awayTeam));
    }

    const handleDrawButtonClick = () => {
        if (currentStakeData.guestStakePlacement === 'draw') {
            return;
        }
        dispatch(updateGuestStakePlacementOnCurrentStakeData("draw"))
    }

    const handlePlaceBetButtonClick = async () => {
        setLoading(true)
        if (stakeAmount) {
            dispatch(updateGuestStakeAmountOnCurrentStakeData(stakeAmount))
        }

        const payload = {
            stakeId: currentStakeData.stakeId,
            stakeAmount: currentStakeData.guestStakeAmount,
            placement: currentStakeData.guestStakePlacement,
        }

        const response: GuestStakePlacementResponse | null = await guestStakePlacementApiCall(payload)
        
        if (response && response.status == 200) {
            setBetSuccessfulyPlaced(true)
            router.push("/stakes")
        }
        setLoading(false)
    }

    // Toggle between link and QR scanner
    const handleQrCodeToggleButton = () => {
        if (scanWithLink) {
            // User wants to scan QR code
            setShowQRScanner(true)
            setScanWithLink(false)
        } else {
            // User wants to use link instead
            setShowQRScanner(false)
            setScanWithLink(true)
        }
    }

    // Handle when QR code is successfully scanned
    const handleQRCodeScanned = (code: string) => {
        console.log('QR Code scanned:', code)
        setEnteredCode(code)
        setShowQRScanner(false)
        setScanWithLink(true)
        // Optionally auto-submit after a short delay
        setTimeout(() => {
            handleDoneButtonClick()
        }, 500)
    }

    // Handle closing QR scanner
    const handleCloseQRScanner = () => {
        setShowQRScanner(false)
        setScanWithLink(true)
    }

    const handleDoneButtonClick = async () => {
        setLoading(true)
        if (enteredCode && enteredCode != null) {
            const invitedStakeData: GuestFetchStakeDataApiResponse | null = 
                await guestFetchStakeDataApiCall(enteredCode)
            
            if (invitedStakeData) {
                const stakeData: CurrentStakeData = {
                    matchId: invitedStakeData.matchId,
                    stakeId: invitedStakeData.stakeId,
                    homeTeam: invitedStakeData.homeTeam,
                    awayTeam: invitedStakeData.awayTeam,
                    ownerStakeAmount: invitedStakeData.stakeOwner.stakeAmount,
                    ownerStakeplacement: invitedStakeData.stakeOwner.stakePlacement,
                    guestStakeAmount: 0,
                    guestStakePlacement: "",
                }
                dispatch(guestSetCurrentStakeData(stakeData))
                setStakeDataReceived(true)
            }
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background-blue flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-components"></div>
                    <h2 className="text-sm text-white">loading...</h2>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Show QR Scanner as overlay when active */}
            {showQRScanner && (
                <QRCodeScanner 
                    onCodeScanned={handleQRCodeScanned}
                    onClose={handleCloseQRScanner}
                />
            )}

            {stakeDataReceived ? (
                // Stake placement UI
                <div className="bg-background-blue min-h-screen">
                    <HeaderComponent/>
                    
                    <div className="px-4 py-6">
                        {/* Match Info */}
                        <div className="bg-lightblue-components rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg">{truncateTeamName(currentStakeData.homeTeam)}</h3>
                                </div>
                                <div className="px-4">
                                    <span className="text-yellow-components font-bold text-2xl">VS</span>
                                </div>
                                <div className="flex-1 text-right">
                                    <h3 className="text-white font-bold text-lg">{truncateTeamName(currentStakeData.awayTeam)}</h3>
                                </div>
                            </div>
                            
                            {/* Opponent's stake info */}
                            <div className="bg-background-blue rounded-lg p-3">
                                <p className="text-gray-400 text-sm mb-2">Opponent placed:</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-semibold">{currentStakeData.ownerStakeplacement}</span>
                                    <span className="text-yellow-components font-bold">KES {currentStakeData.ownerStakeAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Your Prediction */}
                        <div className="mb-6">
                            <h3 className="text-white font-bold text-lg mb-3">Your Prediction</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={handleHomeButtonClick}
                                    className={`py-3 rounded-lg font-semibold transition-all ${
                                        currentStakeData.guestStakePlacement === currentStakeData.homeTeam
                                            ? 'bg-yellow-components text-black'
                                            : 'bg-lightblue-components text-white hover:bg-gray-700'
                                    }`}
                                >
                                    Home
                                </button>
                                <button
                                    onClick={handleDrawButtonClick}
                                    className={`py-3 rounded-lg font-semibold transition-all ${
                                        currentStakeData.guestStakePlacement === 'draw'
                                            ? 'bg-yellow-components text-black'
                                            : 'bg-lightblue-components text-white hover:bg-gray-700'
                                    }`}
                                >
                                    Draw
                                </button>
                                <button
                                    onClick={handleAwayButtonClick}
                                    className={`py-3 rounded-lg font-semibold transition-all ${
                                        currentStakeData.guestStakePlacement === currentStakeData.awayTeam
                                            ? 'bg-yellow-components text-black'
                                            : 'bg-lightblue-components text-white hover:bg-gray-700'
                                    }`}
                                >
                                    Away
                                </button>
                            </div>
                        </div>

                        {/* Stake Amount */}
                        <div className="mb-6">
                            <h3 className="text-white font-bold text-lg mb-3">Your Stake Amount</h3>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {quickAmountValues.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setStakeAmount(amount)}
                                        className={`py-3 rounded-lg font-semibold transition-all ${
                                            stakeAmount === amount
                                                ? 'bg-yellow-components text-black'
                                                : 'bg-lightblue-components text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                value={stakeAmount || ''}
                                onChange={(e) => setStakeAmount(Number(e.target.value))}
                                placeholder="Custom amount"
                                className="w-full bg-lightblue-components text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-components"
                            />
                        </div>

                        {/* Place Bet Button */}
                        <button
                            onClick={handlePlaceBetButtonClick}
                            disabled={!currentStakeData.guestStakePlacement || !stakeAmount}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                                currentStakeData.guestStakePlacement && stakeAmount
                                    ? 'bg-green-components text-black hover:bg-green-600'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Place Bet
                        </button>
                    </div>

                    <div className="bottom-0 mb-0 fixed w-full">
                        <FooterComponent currentPage={"home"}/>
                    </div>
                </div>
            ) : (
                // Link/QR input UI
                <div className="bg-background-blue min-h-screen">
                    <HeaderComponent/>
                    
                    <div className='pl-10 mt-20 bg-lightblue-components py-4 rounded-lg mx-2 shadow-sm'>
                        {scanWithLink ? (
                            // Link input view
                            <>
                                <h2 className='text-2xl text-gray-300 font-bold'>enter invite link</h2>
                                <div className="flex gap-4 w-full mt-10 items-center">
                                    <input
                                        onChange={(e) => setEnteredCode(e.target.value)}
                                        value={enteredCode || ''}
                                        type="text"
                                        placeholder="enter link here"
                                        className='border rounded-lg px-2 py w-60 h-10 text-white bg-gray-900 focus:border-gray-700'
                                    />
                                    <button 
                                        onClick={handleDoneButtonClick}
                                        disabled={!enteredCode}
                                        className={`px-4 h-10 rounded-lg font-semibold ${
                                            enteredCode 
                                                ? 'text-black bg-green-components hover:bg-green-600' 
                                                : 'text-gray-500 bg-gray-700 cursor-not-allowed'
                                        }`}
                                    >
                                        done
                                    </button>
                                </div>
                                <div className='flex mt-4 gap-2 items-center pb-4'>
                                    <h2 className='text-custom-white-text-color'>click</h2>
                                    <button
                                        onClick={handleQrCodeToggleButton}
                                        className='text-black bg-green-components rounded-lg px-3 py-1 shadow-sm hover:bg-green-600 transition-colors'
                                    >
                                        here
                                    </button>
                                    <h2 className='text-custom-white-text-color'>to scan QR code instead</h2>
                                </div>
                            </>
                        ) : (
                            // Placeholder when scanner should be active (shouldn't normally see this)
                            <div className="text-center py-10">
                                <p className="text-white">Opening scanner...</p>
                            </div>
                        )}
                    </div>

                    <div className="bottom-0 mb-0 fixed w-full">
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