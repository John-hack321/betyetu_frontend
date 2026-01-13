'use client'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import QRCodeScanner from "../components/qrComponent"
import { truncateTeamName } from "../components/fixtureCard"
import ProtectedRoute from "../components/protectedRoute"
import { QrCode, Link2, Check, Trophy, DollarSign, TrendingUp, Camera } from 'lucide-react'

// Redux imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector, useDispatch } from "react-redux"
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
import { CurrentStakeData, StakeJoiningPayload } from "../apiSchemas/stakingSchemas"

function StakingPage() {
    // Redux setup
    const currentStakeData = useSelector((state: RootState) => state.currentStakeData)
    const userData = useSelector((state: RootState) => state.userData)
    const dispatch = useDispatch<AppDispatch>()

    // State
    const quickAmountValues = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
    const [stakeDataReceived, setStakeDataReceived] = useState(false)
    const [stakeAmount, setStakeAmount] = useState<number | null>(null)
    const [enteredCode, setEnteredCode] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [betSuccessfullyPlaced, setBetSuccessfullyPlaced] = useState<boolean>(false)
    const [scanWithLink, setScanWithLink] = useState<boolean>(true)
    const [showQRScanner, setShowQRScanner] = useState<boolean>(false)
    const router = useRouter()

    // Button handlers
    const handleHomeButtonClick = () => {
        if (currentStakeData.guestStakePlacement === currentStakeData.homeTeam) return;
        dispatch(updateGuestStakePlacementOnCurrentStakeData(currentStakeData.homeTeam));
    }

    const handleAwayButtonClick = () => {
        if (currentStakeData.guestStakePlacement === currentStakeData.awayTeam) return;
        dispatch(updateGuestStakePlacementOnCurrentStakeData(currentStakeData.awayTeam));
    }

    const handleDrawButtonClick = () => {
        if (currentStakeData.guestStakePlacement === 'draw') return;
        dispatch(updateGuestStakePlacementOnCurrentStakeData("draw"))
    }

    const handlePlaceBetButtonClick = async () => {
        if (!stakeAmount || stakeAmount <= 0) return;
        
        setLoading(true)
        dispatch(updateGuestStakeAmountOnCurrentStakeData(stakeAmount))

        const payload: StakeJoiningPayload = {
            stakeId: currentStakeData.stakeId,
            stakeAmount: stakeAmount,
            placement: currentStakeData.guestStakePlacement,
        }

        const response: GuestStakePlacementResponse | null = await guestStakePlacementApiCall(payload)
        
        if (response && response.status == 200) {
            setBetSuccessfullyPlaced(true)
            router.push("/stakes")
        }
        setLoading(false)
    }

    const handleQrCodeToggleButton = () => {
        if (scanWithLink) {
            setShowQRScanner(true)
            setScanWithLink(false)
        } else {
            setShowQRScanner(false)
            setScanWithLink(true)
        }
    }

    const handleQRCodeScanned = (code: string) => {
        setEnteredCode(code)
        setShowQRScanner(false)
        setScanWithLink(true)
        setTimeout(() => {
            handleDoneButtonClick()
        }, 500)
    }

    const handleCloseQRScanner = () => {
        setShowQRScanner(false)
        setScanWithLink(true)
    }

    const handleDoneButtonClick = async () => {
        if (!enteredCode) return;
        
        setLoading(true)
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
        setLoading(false)
    }

    const potentialWin = stakeAmount ? stakeAmount * 2 : 0

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a2633] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
                    <h2 className="text-sm text-white">Loading...</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-[#1a2633]">
            {/* Show QR Scanner as overlay when active */}
            {showQRScanner && (
                <QRCodeScanner 
                    onCodeScanned={handleQRCodeScanned}
                    onClose={handleCloseQRScanner}
                />
            )}

            {/* Header */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 lg:px-6 z-20">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold lg:text-3xl">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all lg:text-base">
                            Deposit
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-4 lg:px-6 lg:pt-6 lg:max-w-[1400px] lg:mx-auto lg:w-full">
                
                {/* Left Sidebar - Desktop Only */}
                <div className="hidden lg:block lg:w-[260px] xl:w-[280px] bg-[#16202C] rounded-lg p-4 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="text-[#FED800]" size={20} />
                        Join Bet Info
                    </h3>
                    
                    {stakeDataReceived && (
                        <>
                            {/* Match Details Card */}
                            <div className="bg-[#1a2633] rounded-lg p-4 mb-4 border border-gray-700">
                                <div className="text-center">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-base mb-1">
                                                {truncateTeamName(currentStakeData.homeTeam, 10)}
                                            </div>
                                            <div className="text-xs text-gray-400">Home</div>
                                        </div>
                                        <div className="px-3">
                                            <span className="text-[#FED800] font-bold text-xl">VS</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-base mb-1">
                                                {truncateTeamName(currentStakeData.awayTeam, 10)}
                                            </div>
                                            <div className="text-xs text-gray-400">Away</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opponent's Stake */}
                            <div className="bg-[#1a2633] rounded-lg p-3 mb-3 border border-gray-700">
                                <div className="text-gray-400 text-xs mb-2">Opponent's Bet</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-semibold capitalize">{currentStakeData.ownerStakeplacement}</span>
                                    <span className="text-[#FED800] font-bold">KES {currentStakeData.ownerStakeAmount}</span>
                                </div>
                            </div>

                            {/* Your Balance */}
                            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Your Balance</span>
                                    <span className="text-[#FED800] font-bold text-sm">
                                        KES {userData.account_balance?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Center Content - Scrollable */}
                <div className="flex-1 overflow-y-auto pb-24 lg:pb-4 px-4 lg:px-0 lg:min-w-0">
                    {stakeDataReceived ? (
                        /* Stake Placement UI */
                        <div className="max-w-2xl mx-auto pt-4 lg:pt-8">
                            {/* Page Title - Mobile */}
                            <div className="lg:hidden mb-6">
                                <h1 className="text-3xl font-bold text-white mb-2">Join the Bet</h1>
                                <p className="text-gray-400 text-sm">Make your prediction and stake</p>
                            </div>

                            {/* Match Info - Mobile */}
                            <div className="lg:hidden bg-[#1a2633] rounded-lg p-4 mb-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1 text-center">
                                        <div className="text-white font-bold text-base mb-1">
                                            {truncateTeamName(currentStakeData.homeTeam, 12)}
                                        </div>
                                        <div className="text-xs text-gray-400">Home</div>
                                    </div>
                                    <div className="px-4">
                                        <span className="text-[#FED800] font-bold text-2xl">VS</span>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-white font-bold text-base mb-1">
                                            {truncateTeamName(currentStakeData.awayTeam, 12)}
                                        </div>
                                        <div className="text-xs text-gray-400">Away</div>
                                    </div>
                                </div>

                                {/* Opponent Info */}
                                <div className="bg-[#16202C] rounded-lg p-3 border border-gray-700">
                                    <p className="text-gray-400 text-xs mb-2">Opponent placed:</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-semibold capitalize">{currentStakeData.ownerStakeplacement}</span>
                                        <span className="text-[#FED800] font-bold">KES {currentStakeData.ownerStakeAmount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Your Prediction */}
                            <div className="bg-[#1a2633] rounded-xl p-6 border border-gray-700 mb-6">
                                <h3 className="text-white font-bold text-lg mb-4">Your Prediction</h3>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={handleHomeButtonClick}
                                        disabled={currentStakeData.ownerStakeplacement === currentStakeData.homeTeam}
                                        className={`py-4 rounded-lg font-bold text-sm transition-all ${
                                            currentStakeData.ownerStakeplacement === currentStakeData.homeTeam
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                                : currentStakeData.guestStakePlacement === currentStakeData.homeTeam
                                                    ? 'bg-[#FED800] text-black scale-105'
                                                    : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <div className="text-xs text-gray-400 mb-1">Home</div>
                                        {truncateTeamName(currentStakeData.homeTeam, 8)}
                                    </button>

                                    <button
                                        onClick={handleDrawButtonClick}
                                        disabled={currentStakeData.ownerStakeplacement === "draw"}
                                        className={`py-4 rounded-lg font-bold text-lg transition-all ${
                                            currentStakeData.ownerStakeplacement === "draw"
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                                : currentStakeData.guestStakePlacement === 'draw'
                                                    ? 'bg-[#FED800] text-black scale-105'
                                                    : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <div className="text-xs text-gray-400 mb-1">Draw</div>
                                        X
                                    </button>

                                    <button
                                        onClick={handleAwayButtonClick}
                                        disabled={currentStakeData.ownerStakeplacement === currentStakeData.awayTeam}
                                        className={`py-4 rounded-lg font-bold text-sm transition-all ${
                                            currentStakeData.ownerStakeplacement === currentStakeData.awayTeam
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                                : currentStakeData.guestStakePlacement === currentStakeData.awayTeam
                                                    ? 'bg-[#FED800] text-black scale-105'
                                                    : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <div className="text-xs text-gray-400 mb-1">Away</div>
                                        {truncateTeamName(currentStakeData.awayTeam, 8)}
                                    </button>
                                </div>
                            </div>

                            {/* Your Stake Amount */}
                            <div className="bg-[#1a2633] rounded-xl p-6 border border-gray-700 mb-6">
                                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                    <DollarSign size={20} className="text-[#FED800]" />
                                    Your Stake Amount
                                </h3>

                                {/* Quick Amounts */}
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {quickAmountValues.map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setStakeAmount(amount)}
                                            className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                                                stakeAmount === amount
                                                    ? 'bg-[#FED800] text-black'
                                                    : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                            }`}
                                        >
                                            {amount}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Amount */}
                                <input
                                    type="number"
                                    value={stakeAmount || ''}
                                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                                    placeholder="Enter custom amount"
                                    className="w-full bg-[#16202C] text-white rounded-lg px-4 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#FED800] border border-gray-700"
                                />

                                {/* Potential Win */}
                                {stakeAmount && stakeAmount > 0 && (
                                    <div className="mt-4 bg-gradient-to-r from-[#60991A]/20 to-transparent rounded-lg p-4 border border-[#60991A]/30">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-300 text-sm flex items-center gap-2">
                                                <TrendingUp size={16} className="text-[#60991A]" />
                                                Potential Win
                                            </span>
                                            <span className="text-[#60991A] text-2xl font-bold">
                                                {potentialWin.toLocaleString()} KES
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Place Bet Button */}
                            <button
                                onClick={handlePlaceBetButtonClick}
                                disabled={!currentStakeData.guestStakePlacement || !stakeAmount || stakeAmount <= 0}
                                className={`w-full py-5 rounded-xl font-bold text-lg transition-all ${
                                    currentStakeData.guestStakePlacement && stakeAmount && stakeAmount > 0
                                        ? 'bg-[#60991A] hover:bg-[#4d7a15] text-black active:scale-95'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {currentStakeData.guestStakePlacement && stakeAmount 
                                    ? `Place Bet - ${stakeAmount} KES`
                                    : 'Select Prediction & Amount'
                                }
                            </button>
                        </div>
                    ) : (
                        /* Link/QR Input UI */
                        <div className="max-w-2xl mx-auto pt-4 lg:pt-8">
                            {/* Page Title */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-white mb-2">Join a Bet</h1>
                                <p className="text-gray-400 text-sm">Enter invite code or scan QR to join</p>
                            </div>

                            {/* Input Method Card */}
                            <div className="bg-[#1a2633] rounded-xl p-6 border border-gray-700">
                                {/* Toggle Buttons */}
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => {
                                            setScanWithLink(true)
                                            setShowQRScanner(false)
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            scanWithLink
                                                ? 'bg-[#FED800] text-black'
                                                : 'bg-[#16202C] text-gray-300 hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <Link2 size={20} />
                                        Enter Code
                                    </button>
                                    <button
                                        onClick={handleQrCodeToggleButton}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            !scanWithLink
                                                ? 'bg-[#FED800] text-black'
                                                : 'bg-[#16202C] text-gray-300 hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <Camera size={20} />
                                        Scan QR
                                    </button>
                                </div>

                                {/* Input Section */}
                                {scanWithLink && (
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-3">
                                            Enter Invite Code
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={enteredCode || ''}
                                                onChange={(e) => setEnteredCode(e.target.value)}
                                                placeholder="Enter code here..."
                                                className="flex-1 bg-[#16202C] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FED800] border border-gray-700"
                                            />
                                            <button
                                                onClick={handleDoneButtonClick}
                                                disabled={!enteredCode}
                                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                                    enteredCode
                                                        ? 'bg-[#60991A] hover:bg-[#4d7a15] text-black'
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                <Check size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Desktop Only */}
                <div className="hidden lg:block lg:w-[260px] xl:w-[280px] bg-[#16202C] rounded-lg p-4 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">How to Join</h3>
                    
                    <div className="space-y-3">
                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Get Code</h4>
                                    <p className="text-gray-400 text-xs">Receive invite code from friend</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Enter or Scan</h4>
                                    <p className="text-gray-400 text-xs">Type code or scan QR</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Make Prediction</h4>
                                    <p className="text-gray-400 text-xs">Choose your outcome</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">4</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Place Bet</h4>
                                    <p className="text-gray-400 text-xs">Confirm your stake</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <button
                            onClick={() => router.push('/main')}
                            className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-2 rounded-lg text-sm transition-all text-left border border-gray-700"
                        >
                            ← Back to Matches
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer - Mobile Only */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage="home" />
            </div>
        </div>
    )
}

export default function ProtectedStakingPage() {
    return (
        <ProtectedRoute>
            <StakingPage />
        </ProtectedRoute>
    )
}