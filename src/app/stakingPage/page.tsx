'use client'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"
import { initializeStakeApiCall, StakeInitializationResponse } from "../api/stakes"
import GeneratedQrCode from "../components/qrCode"
import { useEffect, useState } from "react"
import { cancelStakePlacementApiCall } from "../api/stakes"
import { useRouter } from "next/navigation"
import { Trophy, Share2, QrCode, Copy, X, Check, DollarSign, TrendingUp } from 'lucide-react'

// Redux imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector, useDispatch } from "react-redux"
import ProtectedRoute from "../components/protectedRoute"
import { 
    updateOwnerPlacementOnCurrentStakeData, 
    updateOwnerStakeAmountOnCurrentStakeData,
    resetCurrentStakeData 
} from "../app_state/slices/stakingData"
import { StakeInitiatorPayload } from "../apiSchemas/stakingSchemas"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { updateInviteCode } from "../app_state/slices/stakeConnectionData"

function Staking() {
    const thisPage = "home"
    const quickAmountValues = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]

    // Redux data setup
    const currentStakeData = useSelector((state: RootState) => state.currentStakeData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const reduxStoreInviteCode = useSelector((state: RootState) => state.stakeConnectionData.inviteCode)
    const userData = useSelector((state: RootState) => state.userData)
    const dispatch = useDispatch<AppDispatch>()

    const [isPublicStake, setIsPublicStake] = useState(true);
    const [stakeInitialized, setStakeInitialized] = useState<boolean>(false)
    const [useQrCode, setUseQrCode] = useState(true)
    const [stakeAmount, setStakeAmount] = useState<number | null>(null)
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [copied, setCopied] = useState(false)
    const router = useRouter()

    useEffect(() => {
        dispatch(updateCurrentPage(thisPage))
    }, [])

    const handlePlaceBetButtonClick = async () => {
        if (!stakeAmount || stakeAmount <= 0) {
            return;
        }

        setIsLoading(true)
        await dispatch(updateOwnerStakeAmountOnCurrentStakeData(stakeAmount))

        const payload: StakeInitiatorPayload = {
            placement: currentStakeData.ownerStakeplacement,
            stakeAmount: stakeAmount, // edge case for if the user places the stake amount by typing instead of clicking a button
            matchId: currentStakeData.matchId,
            home: currentStakeData.homeTeam,
            away: currentStakeData.awayTeam,
            public: isPublicStake,
        }

        const response: StakeInitializationResponse | null = await initializeStakeApiCall(payload)
        
        if (response) {
            dispatch(updateInviteCode(response.inviteCode))
            setStakeInitialized(true)
            setInviteCode(response.inviteCode)
        }
        setIsLoading(false)
    }

    const handleQrCodeToggleButtonClick = () => {
        setUseQrCode(!useQrCode)
    }

    const handleHomeButtonClick = () => {
        if (currentStakeData.homeTeam === currentStakeData.ownerStakeplacement) return;
        dispatch(updateOwnerPlacementOnCurrentStakeData(currentStakeData.homeTeam))
    }

    const handleAwayButtonClick = () => {
        if (currentStakeData.awayTeam === currentStakeData.ownerStakeplacement) return;
        dispatch(updateOwnerPlacementOnCurrentStakeData(currentStakeData.awayTeam))
    }

    const handleDrawButtonClick = () => {
        if (currentStakeData.ownerStakeplacement === "draw") return;
        dispatch(updateOwnerPlacementOnCurrentStakeData("draw"))
    }

    const handleCancelButtonClick = async () => {
        const response = await cancelStakePlacementApiCall(reduxStoreInviteCode)
        if (response && response.statusCode === 200) {
            setIsLoading(true)
            const stakeOwnerPlacement = currentStakeData.ownerStakeplacement
            dispatch(resetCurrentStakeData())
            dispatch(updateOwnerPlacementOnCurrentStakeData(stakeOwnerPlacement))
            setIsLoading(false)
            router.push('/main')
        }
    }

    const handleConfirmButtonClick = () => {
        setIsLoading(true)
        dispatch(resetCurrentStakeData())
        router.push("/stakes")
    }

    const handleQuickAmountButtonClick = (amount: number) => {
        setStakeAmount(amount)
    }

    const handleStakeCodeCopyButtonClick = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const potentialWin = stakeAmount ? stakeAmount * 2 : 0

    if (isLoading) {
        return (
            <div className="bg-[#1a2633] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
                    <h2 className="text-white text-sm">Loading...</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-[#1a2633]">
            {/* Header - Constrained width */}
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

            {/* Main Content Area - Constrained width */}
            <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-4 lg:px-6 lg:pt-6 lg:max-w-[1400px] lg:mx-auto lg:w-full">
                
                {/* Left Sidebar - Desktop Only */}
                <div className="hidden lg:block lg:w-[260px] xl:w-[280px] bg-[#16202C] rounded-lg p-4 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="text-[#FED800]" size={20} />
                        Match Info
                    </h3>
                    
                    {/* Match Details Card */}
                    <div className="bg-[#1a2633] rounded-lg p-4 mb-4 border border-gray-700">
                        <div className="text-center mb-4">
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

                    {/* Quick Stats */}
                    <div className="space-y-2">
                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-xs">Your Balance</span>
                                <span className="text-[#FED800] font-bold text-sm">
                                    KES {userData.account_balance?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                        
                        {stakeAmount && (
                            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Potential Win</span>
                                    <span className="text-[#60991A] font-bold text-sm">
                                        KES {potentialWin.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Content - Scrollable */}
                <div className="flex-1 overflow-y-auto pb-24 lg:pb-4 px-4 lg:px-0 lg:min-w-0">
                    {stakeInitialized ? (
                        /* Success State */
                        <div className="max-w-2xl mx-auto pt-4 lg:pt-8">
                            {/* Success Card */}
                            <div className="bg-[#1a2633] rounded-xl overflow-hidden border border-gray-700 mb-6">
                                {/* Success Header */}
                                <div className="bg-gradient-to-r from-[#60991A]/20 to-[#60991A]/10 border-l-4 border-[#60991A] px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#60991A] flex items-center justify-center">
                                            <Check size={28} className="text-black font-bold" />
                                        </div>
                                        <div>
                                            <h2 className="text-[#60991A] text-2xl font-bold">Bet Placed!</h2>
                                            <p className="text-gray-300 text-sm">Share with a friend to complete the stake</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bet Summary */}
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#16202C] rounded-lg p-4 border border-gray-700">
                                            <div className="text-gray-400 text-xs mb-1">Stake Amount</div>
                                            <div className="text-[#FED800] text-2xl font-bold">
                                                {currentStakeData.ownerStakeAmount} KES
                                            </div>
                                        </div>
                                        <div className="bg-[#16202C] rounded-lg p-4 border border-gray-700">
                                            <div className="text-gray-400 text-xs mb-1">Your Pick</div>
                                            <div className="text-white text-xl font-bold capitalize">
                                                {currentStakeData.ownerStakeplacement}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#16202C] rounded-lg p-4 border border-gray-700">
                                        <div className="text-gray-400 text-xs mb-1">Potential Win</div>
                                        <div className="text-[#60991A] text-2xl font-bold">
                                            {potentialWin.toLocaleString()} KES
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Share Options */}
                            <div className="bg-[#1a2633] rounded-xl p-6 border border-gray-700 mb-6">
                                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                    <Share2 size={20} className="text-[#FED800]" />
                                    Share Your Bet
                                </h3>

                                {/* Toggle Buttons */}
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => setUseQrCode(true)}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            useQrCode 
                                                ? 'bg-[#FED800] text-black' 
                                                : 'bg-[#16202C] text-gray-300 hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <QrCode size={20} />
                                        QR Code
                                    </button>
                                    <button
                                        onClick={() => setUseQrCode(false)}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            !useQrCode 
                                                ? 'bg-[#FED800] text-black' 
                                                : 'bg-[#16202C] text-gray-300 hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <Copy size={20} />
                                        Code
                                    </button>
                                </div>

                                {/* Content */}
                                {useQrCode ? (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-lg mb-4">
                                            {reduxStoreInviteCode && (
                                                <GeneratedQrCode code={reduxStoreInviteCode} />
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm text-center">
                                            Let your friend scan this code to join the bet
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-3">Share this code:</p>
                                        <div className="flex items-center gap-2 bg-[#16202C] rounded-lg p-4 border border-gray-700">
                                            <code className="flex-1 text-[#FED800] font-mono text-lg break-all">
                                                {reduxStoreInviteCode || 'Loading...'}
                                            </code>
                                            <button
                                                onClick={handleStakeCodeCopyButtonClick}
                                                className="bg-[#FED800] hover:bg-[#ffd700] text-black p-3 rounded-lg transition-colors shrink-0"
                                            >
                                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>
                                        {copied && (
                                            <p className="text-[#60991A] text-xs text-center mt-2 animate-pulse">
                                                Copied!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelButtonClick}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <X size={20} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmButtonClick}
                                    className="flex-1 bg-[#60991A] hover:bg-[#4d7a15] text-black font-bold py-4 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Confirm
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Betting State */
                        <div className=" mx-auto pt-4 lg:pt-8">
                            {/* Page Title - Mobile */}
                            <div className="mb-6">
                                {/* Mobile Layout */}
                                <div className="lg:hidden flex flex-col gap-4">
                                    <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Place Your Bet</h1>
                                    <p className="text-gray-400 text-sm">Choose your prediction and amount</p>
                                    </div>
                                    
                                    {/* Toggle Button - Mobile */}
                                    <div className="relative bg-[#16202C] rounded-full p-1 border border-gray-700 w-fit">
                                    <div className="relative flex">
                                        {/* Sliding Background */}
                                        <div 
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r transition-all duration-300 ease-in-out rounded-full ${
                                            isPublicStake 
                                            ? 'left-1 from-[#60991A] to-[#4d7a15]' 
                                            : 'left-[calc(50%+2px)] from-[#FED800] to-[#ffd700]'
                                        }`}
                                        />
                                        
                                        {/* Public Button */}
                                        <button
                                        onClick={() => setIsPublicStake(true)}
                                        className={`relative z-10 px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                                            isPublicStake 
                                            ? 'text-black' 
                                            : 'text-gray-400'
                                        }`}
                                        >
                                        Public
                                        </button>
                                        
                                        {/* Private Button */}
                                        <button
                                        onClick={() => setIsPublicStake(false)}
                                        className={`relative z-10 px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                                            !isPublicStake 
                                            ? 'text-black' 
                                            : 'text-gray-400'
                                        }`}
                                        >
                                        Private
                                        </button>
                                    </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden lg:flex items-center justify-between">
                                    <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Place Your Bet</h1>
                                    <p className="text-gray-400 text-sm">Choose your prediction and amount</p>
                                    </div>
                                    
                                    {/* Toggle Button - Desktop */}
                                    <div className="relative bg-[#16202C] rounded-full p-1 border border-gray-700">
                                    <div className="relative flex">
                                        {/* Sliding Background */}
                                        <div 
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r transition-all duration-300 ease-in-out rounded-full ${
                                            isPublicStake 
                                            ? 'left-1 from-[#60991A] to-[#4d7a15]' 
                                            : 'left-[calc(50%+2px)] from-[#FED800] to-[#ffd700]'
                                        }`}
                                        />
                                        
                                        {/* Public Button */}
                                        <button
                                        onClick={() => setIsPublicStake(true)}
                                        className={`relative z-10 px-8 py-2.5 rounded-full font-semibold text-sm transition-colors duration-300 ${
                                            isPublicStake 
                                            ? 'text-black' 
                                            : 'text-gray-400'
                                        }`}
                                        >
                                        Public
                                        </button>
                                        
                                        {/* Private Button */}
                                        <button
                                        onClick={() => setIsPublicStake(false)}
                                        className={`relative z-10 px-8 py-2.5 rounded-full font-semibold text-sm transition-colors duration-300 ${
                                            !isPublicStake 
                                            ? 'text-black' 
                                            : 'text-gray-400'
                                        }`}
                                        >
                                        Private
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {/* Match Card - Mobile */}
                            <div className="lg:hidden bg-[#1a2633] rounded-lg p-4 mb-6 border border-gray-700">
                                <div className="flex items-center justify-between">
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
                            </div>

                            {/* Selection Section */}
                            <div className="bg-[#1a2633] rounded-xl p-6 border border-gray-700 mb-6">
                                <h3 className="text-white font-bold text-lg mb-4">Your Prediction</h3>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={handleHomeButtonClick}
                                        className={`py-4 rounded-lg font-bold text-sm transition-all ${
                                            currentStakeData.ownerStakeplacement === currentStakeData.homeTeam
                                                ? 'bg-[#FED800] text-black scale-105'
                                                : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <div className="text-xs text-gray-400 mb-1">Home</div>
                                        {truncateTeamName(currentStakeData.homeTeam, 8)}
                                    </button>

                                    <button
                                        onClick={handleDrawButtonClick}
                                        className={`py-4 rounded-lg font-bold text-lg transition-all ${
                                            currentStakeData.ownerStakeplacement === "draw"
                                                ? 'bg-[#FED800] text-black scale-105'
                                                : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <div className="text-xs text-gray-400 mb-1">Draw</div>
                                        X
                                    </button>

                                    <button
                                        onClick={handleAwayButtonClick}
                                        className={`py-4 rounded-lg font-bold text-sm transition-all ${
                                            currentStakeData.ownerStakeplacement === currentStakeData.awayTeam
                                                ? 'bg-[#FED800] text-black scale-105'
                                                : 'bg-[#16202C] text-white hover:bg-[#23313D] border border-gray-700'
                                        }`}
                                    >
                                        <div className="text-xs text-gray-400 mb-1">Away</div>
                                        {truncateTeamName(currentStakeData.awayTeam, 8)}
                                    </button>
                                </div>
                            </div>

                            {/* Amount Section */}
                            <div className="bg-[#1a2633] rounded-xl p-6 border border-gray-700 mb-6">
                                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                    <DollarSign size={20} className="text-[#FED800]" />
                                    Stake Amount
                                </h3>

                                {/* Quick Amounts */}
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {quickAmountValues.map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => handleQuickAmountButtonClick(amount)}
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
                                disabled={!currentStakeData.ownerStakeplacement || !stakeAmount || stakeAmount <= 0}
                                className={`w-full py-5 rounded-xl font-bold text-lg transition-all ${
                                    currentStakeData.ownerStakeplacement && stakeAmount && stakeAmount > 0
                                        ? 'bg-[#60991A] hover:bg-[#4d7a15] text-black active:scale-95'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {currentStakeData.ownerStakeplacement && stakeAmount 
                                    ? `Place Bet - ${stakeAmount} KES`
                                    : 'Select Prediction & Amount'
                                }
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Desktop Only */}
                <div className="hidden lg:block lg:w-[260px] xl:w-[280px] bg-[#16202C] rounded-lg p-4 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Betting Tips</h3>
                    
                    <div className="space-y-3">
                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Check Form</h4>
                                    <p className="text-gray-400 text-xs">Review recent performance</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Bet Responsibly</h4>
                                    <p className="text-gray-400 text-xs">Only stake what you can afford</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-xs font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Share Wisely</h4>
                                    <p className="text-gray-400 text-xs">Only with trusted friends</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h4 className="text-gray-300 text-sm font-semibold mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push('/main')}
                                className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-2 rounded-lg text-sm transition-all text-left border border-gray-700"
                            >
                                ← Back to Matches
                            </button>
                            <button
                                onClick={() => router.push('/stakes')}
                                className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-2 rounded-lg text-sm transition-all text-left border border-gray-700"
                            >
                                View My Bets →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Mobile Only */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}

export default function StakingPage() {
    return (
        <ProtectedRoute>
            <Staking />
        </ProtectedRoute>
    )
}