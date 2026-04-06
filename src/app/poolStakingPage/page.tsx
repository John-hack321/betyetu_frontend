'use client'
import { useEffect, useState } from "react"
import { Check, X, DollarSign, TrendingUp, Menu } from 'lucide-react'
import { useRouter } from "next/navigation"

import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"
import MenuOverlay from "../components/menuOverlay"

// redux imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector, useDispatch } from "react-redux"
import ProtectedRoute from "../components/protectedRoute"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { UpdateUserAmountToPoolStakingData } from "../app_state/slices/poolStakingData"
import { userJoinPoolStake, PoolStakeJoiningPayload } from "../api/poolStakes"
import { useAuth } from "../context/authContext"

// ─── Odds Button ──────────────────────────────────────────────────────────────

function getOddsStyle(pct: number): { bar: string; text: string } {
    if (pct >= 60) return { bar: 'bg-emerald-500', text: 'text-emerald-400' }
    if (pct >= 40) return { bar: 'bg-[#FED800]', text: 'text-[#FED800]' }
    if (pct >= 25) return { bar: 'bg-orange-400', text: 'text-orange-400' }
    return { bar: 'bg-red-500', text: 'text-red-400' }
}

interface OddsButtonProps {
    label: string
    pool: number
    totalPool: number
    clicked: boolean
    onClick: () => void
}

function OddsButton({ label, pool, totalPool, clicked, onClick }: OddsButtonProps) {
    const pct = totalPool > 0 ? Math.round((pool / totalPool) * 100) : 0
    const style = getOddsStyle(pct)
    const impliedOdds = totalPool > 0 && pool > 0 ? (totalPool / pool).toFixed(2) : '—'

    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-between
                w-full h-14 rounded-lg overflow-hidden
                border transition-all duration-200 select-none
                ${clicked
                    ? 'border-[#FED800] shadow-[0_0_12px_rgba(254,216,0,0.35)] scale-[1.03]'
                    : 'border-gray-600 hover:border-gray-500 active:scale-95'
                }
                bg-[#1a2633]
            `}
        >
            {/* Pool fill bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 ${style.bar} transition-all duration-500`}
                style={{ height: `${Math.max(pct, 4)}%`, opacity: clicked ? 0.35 : 0.22 }}
            />
            {clicked && <div className="absolute inset-0 bg-[#FED800]/10 rounded-lg" />}

            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-0.5 px-1">
                <span className={`text-[11px] font-bold tracking-widest uppercase ${clicked ? 'text-[#FED800]' : 'text-gray-400'}`}>
                    {label}
                </span>
                <span className={`text-base font-black ${clicked ? 'text-[#FED800]' : style.text}`}>
                    {pct}%
                </span>
                <span className={`text-[10px] font-semibold ${clicked ? 'text-[#FED800]' : 'text-white'}`}>
                    {impliedOdds}x
                </span>
            </div>
        </button>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function PoolStakingPageInner() {
    const thisPage = "main"
    const router = useRouter()

    const dispatch = useDispatch<AppDispatch>()
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const userData = useSelector((state: RootState) => state.userData)
    const currentPoolStakeData = useSelector((state: RootState) => state.poolStakingData)
    const poolStakeData = (useSelector((state: RootState) => state.poolMarketData.data))
        .find((p) => p.id === currentPoolStakeData.poolStakeId)

    const [selectedChoice, setSelectedChoice] = useState<"home" | "away" | "draw" | "">(
        currentPoolStakeData.userStakeChoice || ""
    )
    const [stakeAmount, setStakeAmount] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [betPlaced, setBetPlaced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const quickAmounts = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]

    // Menu state — local, not Redux
    const [menuOpen, setMenuOpen] = useState(false)
    const { logout } = useAuth()

    useEffect(() => {
        dispatch(updateCurrentPage(thisPage))
    }, [dispatch])

    const homePool  = poolStakeData?.home_pool  ?? 1
    const awayPool  = poolStakeData?.away_pool  ?? 1
    const drawPool  = poolStakeData?.draw_pool  ?? 1
    const totalPool = homePool + awayPool + drawPool

    const workOutPotentialWin = (side: "home" | "away" | "draw" | "", amount: number): number => {
        if (!amount || !side) return 0
        switch (side) {
            case "home": { const u = homePool + amount; return parseFloat(((amount * (u + awayPool + drawPool)) / u).toFixed(2)) }
            case "away": { const u = awayPool + amount; return parseFloat(((amount * (homePool + u + drawPool)) / u).toFixed(2)) }
            case "draw": { const u = drawPool + amount; return parseFloat(((amount * (homePool + awayPool + u)) / u).toFixed(2)) }
            default: return 0
        }
    }

    const potentialWin = stakeAmount ? workOutPotentialWin(selectedChoice, stakeAmount) : 0

    const handlePlaceBet = async () => {
        if (!stakeAmount || stakeAmount <= 0 || !selectedChoice) return
        setIsLoading(true)
        setError(null)
        dispatch(UpdateUserAmountToPoolStakingData(stakeAmount))
        const payload: PoolStakeJoiningPayload = {
            userStakeAmount: stakeAmount,
            userStakeChoice: selectedChoice as "home" | "away" | "draw",
            poolStakeId: currentPoolStakeData.poolStakeId,
        }
        try {
            await userJoinPoolStake(payload)
            setBetPlaced(true)
        } catch (err: any) {
            setError(err.message || "Failed to place bet. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a2633]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]" />
                    <p className="text-gray-400 text-sm">Placing your bet...</p>
                </div>
            </div>
        )
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (betPlaced) {
        return (
            <div className="flex flex-col h-screen bg-[#1a2633]">
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#60991A] flex items-center justify-center">
                                <Check size={32} className="text-black" strokeWidth={3} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-white text-center mb-1">Bet Placed!</h2>
                        <p className="text-gray-400 text-center text-sm mb-8">You've joined the pool market</p>

                        <div className="bg-[#1a2633] rounded-lg p-5 mb-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Match</span>
                                <span className="text-white font-semibold text-sm">
                                    {truncateTeamName(currentPoolStakeData.homeTeam, 10)} vs {truncateTeamName(currentPoolStakeData.awayTeam, 10)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Your pick</span>
                                <span className="text-[#FED800] font-bold capitalize">{selectedChoice}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Staked</span>
                                <span className="text-white font-bold">KES {stakeAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                <span className="text-gray-400 text-sm">Potential win</span>
                                <span className="text-[#60991A] font-black text-lg">KES {potentialWin.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => router.push('/main')} className="flex-1 bg-[#1a2633] text-gray-300 font-semibold py-3 rounded-lg transition-all">
                                Back to Matches
                            </button>
                            <button onClick={() => router.push('/stakes')} className="flex-1 bg-[#60991A] text-black font-bold py-3 rounded-lg transition-all">
                                View My Bets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-[#1a2633]">

            {/* Mobile Menu Overlay */}
            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* Header */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 lg:px-6 z-20">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
                        >
                            <Menu className="text-gray-300" size={24} />
                        </button>
                        <h1 className="text-2xl font-bold lg:text-3xl">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>
                    </div>
                    <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all">
                        Deposit
                    </button>
                </div>
            </div>

            {/* 3-col desktop / single mobile */}
            <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-6 lg:px-6 lg:pt-6 lg:max-w-[1400px] lg:mx-auto lg:w-full">

                {/* ── Left sidebar ─────────────────────────────────────────── */}
                <div className="hidden lg:block lg:w-[280px] bg-[#16202C] rounded-lg p-6 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4 flex items-center gap-2">
                        Match Info
                    </h3>

                    <div className="bg-[#1a2633] rounded-lg p-6 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <div className="text-white font-bold text-lg mb-2">
                                    {truncateTeamName(currentPoolStakeData.homeTeam, 10)}
                                </div>
                                <div className="text-sm text-gray-400">Home</div>
                            </div>
                            <div className="px-4">
                                <span className="text-[#FED800] font-bold text-2xl">VS</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-bold text-lg mb-2">
                                    {truncateTeamName(currentPoolStakeData.awayTeam, 10)}
                                </div>
                                <div className="text-sm text-gray-400">Away</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-[#1a2633] rounded-lg p-4 flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Balance</span>
                            <span className="text-[#FED800] font-bold text-base">
                                KES {userData.account_balance?.toLocaleString() || 0}
                            </span>
                        </div>
                        {stakeAmount && selectedChoice && (
                            <div className="bg-[#1a2633] rounded-lg p-4 flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Win</span>
                                <span className="text-[#60991A] font-semibold text-base">
                                    KES {potentialWin.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Center (no-scroll target) ─────────────────────────────── */}
                <div className="flex-1 overflow-y-auto pb-20 lg:pb-6 px-3 lg:px-0 lg:min-w-0">
                    <div className="lg:max-w-4xl mx-auto pt-2 lg:pt-8">

                        {/* Page title */}
                        <div className="mb-4 lg:mb-8">
                            <div className="lg:hidden flex flex-col gap-3">
                                <div>
                                    <h1 className="text-xl font-bold text-white mb-1">Place Your Bet</h1>
                                    <p className="text-gray-400 text-xs">Choose your prediction and amount</p>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center justify-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Place Your Bet</h1>
                                    <p className="text-gray-400 text-base">Choose your prediction and amount</p>
                                </div>
                            </div>
                        </div>

                        {/* Match card — mobile only */}
                        <div className="lg:hidden bg-[#1a2633] rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-center">
                                    <div className="text-white font-bold text-sm mb-1">
                                        {truncateTeamName(currentPoolStakeData.homeTeam, 12)}
                                    </div>
                                    <div className="text-xs text-gray-400">Home</div>
                                </div>
                                <div className="px-3">
                                    <span className="text-[#FED800] font-bold text-lg">VS</span>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="text-white font-bold text-sm mb-1">
                                        {truncateTeamName(currentPoolStakeData.awayTeam, 12)}
                                    </div>
                                    <div className="text-xs text-gray-400">Away</div>
                                </div>
                            </div>
                        </div>

                        {/* Prediction buttons — same wrapper style as stakingPage selection section */}
                        <div className="bg-[#1a2633] rounded-lg p-4 mb-4 lg:p-8 lg:mb-6">
                            <h3 className="text-white font-bold text-sm mb-3 lg:text-xl lg:mb-6">Your Prediction</h3>
                            <div className="grid grid-cols-3 gap-2 lg:gap-4">
                                <OddsButton
                                    label="1"
                                    pool={homePool}
                                    totalPool={totalPool}
                                    clicked={selectedChoice === "home"}
                                    onClick={() => setSelectedChoice(selectedChoice === "home" ? "" : "home")}
                                />
                                <OddsButton
                                    label="X"
                                    pool={drawPool}
                                    totalPool={totalPool}
                                    clicked={selectedChoice === "draw"}
                                    onClick={() => setSelectedChoice(selectedChoice === "draw" ? "" : "draw")}
                                />
                                <OddsButton
                                    label="2"
                                    pool={awayPool}
                                    totalPool={totalPool}
                                    clicked={selectedChoice === "away"}
                                    onClick={() => setSelectedChoice(selectedChoice === "away" ? "" : "away")}
                                />
                            </div>
                        </div>

                        {/* Amount section */}
                        <div className="bg-[#1a2633] rounded-lg p-4 mb-4 lg:p-8 lg:mb-6">
                            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2 lg:text-xl lg:mb-6">
                                <DollarSign size={16} className="text-[#FED800]" />
                                Stake Amount
                            </h3>

                            <div className="grid grid-cols-5 gap-1.5 mb-3 lg:gap-3 lg:mb-6">
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setStakeAmount(amount)}
                                        className={`py-2 rounded-lg font-semibold text-xs transition-all lg:py-4 lg:text-base ${
                                            stakeAmount === amount
                                                ? 'bg-[#FED800] text-black'
                                                : 'bg-[#16202C] text-white hover:bg-[#23313D]'
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
                                placeholder="Enter custom amount"
                                className="w-full bg-[#16202C] text-white rounded-lg px-3 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FED800] lg:px-6 lg:py-4 lg:text-lg"
                            />

                            {stakeAmount && stakeAmount > 0 && selectedChoice && (
                                <div className="mt-2 lg:mt-4 flex items-center justify-between text-xs lg:text-base">
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <TrendingUp size={12} />
                                        Potential win
                                    </span>
                                    <span className="text-[#60991A] font-semibold">
                                        KES {potentialWin.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 flex items-center gap-2 text-red-400 text-sm px-1">
                                <X size={14} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            onClick={handlePlaceBet}
                            disabled={!selectedChoice || !stakeAmount || stakeAmount <= 0}
                            className={`w-full py-3 rounded-lg font-bold text-sm transition-all lg:py-6 lg:text-xl ${
                                selectedChoice && stakeAmount && stakeAmount > 0
                                    ? 'bg-[#60991A] hover:bg-[#4d7a15] text-black active:scale-95'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {selectedChoice && stakeAmount && stakeAmount > 0
                                ? `Join Pool — KES ${stakeAmount}`
                                : 'Select Prediction & Amount'
                            }
                        </button>

                    </div>
                </div>

                {/* ── Right sidebar ─────────────────────────────────────────── */}
                <div className="hidden lg:block lg:w-[260px] bg-[#16202C] rounded-lg p-6 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Betting Tips</h3>
                    <div className="space-y-3">
                        {[
                            { n: '1', title: 'Check Form', desc: 'Review recent performance' },
                            { n: '2', title: 'Bet Responsibly', desc: 'Only stake what you can afford' },
                            { n: '3', title: 'Odds are dynamic', desc: 'Payout shifts as more people join' },
                        ].map((tip) => (
                            <div key={tip.n} className="bg-[#1a2633] rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-black text-sm font-bold">{tip.n}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm mb-1">{tip.title}</h4>
                                        <p className="text-gray-400 text-sm">{tip.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 space-y-2">
                        <button onClick={() => router.push('/main')} className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-3 rounded-lg text-sm transition-all text-left">
                            ← Back to Matches
                        </button>
                        <button onClick={() => router.push('/stakes')} className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-3 rounded-lg text-sm transition-all text-left">
                            View My Bets →
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer mobile */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}

export default function PoolStakingPage() {
    return (
        <ProtectedRoute>
            <PoolStakingPageInner />
        </ProtectedRoute>
    )
}