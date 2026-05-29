'use client'
import ProtectedRoute from "@/app/components/protectedRoute"
import MenuOverlay from "@/app/components/menuOverlay"
import {
    fetchMarketDetail,
    executeBuy,
    executeSell,
    PredictionMarketDetailReturn,
    MatchPredictionMarketDetailReturn,
    PredictionMarketGroupDetailReturn,
    fetchPredMktRecentTradeData,
    PredictionMarketGroupReturnType,
    MatchPredictionMarketReturnType,
    MatchPredictionMarketPriceHistory,
    PredictionMarketReturnType,
    fetchUserPositionForMarket,
    UserMarketPosition
} from "@/app/api/predictionMarket"

import { useAuth } from "@/app/context/authContext"
import FooterComponent from "@/app/components/footer"

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, useRef } from "react"
import {
    Menu, Search, ArrowLeft,
    ChevronDown, CheckCircle2, AlertCircle, Minus, Plus, X, Settings2, ChevronDownIcon,
    BookOpen
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"
import Image from "next/image"

import { RootState, AppDispatch } from "@/app/app_state/store"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { formatMatchDate } from "@/utils/dateUtils"
import { updateCurrentPage } from "@/app/app_state/slices/pageTracking"
import { truncateTeamName } from "@/app/components/fixtureCard"

type FilterType = 'all' | 'football' | 'kenya' | 'premier-league' | 'ucl' | 'afcon' | 'live' | 'closing-soon'

interface FilterState {
    type: FilterType
    leagueId: number | null
}

interface FilterTab {
    id: FilterType
    label: string
    dot?: boolean
}

// ─── Fixture market line colours ──────────────────────────────────
const FIXTURE_HOME_COLOR = '#10b981'  // emerald — home advantage
const FIXTURE_DRAW_COLOR = '#9ca3af'  // neutral grey — draw
const FIXTURE_AWAY_COLOR = '#f97316'  // orange — away challenger

// ─── Types ────────────────────────────────────────────────────────
interface PricePoint {
    created_at: string
    yes_price_at_trade: number
    trade_type: string
    side: string
}

interface MarketData { // why are we recreating this interface yet we have a PredictionMarketData type in the pred market api file ?
    id: number
    question: string
    description: string
    category: string
    q_yes: number
    q_no: number
    p_yes: number
    total_collected: number
    locks_at: string
    resolution_date: string
    resolution_source: string
    outcome: string | null
    outcome_notes: string | null
    created_at?: string
    resolution_criteria: string
}

export interface RecentPredMktTradeActivityReturnType {
    recent_trades: RecentPredMktTradeActivity[]
    count: number
}

export interface RecentPredMktTradeActivity {
    created_at: string
    market_id: number
    trade_type: string
    side: string
    shares: number
    kes_amount: number
    yes_price_at_trade: number
}

// ─── Custom Tooltip (prediction market YES/NO) ────────────────────
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const full: string = payload[0]?.payload?.fullDate

    const items = payload
        .filter((entry: any) => typeof entry?.value === 'number')
        .map((entry: any) => {
            const dataKey = entry?.dataKey
            const label = dataKey === 'noValue' ? 'No' : 'Yes'
            return {
                label,
                color: entry?.color || '#ffffff',
                value: `${(entry.value * 100).toFixed(0)}%`
            }
        })

    return (
        <div className="bg-[#1a2633] rounded-lg px-3 py-2 shadow-xl">
            <p className="text-gray-400 text-[11px] mb-1">{full}</p>
            <div className="space-y-0.5">
                {items.map((item: { label: string; color: string; value: string }) => (
                    <p key={item.label} className="font-black text-base" style={{ color: item.color }}>
                        {item.label}: {item.value}
                    </p>
                ))}
            </div>
        </div>
    )
}

// ─── Custom Tooltip (fixture market H/D/A) ────────────────────────
function FixtureChartTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const fullDate: string = payload[0]?.payload?.fullDate
    const lines = [
        { dataKey: 'homeValue', label: 'Home', color: FIXTURE_HOME_COLOR },
        { dataKey: 'drawValue', label: 'Draw', color: FIXTURE_DRAW_COLOR },
        { dataKey: 'awayValue', label: 'Away', color: FIXTURE_AWAY_COLOR },
    ]
    return (
        <div className="bg-[#0d1520] border border-gray-700/60 rounded-xl px-3 py-2.5 shadow-2xl">
            <p className="text-gray-400 text-[11px] mb-1.5">{fullDate}</p>
            {lines.map(({ dataKey, label, color }) => {
                const entry = payload.find((p: any) => p.dataKey === dataKey)
                if (!entry || typeof entry.value !== 'number') return null
                return (
                    <p key={label} className="text-sm font-bold leading-tight" style={{ color }}>
                        {label}: {(entry.value * 100).toFixed(0)}%
                    </p>
                )
            })}
        </div>
    )
}

const TIME_FILTERS = ['6H', '1D', '1W', '1M', 'MAX'] as const
type TimeFilter = typeof TIME_FILTERS[number]
type ChartView = 'yes' | 'no' | 'both'

function computeTicks(min: number, max: number) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
    if (max <= min) return [parseFloat(min.toFixed(2))]

    const range = max - min
    let step: number

    if (range <= 0.08) step = 0.02
    else if (range <= 0.20) step = 0.05
    else if (range <= 0.40) step = 0.10
    else if (range <= 0.60) step = 0.15
    else step = 0.20

    const toFixed2 = (n: number) => parseFloat(n.toFixed(2))
    const ticks = new Set<number>()
    ticks.add(toFixed2(min))
    ticks.add(toFixed2(max))

    let current = Math.ceil(min / step) * step
    while (current < max) {
        if (current > min) ticks.add(toFixed2(current))
        current += step
    }

    return Array.from(ticks).sort((a, b) => a - b)
}

// ─── Prediction market Trade sheet ───────────────────────────────
function TradeSheet({
    type,
    mode,
    side,
    yesPct,
    noPct,
    marketId,
    question,
    onClose,
    onTradeComplete,
}: {
    type: "normal" | "match_based"
    mode: 'buy' | 'sell'
    side: 'yes' | 'no'
    yesPct: number
    noPct: number
    marketId: number
    question: string
    onClose: () => void
    onTradeComplete?: () => void | Promise<void>
}) {
    const [shares, setShares] = useState(0)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [visible, setVisible] = useState(false)
    const [currentMode, setCurrentMode] = useState<'buy' | 'sell'>(mode)
    const [userPosition, setUserPosition] = useState<UserMarketPosition | null>(null)
    const [positionLoading, setPositionLoading] = useState(false)

    // trade sheet toggle amount / shares logic toggle helpers logic
    const [inputMode, setInputMode] = useState<'shares' | 'amount'>('shares')
    const [kesInput, setKesInput] = useState(0)

    // this API call helper is for the buy amount for shares logic 
    const buyByAmount = async (marketId: number, amount: number, side: string) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/prediction_markets/buy_shares_of_x_amount?market_id=${marketId}&amount=${amount}&side=${side}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        )
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.detail || "Trade failed")
        }
        return response.json()
    }

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    // Fetch user position when component mounts or side changes
    useEffect(() => {
        const fetchPosition = async () => {
            if (currentMode === 'sell') {
                setPositionLoading(true)
                try {
                    const position = await fetchUserPositionForMarket(marketId, side)
                    setUserPosition(position)
                } catch (error: any) {
                    console.error('Failed to fetch position:', error)
                    setUserPosition(null)
                } finally {
                    setPositionLoading(false)
                }
            }
        }

        fetchPosition()
    }, [marketId, side, currentMode])

    const handleClose = () => {
        setVisible(false)
        setTimeout(onClose, 300)
    }

    const price = side === 'yes' ? yesPct / 100 : noPct / 100
    const total = shares * price
    const toWin = shares

    const handleConfirm = async () => {
        if (inputMode === 'shares' && shares <= 0) return
        if (inputMode === 'amount' && kesInput <= 0) return
        setLoading(true)
        setErr(null)
        try {
            if (currentMode === 'buy') {
                if (inputMode === 'amount') {
                    await buyByAmount(marketId, kesInput, side)
                } else {
                    await executeBuy(marketId, side, shares)
                }
            } else {
                await executeSell(marketId, side, shares)
            }
            setDone(true)
            await onTradeComplete?.()
            setTimeout(() => { setDone(false); handleClose() }, 1400)
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const quickDeltas = [-100, -10, +10, +100, +200]
    const isYes = side === 'yes'
    const isBuy = currentMode === 'buy'
    const ctaColor = done ? '#10b981' : isBuy ? (isYes ? '#1DA462' : '#ef4444') : '#f59e0b'

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
            />
            <div
                className="fixed left-0 right-0 z-[9999] rounded-t-2xl overflow-hidden"
                style={{
                    bottom: 0,
                    background: '#16202C',
                    maxHeight: '92vh',
                    transform: visible ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-9 h-1 rounded-full bg-gray-600" />
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">

                    {/* buy sell toggle at the top left corner of the sheet dialog box */}
                    <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        <button
                            onClick={() => setCurrentMode('buy')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${currentMode === 'buy' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >Buy</button>
                        <button
                            onClick={() => setCurrentMode('sell')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${currentMode === 'sell' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >Sell</button>
                    </div>

                    {/* close button at the top right corner of the sheet dialog box */}
                    <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <X size={17} />
                    </button>
                    
                </div>

                {/* market question and side at the top of the sheet dialog box */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/40">
                    <p className="text-gray-300 text-sm leading-snug truncate flex-1 mr-3 max-w-[260px]">
                        {question.length > 55 ? question.slice(0, 55) + '…' : question}
                    </p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${isYes ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/25' : 'text-red-300 bg-red-500/15 border border-red-500/25'}`}>
                        {side.toUpperCase()}
                    </span>
                </div>

                {/* main content of the sheet dialog box - current price, mode toggle => shares vs amount, your position, shares input, quick deltas, sell all button, kes amount input, quick deltas, potential profit */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 130px)' }}>
                    <div className="px-4 py-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Current Price</span>
                            <span className="text-white font-bold text-lg tabular-nums">KES {price.toFixed(2)}</span>
                        </div>
                        
                        {/* Mode toggle - only show for buy mode (shares vs amount) */}
                        {currentMode === 'buy' && (
                            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 mb-1">
                                <button
                                    onClick={() => setInputMode('shares')}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        inputMode === 'shares'
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    By Shares
                                </button>
                                <button
                                    onClick={() => setInputMode('amount')}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        inputMode === 'amount'
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    By Amount (KES)
                                </button>
                            </div>
                        )}

                        {currentMode === 'sell' || inputMode === 'shares' ? (
                            <div>

                                {/* your position at the top of the sheet dialog box : dedicated for showing the user's position when selling : to give context for what shares to sell*/}
                                {currentMode === 'sell' && (
                                    <div className="mb-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Your Position</span>
                                            {positionLoading ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-500 border-t-gray-300 animate-spin" />
                                            ) : userPosition ? (
                                                <span className="text-white font-bold text-sm">
                                                    {userPosition.shares_held.toFixed(2)} shares
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs">No position</span>
                                            )}
                                        </div>
                                        {userPosition && (
                                            <div className="mt-2 pt-2 border-t border-gray-700/50">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Avg Cost:</span>
                                                    <span className="text-gray-300">KES {userPosition.average_cost_per_share.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs mt-1">
                                                    <span className="text-gray-500">Total Cost:</span>
                                                    <span className="text-gray-300">KES {userPosition.total_cost.toFixed(2)}</span>
                                                </div>
                                                {shares > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">P&L at sell:</span>
                                                            <span className={`font-semibold ${
                                                                (shares * price) - (shares * userPosition.average_cost_per_share) >= 0
                                                                    ? 'text-emerald-400'
                                                                    : 'text-red-400'
                                                            }`}>
                                                                {(shares * price) - (shares * userPosition.average_cost_per_share) >= 0 ? '+' : ''}
                                                                KES {((shares * price) - (shares * userPosition.average_cost_per_share)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-xs mt-1">
                                                            <span className="text-gray-500">Return:</span>
                                                            <span className={`font-semibold ${
                                                                ((shares * price) / (shares * userPosition.average_cost_per_share) - 1) * 100 >= 0
                                                                    ? 'text-emerald-400'
                                                                    : 'text-red-400'
                                                            }`}>
                                                                {((shares * price) / (shares * userPosition.average_cost_per_share) - 1) * 100 >= 0 ? '+' : ''}
                                                                {(((shares * price) / (shares * userPosition.average_cost_per_share) - 1) * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* shares input : NOTE : This is still under the sell side logic : to give context for what shares to sell */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-400 text-sm">Shares</span>
                                    <input
                                        type="number"
                                        value={shares || ''}
                                        onChange={e => {
                                            const val = Math.max(0, parseInt(e.target.value) || 0)
                                            // Prevent overselling for sell mode
                                            if (currentMode === 'sell' && userPosition) {
                                                setShares(Math.min(val, userPosition.shares_held))
                                            } else {
                                                setShares(val)
                                            }
                                        }}
                                        placeholder="0"
                                        max={currentMode === 'sell' && userPosition ? userPosition.shares_held : undefined}
                                        className={`bg-gray-800/50 text-white font-bold text-xl text-right w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-gray-800/70 placeholder-gray-500 tabular-nums rounded-lg px-3 py-1.5 border ${
                                            currentMode === 'sell' && userPosition && shares > userPosition.shares_held
                                                ? 'border-red-500/50 bg-red-500/10'
                                                : 'border-gray-700/50'
                                        }`}
                                    />
                                </div>

                                {/* error message for overselling : to give context for what shares to sell */}
                                {currentMode === 'sell' && userPosition && shares > userPosition.shares_held && (
                                    <div className="mb-3 text-red-400 text-xs flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        Cannot sell more than {userPosition.shares_held.toFixed(2)} shares
                                    </div>
                                )}

                                {/* quick deltas for shares input : to give context for what shares to sell */}
                                <div className="flex gap-1.5">
                                    {[-100, -10, +10, +100, +200].map((d, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const newShares = Math.max(0, shares + d)
                                                // Prevent overselling for sell mode
                                                if (currentMode === 'sell' && userPosition) {
                                                    setShares(Math.min(newShares, userPosition.shares_held))
                                                } else {
                                                    setShares(newShares)
                                                }
                                            }}
                                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors bg-[#23313D] hover:bg-[#2a3d4f] active:scale-95"
                                        >
                                            {d > 0 ? `+${d}` : d}
                                        </button>
                                    ))}
                                </div>

                                {/* sell all button : to give context for what shares to sell */}
                                {currentMode === 'sell' && userPosition && (
                                    <button
                                        onClick={() => setShares(userPosition.shares_held)}
                                        className="w-full mt-2 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30"
                                    >
                                        Sell All ({userPosition.shares_held.toFixed(2)} shares)
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* kes amount input : NOTE : This is still under the buy side logic : to give context for what amount to buy */
                            <div>
                                {/* kes amount input : NOTE : This is still under the buy side logic : to give context for what amount to buy */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-400 text-sm">KES Amount</span>
                                    <input
                                        type="number"
                                        value={kesInput || ''}
                                        onChange={e => setKesInput(Math.max(0, parseFloat(e.target.value) || 0))}
                                        placeholder="0"
                                        className="bg-gray-800/50 text-white font-bold text-xl text-right w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-gray-800/70 placeholder-gray-500 tabular-nums rounded-lg px-3 py-1.5 border border-gray-700/50"
                                    />
                                </div>
                                <div className="flex gap-1.5">
                                    {[50, 100, 200, 500, 1000].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setKesInput(amt)}
                                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors bg-[#23313D] hover:bg-[#2a3d4f] active:scale-95"
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-xs mt-2">
                                    You'll get approximately {Math.floor(kesInput / price || 0)} shares
                                </p>
                            </div>
                        )}
                        {/* the buy side input dialog box ends here now */}

                        {/* the total and to win section of the sheet dialog box : to give context for what total and to win */}
                        <div className="border-t border-gray-800/70" />
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Total</span>
                                <span className={`font-semibold text-sm ${
                                    (inputMode === 'amount' ? kesInput : (shares * price)) > 0
                                        ? 'text-emerald-400' : 'text-gray-500'
                                }`}>
                                    {inputMode === 'amount'
                                        ? kesInput > 0 ? `KES ${kesInput.toFixed(2)}` : 'KES 0'
                                        : (shares * price) > 0 ? `KES ${(shares * price).toFixed(2)}` : 'KES 0'
                                    }
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">{isBuy ? 'To win (approx)' : 'To receive'}</span>
                                <span className={`font-semibold text-sm ${
                                    (inputMode === 'amount' ? kesInput : (shares * price)) > 0
                                        ? (isBuy ? 'text-emerald-400' : 'text-amber-400')
                                        : 'text-gray-500'
                                }`}>
                                    {inputMode === 'amount'
                                        ? kesInput > 0 ? `${isBuy ? '💵' : '💰'} KES ${(kesInput / price).toFixed(2)}` : 'KES 0'
                                        : (shares * price) > 0 ? `${isBuy ? '💵' : '💰'} KES ${isBuy ? shares.toFixed(2) : (shares * price).toFixed(2)}` : 'KES 0'
                                    }
                                </span>
                            </div>
                            {isBuy && (inputMode === 'amount' ? kesInput : (shares * price)) > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Potential Profit</span>
                                    <span className={`font-semibold text-sm ${
                                        true ? 'text-emerald-400' : 'text-gray-500'
                                    }`}>
                                        {inputMode === 'amount'
                                            ? `+ KES ${(kesInput / price - kesInput).toFixed(2)}`
                                            : `+ KES ${(shares - shares * price).toFixed(2)}`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* error message for buy or sell : to give context for what to buy or sell */}
                        {err && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2.5 rounded-lg border border-red-500/20">
                                <AlertCircle size={14} className="shrink-0" />{err}
                            </div>
                        )}

                        {/* buy or sell button : to buy or sell the shares or amount */}
                        <button
                            onClick={handleConfirm}
                            disabled={
                                loading || 
                                done || 
                                (inputMode === 'shares' ? shares <= 0 : kesInput <= 0) ||
                                (currentMode === 'sell' && (!userPosition || shares > userPosition.shares_held))
                            }
                            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: ctaColor }}
                        >
                            {done ? (<><CheckCircle2 size={18} /> Done!</>) : loading ? (<><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</>) : (
                                currentMode === 'sell' && !userPosition ? 
                                    `No ${side.toUpperCase()} position to sell` :
                                    `${isBuy ? 'Buy' : 'Sell'} ${side.toUpperCase()}`
                            )}
                        </button>
                        <div className="h-2" />
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Fixture market Trade sheet ───────────────────────────────────
function FixtureTradeSheet({
    side: initialSide,
    homePct,
    drawPct,
    awayPct,
    marketId,
    homeTeam,
    awayTeam,
    onClose,
}: {
    side: 'home' | 'draw' | 'away'
    homePct: number
    drawPct: number
    awayPct: number
    marketId: number
    homeTeam: string
    awayTeam: string
    onClose: () => void
}) {
    const [shares, setShares] = useState(0)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [visible, setVisible] = useState(false)
    const [currentSide, setCurrentSide] = useState<'home' | 'draw' | 'away'>(initialSide)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(onClose, 300)
    }

    const sideColor = currentSide === 'home' ? FIXTURE_HOME_COLOR : currentSide === 'draw' ? FIXTURE_DRAW_COLOR : FIXTURE_AWAY_COLOR
    const sideLabel = currentSide === 'home' ? truncateTeamName(homeTeam, 12) : currentSide === 'draw' ? 'Draw' : truncateTeamName(awayTeam, 12)
    const price = currentSide === 'home' ? homePct / 100 : currentSide === 'draw' ? drawPct / 100 : awayPct / 100
    const total = shares * price * 100
    const toWin = shares * 100

    const handleConfirm = async () => {
        if (shares <= 0) return
        setLoading(true)
        setErr(null)
        try {
            await executeBuy(marketId, currentSide, shares)
            setDone(true)
            setTimeout(() => { setDone(false); handleClose() }, 1400)
        } catch (e: any) {
            setErr(e?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const quickDeltas = [-100, -10, +10, +100, +200]

    const sides: { key: 'home' | 'draw' | 'away'; label: string; pct: number; color: string }[] = [
        { key: 'home', label: truncateTeamName(homeTeam, 10), pct: homePct, color: FIXTURE_HOME_COLOR },
        { key: 'draw', label: 'Draw', pct: drawPct, color: FIXTURE_DRAW_COLOR },
        { key: 'away', label: truncateTeamName(awayTeam, 10), pct: awayPct, color: FIXTURE_AWAY_COLOR },
    ]

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
            />
            <div
                className="fixed left-0 right-0 z-[9999] rounded-t-2xl overflow-hidden"
                style={{
                    bottom: 0,
                    background: '#16202C',
                    maxHeight: '92vh',
                    transform: visible ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-9 h-1 rounded-full bg-gray-600" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                    <p className="text-white text-base font-semibold">Buy</p>
                    <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <X size={17} />
                    </button>
                </div>

                {/* Outcome selector — three pills */}
                <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-gray-800/40">
                    {sides.map(s => {
                        const isSelected = currentSide === s.key
                        return (
                            <button
                                key={s.key}
                                onClick={() => setCurrentSide(s.key)}
                                className="py-2.5 rounded-xl text-xs font-bold transition-all border"
                                style={{
                                    background: isSelected ? `${s.color}22` : 'transparent',
                                    borderColor: isSelected ? `${s.color}55` : '#374151',
                                    color: isSelected ? s.color : '#6b7280',
                                }}
                            >
                                <div className="text-[10px] opacity-80 mb-0.5 truncate px-1">{s.label}</div>
                                <div className="text-sm font-black">{s.pct.toFixed(0)}¢</div>
                            </button>
                        )
                    })}
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 165px)' }}>
                    <div className="px-4 py-5 space-y-5">

                        {/* Current price */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Current Price</span>
                            <span className="text-white font-bold text-lg tabular-nums">
                                {(price * 100).toFixed(0)}¢
                            </span>
                        </div>

                        {/* Shares */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">Shares</span>
                                <input
                                    type="number"
                                    value={shares || ''}
                                    onChange={e => setShares(Math.max(0, parseInt(e.target.value) || 0))}
                                    placeholder="0"
                                    className="bg-gray-800/50 text-white font-bold text-xl text-right w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-gray-800/70 placeholder-gray-500 tabular-nums rounded-lg px-3 py-2 border border-gray-700/50"
                                />
                            </div>
                            <div className="flex gap-1.5">
                                {quickDeltas.map((d, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setShares(prev => Math.max(0, prev + d))}
                                        className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors bg-[#23313D] hover:bg-[#2a3d4f] active:scale-95"
                                    >
                                        {d > 0 ? `+${d}` : d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-800/70" />

                        {/* Summary */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Total</span>
                                <span className={`font-semibold text-sm ${total > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {total > 0 ? `KES ${total.toFixed(2)}` : '$0'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">To win</span>
                                <span className={`font-semibold text-sm ${toWin > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {toWin > 0 ? `💵 KES ${toWin.toFixed(2)}` : '$0'}
                                </span>
                            </div>
                        </div>

                        {err && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2.5 rounded-lg border border-red-500/20">
                                <AlertCircle size={14} className="shrink-0" />{err}
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            onClick={handleConfirm}
                            disabled={loading || shares <= 0 || done}
                            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: done ? '#10b981' : sideColor }}
                        >
                            {done ? (
                                <><CheckCircle2 size={18} /> Done!</>
                            ) : loading ? (
                                <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</>
                            ) : (
                                `Buy ${sideLabel}`
                            )}
                        </button>
                        <div className="h-2" />
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Prediction Market Detail ─────────────────────────────────────
function PredictionMarketDetail({
    marketData,
    isScrolled,
}: {
    marketData: PredictionMarketDetailReturn
    isScrolled: boolean
}) {
    const [activeTime, setActiveTime] = useState<TimeFilter>('1M')
    const [chartView, setChartView] = useState<ChartView>('yes')
    const [chartSettingsOpen, setChartSettingsOpen] = useState(false)
    const [showRecentActivity, setShowRecentActivity] = useState(false)
    const [showFullRules, setShowFullRules] = useState(false)

    if (!marketData) return null

    const market = marketData.market as unknown as MarketData
    const priceHistory: PricePoint[] = (marketData.price_history as unknown as PricePoint[]) || []

    const yesPct = market.p_yes != null
        ? market.p_yes * 100
        : market.q_yes / Math.max(market.q_yes + market.q_no, 1) * 100
    const noPct = 100 - yesPct
    const isLocked = market.locks_at ? new Date(market.locks_at) < new Date() : false

    const chartData = useMemo(() => {
        if (!priceHistory.length) return []
        let filtered = [...priceHistory]
        const now = new Date()
        const cutoffs: Record<TimeFilter, number> = {
            '6H': 6 * 60 * 60 * 1000,
            '1D': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000,
            'MAX': Infinity,
        }
        const cutoff = cutoffs[activeTime]
        if (cutoff !== Infinity) {
            filtered = filtered.filter(p => now.getTime() - new Date(p.created_at).getTime() <= cutoff)
        }
        if (!filtered.length) filtered = priceHistory
        return filtered.map((p, index) => {
            const d = new Date(p.created_at)
            const yesValue = p.yes_price_at_trade
            return {
                xIndex: index,
                yesValue,
                noValue: 1 - yesValue,
                side: p.side,
                label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            }
        })
    }, [priceHistory, activeTime])

    const latestYesVal = chartData.length ? chartData[chartData.length - 1].yesValue : yesPct / 100
    const firstYesVal = chartData.length ? chartData[0].yesValue : yesPct / 100
    const latestNoVal = chartData.length ? chartData[chartData.length - 1].noValue : noPct / 100
    const firstNoVal = chartData.length ? chartData[0].noValue : noPct / 100

    const activeLatestVal = chartView === 'no' ? latestNoVal : latestYesVal
    const activeFirstVal = chartView === 'no' ? firstNoVal : firstYesVal
    const activeDelta = activeLatestVal - activeFirstVal
    const trending = activeDelta >= 0
    const chanceLabel = chartView === 'both'
        ? `${Math.round(latestYesVal * 100)}% chance`
        : `${Math.round(activeLatestVal * 100)}% chance`
    const shouldTruncateRules = (market.description || '').length > 200

    const [activeDescriptionTab , setActiveDescriptionTab] = useState<"rules" | "context">("rules") // defaults to rules
    const rulesPreview = shouldTruncateRules
        ? `${market.resolution_criteria.slice(0, 200).trimEnd()}...`
        : market.resolution_criteria

    const volFormatted = market.total_collected >= 1_000_000
        ? `$${(market.total_collected / 1_000_000).toFixed(1)}M`
        : market.total_collected >= 1_000
            ? `$${(market.total_collected / 1_000).toFixed(1)}K`
            : `$${market.total_collected.toFixed(0)}`

    const yValues = chartData.flatMap(d => {
        if (chartView === 'both') return [d.yesValue, d.noValue]
        return [chartView === 'no' ? d.noValue : d.yesValue]
    })
    const dataMin = yValues.length ? Math.min(...yValues) : 0
    const dataMax = yValues.length ? Math.max(...yValues) : 1
    const padding = Math.max((dataMax - dataMin) * 0.15, 0.03)
    const yMin = Math.max(0, dataMin - padding)
    const yMax = Math.min(1, dataMax + padding)
    const yTicks = computeTicks(yMin, yMax)
    const xEdgeTicks = chartData.length > 0 ? [0, chartData.length - 1] : []

    const [activityData, setActivityData] = useState<RecentPredMktTradeActivityReturnType | null>(null)

    const handleRecentActivityButtonClick = async (market_id: number) => {
        if (showRecentActivity) {
            setShowRecentActivity(false)
            return
        }
        if (!activityData) {
            const fetchedActivityData: RecentPredMktTradeActivityReturnType = await fetchPredMktRecentTradeData(market_id)
            setActivityData(fetchedActivityData)
        }
        setShowRecentActivity(true)
    }

    return (
        <div className="flex flex-col bg-[#1a2633]">
            <div className={`sticky top-0 z-30 px-4 pt-2 pb-3 bg-[#1a2633] border-b ${isScrolled ? 'border-gray-700/70' : 'border-transparent'}`}>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">{market.category}</p>
                <h1 className="text-white font-bold text-xl leading-snug">{market.question}</h1>
            </div>

            <div className="px-4 mb-3 mt-6 flex items-baseline gap-2 justify-between">
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${chartView === 'no' ? 'text-red-400' : 'text-[#4ADE80]'}`}>
                        {chanceLabel}
                    </span>
                    {chartView !== 'both' && (
                        <span className={`text-sm font-semibold ${trending ? 'text-red-400' : 'text-emerald-400'}`}>
                            {trending ? '▾' : '▴'} {Math.abs(activeDelta * 100).toFixed(0)}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-gray-500/70 text-xl font-bold">
                    <Image src="/icons/favicon-32x32.png" alt="peerstake" width={28} height={28} className="opacity-60" />
                    <span>peerstake</span>
                </div>
            </div>
            <div className="w-full" style={{ height: 300 }}>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 8, right: 1, left: 8, bottom: 8 }}>
                            <CartesianGrid horizontal={true} vertical={false} stroke="#334155" strokeDasharray="3 3" />
                            <XAxis dataKey="xIndex" type="number" domain={[0, Math.max(chartData.length - 1, 0)]} ticks={xEdgeTicks} padding={{ left: 24, right: 24 }} allowDecimals={false} tickFormatter={value => chartData[value]?.label ?? ''} tick={{ fill: '#6b7280', fontSize: 14 }} tickLine={false} tickMargin={20} axisLine={false} interval="preserveStartEnd" />
                            <YAxis orientation="right" domain={[yMin, yMax]} ticks={yTicks} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} width={46} />
                            <Tooltip content={<CustomTooltip />} />
                            {(chartView === 'yes' || chartView === 'both') && (<Line type="monotone" dataKey="yesValue" name="Yes" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f1923', strokeWidth: 2 }} />)}
                            {(chartView === 'no' || chartView === 'both') && (<Line type="monotone" dataKey="noValue" name="No" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#0f1923', strokeWidth: 2 }} />)}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-600 text-sm">Not enough data for this period</p>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between px-4 mb-2 gap-3 mt-4">
                <span className="text-gray-400 text-sm font-semibold">{volFormatted} Vol.</span>
                <div className="flex items-center gap-0.5 ml-auto">
                    {TIME_FILTERS.map(f => (
                        <button key={f} onClick={() => setActiveTime(f)} className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${activeTime === f ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}>{f}</button>
                    ))}
                    <button onClick={() => setChartSettingsOpen(true)} aria-label="Open chart settings" className="w-7 h-7 rounded-md border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 flex items-center justify-center transition-colors">
                        <Settings2 size={14} />
                    </button>
                </div>
            </div>
            {chartSettingsOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/55" onClick={() => setChartSettingsOpen(false)} />
                    <div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-700 bg-[#16202C] p-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white text-sm font-semibold">Chart display</h3>
                            <button onClick={() => setChartSettingsOpen(false)} className="text-gray-400 hover:text-gray-200 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {(['yes', 'no', 'both'] as ChartView[]).map(v => (
                                <button key={v} onClick={() => { setChartView(v); setChartSettingsOpen(false) }} className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${chartView === v ? v === 'yes' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40' : v === 'no' ? 'bg-red-500/15 text-red-300 border-red-400/40' : 'bg-sky-500/15 text-sky-300 border-sky-400/40' : 'text-gray-300 border-gray-700 hover:border-gray-500'}`}>
                                    {v === 'yes' ? 'Yes line only' : v === 'no' ? 'No line only' : 'Show both lines'}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
            <div className="h-px bg-gray-800/70 mx-4" />
            <div className="flex items-center justify-between px-4 mt-3 mb-2 gap-3 text-sm font-semibold border border-gray-700 rounded-lg p-3 mx-2">
                <span>Recent activity</span>
                <button onClick={() => handleRecentActivityButtonClick(market.id)}>
                    {showRecentActivity ? <X size={16} /> : <ChevronDownIcon size={16} />}
                </button>
            </div>
            {showRecentActivity && (
                <div className="mx-2 mb-4 border border-gray-700 rounded-lg bg-[#1a2633] h-60 overflow-y-auto p-2">
                    {activityData?.recent_trades.map((trade) => (
                        <div key={`${trade.created_at}-${trade.shares}-${trade.kes_amount}`} className={`grid grid-cols-3 gap-2 text-xs px-2 py-2 border-b border-gray-700/60 last:border-b-0 ${trade.side?.toLowerCase() === 'no' ? 'bg-red-500/5 text-gray-100' : 'text-gray-200'}`}>
                            <span>{new Date(trade.created_at).toLocaleDateString()}</span>
                            <span>{trade.shares} shares</span>
                            <span className={trade.side?.toLowerCase() === 'no' ? 'text-red-300 font-semibold' : 'text-emerald-300 font-semibold'}>KES {trade.kes_amount.toLocaleString()}</span>
                        </div>
                    ))}
                    {!activityData?.recent_trades?.length && (<p className="text-gray-400 text-xs px-2 py-3">No recent activity yet.</p>)}
                </div>
            )}
            
            {/* market rules and description */}
            <div className="px-4 mb-4 mt-4">
                <div className="flex gap-6 mb-4">
                    <button 
                    onClick={() => setActiveDescriptionTab('rules')}
                    className={`text-gray-500 text-sm font-semibold pb-1 
                    ${activeDescriptionTab === 'rules' ? 'border-b-2 text-white border-white' : 'border-b-2 border-transparent'}`}>Rules</button>
                    
                    <button 
                    onClick={()=> setActiveDescriptionTab("context")}
                    className={`text-gray-500 text-sm font-semibold pb-1 
                    ${activeDescriptionTab === 'context' ? 'border-b-2 text-white border-white' : 'border-b-2 border-transparent'}`}>Market Context</button>
                </div>
                {
                    activeDescriptionTab === 'rules' ? ( // I named tihs activeRD to mean Rules and Description for the lack of a better word.
                        <>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {showFullRules ? market.resolution_criteria : rulesPreview}
                            </p>
                            {shouldTruncateRules && (
                                <button onClick={() => setShowFullRules(prev => !prev)} className="mt-2 text-xs font-semibold text-[#FED800] hover:text-[#ffd700] transition-colors">
                                    {showFullRules ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </>
                        
                    ) : (
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {market.description}
                        </p>
                    )
                }

                {market.resolution_source && (<p className="text-gray-500 text-xs mt-3">Resolution source: <span className="text-gray-300">{market.resolution_source}</span></p>)}
                {market.locks_at && (<p className="text-gray-500 text-xs mt-1">Closes: <span className="text-gray-300">{formatMatchDate(market.locks_at)}</span>{'  ·  '}Resolves: <span className="text-gray-300">{formatMatchDate(market.resolution_date)}</span></p>)}
            </div>

            {market.outcome && (
                <div className={`mx-4 mb-4 rounded-xl p-4 ${market.outcome === 'yes' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className={market.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400'} />
                        <span className={`font-bold text-sm uppercase ${market.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400'}`}>Resolved {market.outcome}</span>
                    </div>
                    {market.outcome_notes && (<p className="text-gray-400 text-xs mt-1">{market.outcome_notes}</p>)}
                </div>
            )}
            <div className="h-6" />
        </div>
    )
}

// ─── Full Fixture Market Detail ────────────────────────────────────
function FixtureMarketDetail({
    marketData,
    isScrolled,
}: {
    marketData: MatchPredictionMarketDetailReturn
    isScrolled: boolean
}) {
    const [activeTime, setActiveTime] = useState<TimeFilter>('1M')
    const [showFullRules, setShowFullRules] = useState(false)
    const [showRecentActivity, setShowRecentActivity] = useState(false)
    const [activityData, setActivityData] = useState<RecentPredMktTradeActivityReturnType | null>(null)

    const market = marketData.market
    const priceHistory: MatchPredictionMarketPriceHistory[] =
        (marketData.price_history as unknown as MatchPredictionMarketPriceHistory[]) || []

    const totalShares = Math.max(market.q_home + market.q_draw + market.q_away, 1)
    const homePct = (market.q_home / totalShares) * 100
    const drawPct = (market.q_draw / totalShares) * 100
    const awayPct = (market.q_away / totalShares) * 100

    const isLocked = market.locks_at ? new Date(market.locks_at) < new Date() : false
    const isResolved = !!market.market_status && ['resolved', 'settled'].includes(market.market_status.toLowerCase())

    // Chart data — filtered by selected time window
    const chartData = useMemo(() => {
        if (!priceHistory.length) return []
        let filtered = [...priceHistory]
        const now = new Date()
        const cutoffs: Record<TimeFilter, number> = {
            '6H': 6 * 60 * 60 * 1000,
            '1D': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000,
            'MAX': Infinity,
        }
        const cutoff = cutoffs[activeTime]
        if (cutoff !== Infinity) {
            filtered = filtered.filter(p => now.getTime() - new Date(p.created_at).getTime() <= cutoff)
        }
        if (!filtered.length) filtered = priceHistory
        return filtered.map((p, index) => {
            const d = new Date(p.created_at)
            return {
                xIndex: index,
                homeValue: p.home_price_at_trade,
                drawValue: p.draw_price_at_trade,
                awayValue: p.away_price_at_trade,
                side: p.side,
                label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            }
        })
    }, [priceHistory, activeTime])

    // Y-axis range across all three lines
    const yValues = chartData.flatMap(d => [d.homeValue, d.drawValue, d.awayValue])
    const dataMin = yValues.length ? Math.min(...yValues) : 0
    const dataMax = yValues.length ? Math.max(...yValues) : 1
    const padding = Math.max((dataMax - dataMin) * 0.15, 0.03)
    const yMin = Math.max(0, dataMin - padding)
    const yMax = Math.min(1, dataMax + padding)
    const yTicks = computeTicks(yMin, yMax)
    const xEdgeTicks = chartData.length > 0 ? [0, chartData.length - 1] : []

    const volFormatted = market.total_collected >= 1_000_000
        ? `$${(market.total_collected / 1_000_000).toFixed(1)}M`
        : market.total_collected >= 1_000
            ? `$${(market.total_collected / 1_000).toFixed(1)}K`
            : `$${market.total_collected.toFixed(0)}`

    // Which outcome is currently leading?
    const leadingOutcome = homePct >= drawPct && homePct >= awayPct
        ? { label: truncateTeamName(market.home_team, 14), pct: homePct, color: FIXTURE_HOME_COLOR }
        : awayPct >= drawPct
            ? { label: truncateTeamName(market.away_team, 14), pct: awayPct, color: FIXTURE_AWAY_COLOR }
            : { label: 'Draw', pct: drawPct, color: FIXTURE_DRAW_COLOR }

    const shouldTruncateRules = (market.description || '').length > 200
    const rulesPreview = shouldTruncateRules
        ? `${market.description.slice(0, 200).trimEnd()}...`
        : market.description

    const handleRecentActivityClick = async () => {
        if (showRecentActivity) { setShowRecentActivity(false); return }
        if (!activityData) {
            try {
                const data = await fetchPredMktRecentTradeData(market.id)
                setActivityData(data)
            } catch {}
        }
        setShowRecentActivity(true)
    }

    const sideColorForActivity = (side: string) =>
        side === 'home' ? FIXTURE_HOME_COLOR : side === 'away' ? FIXTURE_AWAY_COLOR : FIXTURE_DRAW_COLOR

    return (
        <div className="flex flex-col bg-[#1a2633]">

            {/* ── Sticky category + question ── */}
            <div className={`sticky top-0 z-30 px-4 pt-2 pb-3 bg-[#1a2633] border-b ${isScrolled ? 'border-gray-700/70' : 'border-transparent'}`}>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">{market.category}</p>
                <h1 className="text-white font-bold text-xl leading-snug">{market.question}</h1>
            </div>

            {/* ── Match header card — teams + score ── */}
            <div className="px-4 pt-5 pb-3">
                <div className="bg-[#131e28] rounded-2xl border border-white/5 p-4">
                    <div className="flex items-center">

                        {/* Home team */}
                        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black border"
                                style={{ background: `${FIXTURE_HOME_COLOR}18`, borderColor: `${FIXTURE_HOME_COLOR}35`, color: FIXTURE_HOME_COLOR }}
                            >
                                {market.home_team[0]}
                            </div>
                            <span className="text-white font-semibold text-sm text-center leading-tight px-1 truncate w-full text-center">
                                {truncateTeamName(market.home_team, 13)}
                            </span>
                            <span className="text-xs font-black" style={{ color: FIXTURE_HOME_COLOR }}>
                                {homePct.toFixed(0)}%
                            </span>
                        </div>

                        {/* Score / VS */}
                        <div className="flex flex-col items-center gap-1 px-3 shrink-0">
                            {market.home_score !== null && market.away_score !== null
                                && market.home_score !== undefined && market.away_score !== undefined ? (
                                <>
                                    <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
                                        {market.home_score} – {market.away_score}
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
                                </>
                            ) : (
                                <span className="text-[#FED800] font-black text-2xl">vs</span>
                            )}
                        </div>

                        {/* Away team */}
                        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black border"
                                style={{ background: `${FIXTURE_AWAY_COLOR}18`, borderColor: `${FIXTURE_AWAY_COLOR}35`, color: FIXTURE_AWAY_COLOR }}
                            >
                                {market.away_team[0]}
                            </div>
                            <span className="text-white font-semibold text-sm text-center leading-tight px-1 truncate w-full text-center">
                                {truncateTeamName(market.away_team, 13)}
                            </span>
                            <span className="text-xs font-black" style={{ color: FIXTURE_AWAY_COLOR }}>
                                {awayPct.toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Draw row */}
                    <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-white/5">
                        <div className="w-2 h-2 rounded-full" style={{ background: FIXTURE_DRAW_COLOR }} />
                        <span className="text-gray-400 text-xs">Draw</span>
                        <span className="text-xs font-bold" style={{ color: FIXTURE_DRAW_COLOR }}>{drawPct.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* ── Leading-outcome headline ── */}
            <div className="px-4 mb-3 flex items-baseline gap-2">
                <span className="text-2xl font-black" style={{ color: leadingOutcome.color }}>
                    {(leadingOutcome.pct * 100).toFixed(0)}% chance
                </span>
                <span className="text-sm text-gray-400 font-medium">— {leadingOutcome.label}</span>
            </div>

            {/* ── Three-outcome probability bar ── */}
            <div className="px-4 mb-5">
                <div className="flex h-2 rounded-full overflow-hidden gap-px">
                    <div className="transition-all duration-700 rounded-l-full" style={{ width: `${homePct}%`, background: FIXTURE_HOME_COLOR }} />
                    <div className="transition-all duration-700" style={{ width: `${drawPct}%`, background: FIXTURE_DRAW_COLOR }} />
                    <div className="transition-all duration-700 rounded-r-full" style={{ width: `${awayPct}%`, background: FIXTURE_AWAY_COLOR }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-semibold">
                    <span style={{ color: FIXTURE_HOME_COLOR }}>{truncateTeamName(market.home_team, 10)} {homePct.toFixed(0)}%</span>
                    <span style={{ color: FIXTURE_DRAW_COLOR }}>Draw {drawPct.toFixed(0)}%</span>
                    <span style={{ color: FIXTURE_AWAY_COLOR }}>{truncateTeamName(market.away_team, 10)} {awayPct.toFixed(0)}%</span>
                </div>
            </div>

            {/* ── Chart — three lines ── */}
            <div className="w-full" style={{ height: 280 }}>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 8, right: 1, left: 8, bottom: 8 }}>
                            <CartesianGrid horizontal vertical={false} stroke="#334155" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="xIndex"
                                type="number"
                                domain={[0, Math.max(chartData.length - 1, 0)]}
                                ticks={xEdgeTicks}
                                padding={{ left: 24, right: 24 }}
                                allowDecimals={false}
                                tickFormatter={value => chartData[value]?.label ?? ''}
                                tick={{ fill: '#6b7280', fontSize: 14 }}
                                tickLine={false}
                                tickMargin={20}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                orientation="right"
                                domain={[yMin, yMax]}
                                ticks={yTicks}
                                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                width={46}
                            />
                            <Tooltip content={<FixtureChartTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="homeValue"
                                name="Home"
                                stroke={FIXTURE_HOME_COLOR}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: FIXTURE_HOME_COLOR, stroke: '#0f1923', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="drawValue"
                                name="Draw"
                                stroke={FIXTURE_DRAW_COLOR}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: FIXTURE_DRAW_COLOR, stroke: '#0f1923', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="awayValue"
                                name="Away"
                                stroke={FIXTURE_AWAY_COLOR}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: FIXTURE_AWAY_COLOR, stroke: '#0f1923', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#131e28] border border-white/5 flex items-center justify-center">
                            <span className="text-gray-600 text-lg">📊</span>
                        </div>
                        <p className="text-gray-600 text-sm">Not enough trade data yet</p>
                    </div>
                )}
            </div>

            {/* ── Chart legend ── */}
            <div className="flex items-center justify-center gap-5 px-4 mb-3 mt-3">
                {[
                    { color: FIXTURE_HOME_COLOR, label: truncateTeamName(market.home_team, 12) },
                    { color: FIXTURE_DRAW_COLOR, label: 'Draw' },
                    { color: FIXTURE_AWAY_COLOR, label: truncateTeamName(market.away_team, 12) },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className="w-5 h-0.5 rounded-full" style={{ background: color }} />
                        <span className="text-xs text-gray-400 font-medium">{label}</span>
                    </div>
                ))}
            </div>

            {/* ── Volume + time filters ── */}
            <div className="flex items-center justify-between px-4 mb-6">
                <span className="text-gray-400 text-sm font-semibold">{volFormatted} Vol.</span>
                <div className="flex items-center gap-0.5">
                    {TIME_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveTime(f)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${activeTime === f ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-gray-800/70 mx-4 mb-5" />

            {/* ── Recent activity ── */}
            <div className="flex items-center justify-between text-sm font-semibold border border-gray-700 rounded-lg p-3 mx-2 mb-2">
                <span>Recent activity</span>
                <button onClick={handleRecentActivityClick}>
                    {showRecentActivity ? <X size={16} /> : <ChevronDownIcon size={16} />}
                </button>
            </div>
            {showRecentActivity && (
                <div className="mx-2 mb-4 border border-gray-700 rounded-lg bg-[#131e28] h-56 overflow-y-auto p-2">
                    {activityData?.recent_trades.map((trade, i) => (
                        <div
                            key={`${trade.created_at}-${i}`}
                            className="grid grid-cols-3 gap-2 text-xs px-2 py-2.5 border-b border-gray-700/50 last:border-b-0"
                        >
                            <span className="text-gray-400">{new Date(trade.created_at).toLocaleDateString()}</span>
                            <span className="text-gray-200">{trade.shares} shares</span>
                            <span className="font-semibold" style={{ color: sideColorForActivity(trade.side) }}>
                                {trade.side?.toUpperCase()} · KES {trade.kes_amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {!activityData?.recent_trades?.length && (
                        <p className="text-gray-400 text-xs px-2 py-3">No recent activity yet.</p>
                    )}
                </div>
            )}

            {/* ── Rules / Description ── */}
            <div className="px-4 mb-4 mt-2">
                <div className="flex gap-6 mb-4">
                    <button className="text-white text-sm font-semibold pb-1 border-b-2 border-white">Rules</button>
                    <button className="text-gray-500 text-sm font-semibold pb-1 border-b-2 border-transparent">Market Context</button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {showFullRules ? market.description : rulesPreview}
                </p>
                {shouldTruncateRules && (
                    <button
                        onClick={() => setShowFullRules(p => !p)}
                        className="mt-2 text-xs font-semibold text-[#FED800] hover:text-[#ffd700] transition-colors"
                    >
                        {showFullRules ? 'Show less' : 'Show more'}
                    </button>
                )}
                {market.resolution_source && (
                    <p className="text-gray-500 text-xs mt-3">
                        Resolution source: <span className="text-gray-300">{market.resolution_source}</span>
                    </p>
                )}
                {market.locks_at && (
                    <p className="text-gray-500 text-xs mt-1">
                        Closes: <span className="text-gray-300">{formatMatchDate(market.locks_at)}</span>
                        {'  ·  '}
                        Resolves: <span className="text-gray-300">{formatMatchDate(market.resolution_date)}</span>
                    </p>
                )}
            </div>

            {/* Bottom spacer — buy bar sits above footer */}
            <div className="h-6" />
        </div>
    )
}

// ─── Group Market stub ────────────────────────────────────────────

/**
 * GroupMarketDetail — drop-in replacement for the stub in
 * src/app/markets/[id]/page.tsx
 *
 * Paste this component into that file, replacing the existing GroupMarketDetail.
 * All imports it needs (executeBuy, executeSell, PredictionMarketGroupDetailReturn,
 * fetchPredMktRecentTradeData, RecentPredMktTradeActivityReturnType, formatMatchDate,
 * TradeSheet, computeTicks, TIME_FILTERS, TimeFilter) are already present in
 * that file.
 */


// ─── Palette — 4 distinct colours that read well on dark bg ──────
const GROUP_COLORS = ['#3b82f6', '#f59e0b', '#a78bfa', '#34d399'] as const
type GroupColor = typeof GROUP_COLORS[number]

// ─── Helpers ─────────────────────────────────────────────────────

function formatVolumeTiny(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
    return `$${n.toFixed(0)}`
}

const GROUP_TIME_CUTOFFS = {
    '6H': 6 * 3600_000,
    '1D': 86_400_000,
    '1W': 7 * 86_400_000,
    '1M': 30 * 86_400_000,
    'MAX': Infinity,
} as const
type GroupTimeFilter = keyof typeof GROUP_TIME_CUTOFFS

/** Build multi-line group chart from every sub-market trade (buy + sell). */
function buildGroupChartData(
    top4: PredictionMarketDetailReturn[],
    activeTime: GroupTimeFilter,
): Record<string, unknown>[] {
    const now = Date.now()
    const cutoff = GROUP_TIME_CUTOFFS[activeTime]

    const histories = top4.map(sm => ({
        defaultPrice: sm.market?.p_yes ?? 0.5,
        ph: [...(sm.price_history ?? [])]
            .filter(p => cutoff === Infinity || now - new Date(p.created_at).getTime() <= cutoff)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }))

    const timeSet = new Set<number>()
    histories.forEach(({ ph }) => {
        ph.forEach(p => timeSet.add(new Date(p.created_at).getTime()))
    })
    const sortedTimes = [...timeSet].sort((a, b) => a - b)
    if (!sortedTimes.length) return []

    return sortedTimes.map((t, i) => {
        const d = new Date(t)
        const point: Record<string, unknown> = {
            xIndex: i,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
        histories.forEach(({ defaultPrice, ph }, si) => {
            let price = defaultPrice
            for (const pt of ph) {
                if (new Date(pt.created_at).getTime() <= t) {
                    price = pt.yes_price_at_trade
                } else {
                    break
                }
            }
            point[`line${si}`] = price
        })
        return point
    })
}

function computeGroupTicks(min: number, max: number): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
        return [parseFloat(min.toFixed(2)), parseFloat(max.toFixed(2))].filter((v, i, a) => a.indexOf(v) === i)
    }
    const range  = max - min
    let step: number
    if      (range <= 0.08) step = 0.02
    else if (range <= 0.20) step = 0.05
    else if (range <= 0.40) step = 0.10
    else if (range <= 0.60) step = 0.15
    else                    step = 0.20

    const toF2 = (n: number) => parseFloat(n.toFixed(2))
    const ticks = new Set<number>()
    ticks.add(toF2(min)); ticks.add(toF2(max))
    let cur = Math.ceil(min / step) * step
    while (cur < max) { if (cur > min) ticks.add(toF2(cur)); cur += step }
    return Array.from(ticks).sort((a, b) => a - b)
}

// ─── Mini group chart tooltip ─────────────────────────────────────
function GroupChartTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const full: string = payload[0]?.payload?.fullDate
    return (
        <div className="bg-[#0d1520] border border-gray-700/60 rounded-xl px-3 py-2.5 shadow-2xl">
            <p className="text-gray-400 text-[11px] mb-1.5">{full}</p>
            {payload.map((entry: any) => (
                <p key={entry.dataKey} className="text-sm font-bold leading-tight" style={{ color: entry.color }}>
                    {entry.name}: {typeof entry.value === 'number' ? `${(entry.value * 100).toFixed(0)}%` : '—'}
                </p>
            ))}
        </div>
    )
}

// ─── Sub-market detail slide-over ────────────────────────────────
interface SubMarketSlideOverProps {
    subMarket: any          // PredictionMarketDetailReturn['market'] + option
    priceHistory: PricePoint[]
    color: GroupColor
    onClose: () => void
    onRefreshMarket?: () => void | Promise<void>
}

function SubMarketSlideOver({ subMarket, priceHistory, color, onClose, onRefreshMarket }: SubMarketSlideOverProps) {
    const [visible, setVisible] = useState(false)
    const [tradeSheet, setTradeSheet] = useState<{ side: 'yes' | 'no' } | null>(null)
    const [activeTime, setActiveTime] = useState<TimeFilter>('1M')
    const [chartView, setChartView] = useState<ChartView>('yes')
    const [chartSettingsOpen, setChartSettingsOpen] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(onClose, 300)
    }

    const yesPct  = (subMarket.p_yes ?? 0.5) * 100
    const noPct   = 100 - yesPct
    const isLocked = subMarket.locks_at ? new Date(subMarket.locks_at) < new Date() : false
    const isResolved = !!subMarket.outcome

    const chartData = useMemo(() => {
        if (!priceHistory.length) return []
        let filtered = [...priceHistory]
        const now = new Date()
        const cutoffs: Record<TimeFilter, number> = {
            '6H': 6 * 60 * 60 * 1000,
            '1D': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000,
            'MAX': Infinity,
        }
        const cutoff = cutoffs[activeTime]
        if (cutoff !== Infinity) {
            filtered = filtered.filter(p => now.getTime() - new Date(p.created_at).getTime() <= cutoff)
        }
        if (!filtered.length) filtered = priceHistory
        return filtered.map((p, index) => {
            const d = new Date(p.created_at)
            const yesValue = p.yes_price_at_trade
            return {
                xIndex: index,
                yesValue,
                noValue: 1 - yesValue,
                label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            }
        })
    }, [priceHistory, activeTime])

    const latestYesVal = chartData.length ? chartData[chartData.length - 1].yesValue : yesPct / 100
    const firstYesVal = chartData.length ? chartData[0].yesValue : yesPct / 100
    const latestNoVal = chartData.length ? chartData[chartData.length - 1].noValue : noPct / 100
    const firstNoVal = chartData.length ? chartData[0].noValue : noPct / 100
    const activeLatestVal = chartView === 'no' ? latestNoVal : latestYesVal
    const activeFirstVal = chartView === 'no' ? firstNoVal : firstYesVal
    const activeDelta = activeLatestVal - activeFirstVal
    const trending = activeDelta >= 0
    const chanceLabel = chartView === 'both'
        ? `${Math.round(latestYesVal * 100)}% chance`
        : `${Math.round(activeLatestVal * 100)}% chance`

    const volFormatted = (subMarket.total_collected ?? 0) >= 1_000_000
        ? `$${((subMarket.total_collected ?? 0) / 1_000_000).toFixed(1)}M`
        : (subMarket.total_collected ?? 0) >= 1_000
            ? `$${((subMarket.total_collected ?? 0) / 1_000).toFixed(1)}K`
            : `$${(subMarket.total_collected ?? 0).toFixed(0)}`

    const yValues = chartData.flatMap(d => {
        if (chartView === 'both') return [d.yesValue, d.noValue]
        return [chartView === 'no' ? d.noValue : d.yesValue]
    })
    const dataMin = yValues.length ? Math.min(...yValues) : 0
    const dataMax = yValues.length ? Math.max(...yValues) : 1
    const padding = Math.max((dataMax - dataMin) * 0.15, 0.03)
    const yMin = Math.max(0, dataMin - padding)
    const yMax = Math.min(1, dataMax + padding)
    const yTicks = computeTicks(yMin, yMax)
    const xEdgeTicks = chartData.length > 0 ? [0, chartData.length - 1] : []

    return (
        <>
            {/* backdrop */}
            <div
                onClick={handleClose}
                className="fixed inset-0 z-[9990] bg-black/50 transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
            />

            {/* slide-over panel (slides from right) */}
            <div
                className="fixed top-0 right-0 bottom-0 z-[9995] w-full max-w-md bg-[#0f1923] overflow-hidden flex flex-col shadow-2xl"
                style={{
                    transform: visible ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-gray-800/60 bg-[#0f1923]">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            {subMarket.option ?? 'Sub-market'}
                        </span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto hide-vertical-scrollbar">
                    <div className="px-4 pt-5 pb-32">
                        {/* Category + question */}
                        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">
                            {subMarket.category}
                        </p>
                        <h2 className="text-white font-bold text-lg leading-snug mb-4">
                            {subMarket.question}
                        </h2>

                        {/* Chance + trend (matches individual prediction market) */}
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className={`text-2xl font-black ${chartView === 'no' ? 'text-red-400' : ''}`} style={chartView !== 'no' ? { color } : undefined}>
                                {chanceLabel}
                            </span>
                            {chartView !== 'both' && chartData.length > 1 && (
                                <span className={`text-sm font-semibold ${trending ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {trending ? '▾' : '▴'} {Math.abs(activeDelta * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>

                        {/* Price history chart */}
                        <div className="w-full -mx-1 mb-2" style={{ height: 240 }}>
                            {chartData.length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 8, right: 1, left: 8, bottom: 8 }}>
                                        <CartesianGrid horizontal={true} vertical={false} stroke="#334155" strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="xIndex"
                                            type="number"
                                            domain={[0, Math.max(chartData.length - 1, 0)]}
                                            ticks={xEdgeTicks}
                                            padding={{ left: 24, right: 24 }}
                                            allowDecimals={false}
                                            tickFormatter={value => chartData[value]?.label ?? ''}
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            tickLine={false}
                                            tickMargin={16}
                                            axisLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            orientation="right"
                                            domain={[yMin, yMax]}
                                            ticks={yTicks}
                                            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                                            tick={{ fill: '#6b7280', fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={42}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        {(chartView === 'yes' || chartView === 'both') && (
                                            <Line type="monotone" dataKey="yesValue" name="Yes" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f1923', strokeWidth: 2 }} />
                                        )}
                                        {(chartView === 'no' || chartView === 'both') && (
                                            <Line type="monotone" dataKey="noValue" name="No" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#0f1923', strokeWidth: 2 }} />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center rounded-lg bg-[#131e28]/50 border border-white/5">
                                    <p className="text-gray-600 text-sm">Not enough data for this period</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4 gap-2">
                            <span className="text-gray-400 text-xs font-semibold">{volFormatted} Vol.</span>
                            <div className="flex items-center gap-0.5">
                                {TIME_FILTERS.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveTime(f)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTime === f ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setChartSettingsOpen(true)}
                                    aria-label="Open chart settings"
                                    className="w-6 h-6 rounded-md border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 flex items-center justify-center transition-colors"
                                >
                                    <Settings2 size={12} />
                                </button>
                            </div>
                        </div>

                        {chartSettingsOpen && (
                            <>
                                <div className="fixed inset-0 z-[10010] bg-black/55" onClick={() => setChartSettingsOpen(false)} />
                                <div className="fixed left-1/2 top-1/2 z-[10011] w-[88%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-700 bg-[#16202C] p-4 shadow-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white text-sm font-semibold">Chart display</h3>
                                        <button onClick={() => setChartSettingsOpen(false)} className="text-gray-400 hover:text-gray-200 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {(['yes', 'no', 'both'] as ChartView[]).map(v => (
                                            <button
                                                key={v}
                                                onClick={() => { setChartView(v); setChartSettingsOpen(false) }}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                                                    chartView === v
                                                        ? v === 'yes'
                                                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                                                            : v === 'no'
                                                                ? 'bg-red-500/15 text-red-300 border-red-400/40'
                                                                : 'bg-sky-500/15 text-sky-300 border-sky-400/40'
                                                        : 'text-gray-300 border-gray-700 hover:border-gray-500'
                                                }`}
                                            >
                                                {v === 'yes' ? 'Yes line only' : v === 'no' ? 'No line only' : 'Show both lines'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="h-px bg-gray-800/70 mb-4" />

                        {/* YES / NO bar */}
                        <div className="mb-6">
                            <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                                <div className="bg-emerald-500 transition-all duration-700 rounded-l-full" style={{ width: `${yesPct}%` }} />
                                <div className="bg-red-500 transition-all duration-700 rounded-r-full"   style={{ width: `${noPct}%` }} />
                            </div>
                            <div className="flex justify-between mt-1.5 text-xs font-semibold">
                                <span className="text-emerald-400">YES {yesPct.toFixed(0)}%</span>
                                <span className="text-red-400">NO {noPct.toFixed(0)}%</span>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-[#131e28] rounded-xl p-3 border border-white/5">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Volume</p>
                                <p className="text-white font-black text-base">
                                    {formatVolumeTiny(subMarket.total_collected ?? 0)}
                                </p>
                            </div>
                            <div className="bg-[#131e28] rounded-xl p-3 border border-white/5">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Status</p>
                                <p className="text-white font-bold text-sm leading-tight capitalize">
                                    {isResolved ? 'Resolved' : isLocked ? 'Locked' : 'Open'}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-gray-300 font-semibold text-sm mb-2">
                                <BookOpen size={14} />
                                Rules
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {subMarket.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Resolved banner */}
                        {isResolved && (
                            <div className={`rounded-xl p-4 border mb-4 ${subMarket.outcome === 'yes' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className={subMarket.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400'} />
                                    <span className={`font-bold text-sm uppercase ${subMarket.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        Resolved {subMarket.outcome}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky buy bar */}
                {!isResolved && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#0f1923] border-t border-gray-800/60 px-4 py-3">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTradeSheet({ side: 'yes' })}
                                disabled={isLocked}
                                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 bg-[#1DA462] hover:bg-[#22c55e]"
                            >
                                Buy Yes {yesPct.toFixed(0)}¢
                            </button>
                            <button
                                onClick={() => setTradeSheet({ side: 'no' })}
                                disabled={isLocked}
                                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 bg-[#ef4444] hover:bg-[#f87171]"
                            >
                                Buy No {noPct.toFixed(0)}¢
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {tradeSheet && (
                <TradeSheet
                    type="normal"
                    mode="buy"
                    side={tradeSheet.side}
                    yesPct={yesPct}
                    noPct={noPct}
                    marketId={subMarket.id ?? 0}
                    question={subMarket.question ?? ''}
                    onClose={() => setTradeSheet(null)}
                    onTradeComplete={onRefreshMarket}
                />
            )}
        </>
    )
}

// ─── Main GroupMarketDetail ───────────────────────────────────────

interface GroupMarketDetailProps {
    marketData: PredictionMarketGroupDetailReturn
    isScrolled: boolean
    onRefreshMarket?: () => void | Promise<void>
}


export function GroupMarketDetail({ marketData, isScrolled, onRefreshMarket }: GroupMarketDetailProps) {
    const market     = marketData.market
    const subMarkets: PredictionMarketDetailReturn[] = marketData.sub_markets ?? []

    const ranked = useMemo(() => {
        return [...subMarkets]
            .map((sm, i) => ({ ...sm, originalIndex: i }))
            .sort((a, b) => (b.market?.p_yes ?? 0) - (a.market?.p_yes ?? 0))
    }, [subMarkets])

    const top4 = ranked.slice(0, 4)

    const TIME_FILTERS_LOCAL = ['6H', '1D', '1W', '1M', 'MAX'] as const
    const [activeTime, setActiveTime] = useState<GroupTimeFilter>('1M')

    const chartData = useMemo(
        () => buildGroupChartData(top4, activeTime),
        [top4, activeTime],
    )

    const yValues = chartData.flatMap(d => top4.map((_, si) => d[`line${si}`] as number).filter(Boolean))
    const dataMin = yValues.length ? Math.min(...yValues) : 0
    const dataMax = yValues.length ? Math.max(...yValues) : 1
    const pad     = Math.max((dataMax - dataMin) * 0.15, 0.03)
    const yMin    = Math.max(0, dataMin - pad)
    const yMax    = Math.min(1, dataMax + pad)
    const yTicks  = computeGroupTicks(yMin, yMax)
    const xEdgeTicks = chartData.length > 0 ? [0, chartData.length - 1] : []

    const totalVol = subMarkets.reduce((s, sm) => s + (sm.market?.total_collected ?? 0), 0)
    const volLabel  = formatVolumeTiny(totalVol)

    // ── Slide-over: opens when the sub-market label/row is clicked ──
    const [openSubMarket, setOpenSubMarket] = useState<{ sm: any; priceHistory: PricePoint[]; color: GroupColor } | null>(null)

    // ── Trade sheet: opens when Yes / No button is clicked ──────────
    const [tradeSheet, setTradeSheet] = useState<{ sm: any; side: 'yes' | 'no'; color: GroupColor } | null>(null)

    // Keep slide-over / list trade sheet in sync after a refetch (e.g. post sell)
    useEffect(() => {
        if (openSubMarket?.sm?.id != null) {
            const updated = subMarkets.find(s => s.market?.id === openSubMarket.sm.id)
            if (updated) {
                setOpenSubMarket(prev => prev ? {
                    ...prev,
                    sm: updated.market,
                    priceHistory: (updated.price_history ?? []) as PricePoint[],
                } : null)
            }
        }
        if (tradeSheet?.sm?.id != null) {
            const updated = subMarkets.find(s => s.market?.id === tradeSheet.sm.id)
            if (updated?.market) {
                setTradeSheet(prev => prev ? { ...prev, sm: updated.market } : null)
            }
        }
    }, [subMarkets])

    return (
        <div className="flex flex-col bg-[#1a2633]">

            {/* ── Sticky header ── */}
            <div className={`sticky top-0 z-30 px-4 pt-2 pb-3 bg-[#1a2633] border-b ${isScrolled ? 'border-gray-700/70' : 'border-transparent'}`}>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">
                    {subMarkets[0].market.category ?? 'Group Market'}
                </p>
                <h1 className="text-white font-bold text-xl leading-snug">{market.question}</h1>
            </div>

            {/* ── Summary probability bars (top-4 coloured) ── */}
            <div className="px-4 pt-5 pb-4">
                <div className="space-y-2.5">
                    {top4.map((sm, i) => {
                        const pct = (sm.market?.p_yes ?? 0) * 100
                        const color = GROUP_COLORS[i]
                        return (
                            <div key={sm.market?.id ?? i} className="flex items-center gap-2">
                                <div className="flex items-center gap-2 w-32 shrink-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                    <span className="text-white text-sm font-semibold truncate">
                                        {sm.market?.option ?? `Option ${i + 1}`}
                                    </span>
                                </div>
                                <span className="text-sm font-black w-12  tabular-nums" style={{ color }}>
                                    {pct.toFixed(0)}%
                                </span>
                            </div>
                        )
                    })}
                    {ranked.length > 4 && (
                        <p className="text-gray-600 text-xs pl-4">
                            +{ranked.length - 4} more options
                        </p>
                    )}
                </div>
            </div>

            {/* ── Chart — 4 coloured lines ── */}
            <div className="w-full" style={{ height: 280 }}>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 8, right: 1, left: 8, bottom: 8 }}>
                            <CartesianGrid horizontal vertical={false} stroke="#334155" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="xIndex" type="number"
                                domain={[0, Math.max(chartData.length - 1, 0)]}
                                ticks={xEdgeTicks}
                                padding={{ left: 24, right: 24 }}
                                allowDecimals={false}
                                tickFormatter={value => String(chartData[value]?.label ?? '')}
                                tick={{ fill: '#6b7280', fontSize: 14 }}
                                tickLine={false} tickMargin={20} axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                orientation="right"
                                domain={[yMin, yMax]}
                                ticks={yTicks}
                                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                tickLine={false} axisLine={false} width={46}
                            />
                            <Tooltip content={<GroupChartTooltip />} />
                            {top4.map((sm, i) => (
                                <Line
                                    key={i}
                                    type="monotone"
                                    dataKey={`line${i}`}
                                    name={sm.market?.option ?? `Option ${i + 1}`}
                                    stroke={GROUP_COLORS[i]}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: GROUP_COLORS[i], stroke: '#0f1923', strokeWidth: 2 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#131e28] border border-white/5 flex items-center justify-center">
                            <span className="text-gray-600 text-lg">📊</span>
                        </div>
                        <p className="text-gray-600 text-sm">Not enough trade data yet</p>
                    </div>
                )}
            </div>

            {/* ── Legend + vol + time filters ── */}
            <div className="px-4 mt-2 mb-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
                    {top4.map((sm, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-5 h-0.5 rounded-full" style={{ background: GROUP_COLORS[i] }} />
                            <span className="text-xs text-gray-400 font-medium">
                                {sm.market?.option ?? `Option ${i + 1}`}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-semibold">{volLabel} Vol.</span>
                    <div className="flex items-center gap-0.5">
                        {TIME_FILTERS_LOCAL.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveTime(f)}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${activeTime === f ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-gray-800/70 mx-4 mb-5" />

            {/* ── Sub-market list (all ranked) ── */}
            <div className="px-4 mb-4">
                <p className="text-gray-300 text-sm font-bold mb-3 uppercase tracking-wider text-[11px]">
                    All Outcomes
                </p>
                <div className="space-y-2">
                    {ranked.map((sm, i) => {
                        const pct    = (sm.market?.p_yes ?? 0) * 100
                        const color  = (GROUP_COLORS[i] ?? '#6b7280') as GroupColor
                        const isTop4 = i < 4
                        return (
                            <div
                                key={sm.market?.id ?? i}
                                className="transition-all overflow-hidden border-b border-gray-700/50 pb-2"
                            >
                                <div className="flex items-center gap-3 py-3">

                                    {/* Option label — click opens the slide-over */}
                                    <div
                                        className="flex-1 min-w-0 max-w-1/3 cursor-pointer"
                                        onClick={() => setOpenSubMarket({
                                            sm: sm.market,
                                            priceHistory: (sm.price_history ?? []) as PricePoint[],
                                            color: isTop4 ? color : '#6b7280' as GroupColor,
                                        })}
                                    >
                                        <div className="flex items-baseline justify-between mb-1.5">
                                            <span className="text-white font-semibold text-base leading-snug truncate pr-2">
                                                {sm.market?.option ?? `Option ${i + 1}`}
                                            </span>
                                            <span
                                                className="text-xs font-black tabular-nums shrink-0"
                                                style={{ color: isTop4 ? color : '#9ca3af' }}
                                            >
                                                {pct.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-custom-white-text-color text-sm">
                                                {formatVolumeTiny(sm.market?.total_collected ?? 0)} Vol.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Buy Yes / Buy No — click opens the TradeSheet directly */}
                                    <div className="flex justify-between w-2/3 shrink-0 gap-2">
                                        <button
                                            onClick={e => {
                                                e.stopPropagation()
                                                setTradeSheet({ sm: sm.market, side: 'yes', color: isTop4 ? color : '#6b7280' as GroupColor })
                                            }}
                                            className="flex-1 px-2.5 py-3 rounded-lg text-xs font-bold transition-all active:scale-95 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30"
                                        >
                                            {pct.toFixed(0)}¢
                                        </button>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation()
                                                setTradeSheet({ sm: sm.market, side: 'no', color: isTop4 ? color : '#6b7280' as GroupColor })
                                            }}
                                            className="flex-1 px-2.5 py-3 rounded-lg text-xs font-bold transition-all active:scale-95 bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30"
                                        >
                                            {(100 - pct).toFixed(0)}¢
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Rules ── */}
            <div className="px-4 mb-4">
                <div className="flex gap-6 mb-4">
                    <button className="text-white text-sm font-semibold pb-1 border-b-2 border-white">Rules</button>
                    <button className="text-gray-500 text-sm font-semibold pb-1 border-b-2 border-transparent">Market Context</button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {market.description || 'No description provided.'}
                </p>
                {market.resolution_source && (
                    <p className="text-gray-500 text-xs mt-3">
                        Resolution source: <span className="text-gray-300">{market.resolution_source}</span>
                    </p>
                )}
                {market.locks_at && (
                    <p className="text-gray-500 text-xs mt-1">
                        Closes: <span className="text-gray-300">{new Date(market.locks_at).toLocaleDateString()}</span>
                        {'  ·  '}
                        Resolves: <span className="text-gray-300">{new Date(market.resolutoin_date ?? market.resolution_date ?? market.locks_at).toLocaleDateString()}</span>
                    </p>
                )}
            </div>

            <div className="h-8" />

            {/* ── Sub-market slide-over (opens when label/row is clicked) ── */}
            {openSubMarket && (
                <SubMarketSlideOver
                    subMarket={openSubMarket.sm}
                    priceHistory={openSubMarket.priceHistory}
                    color={openSubMarket.color}
                    onClose={() => setOpenSubMarket(null)}
                    onRefreshMarket={onRefreshMarket}
                />
            )}

            {/* ── Trade sheet (opens when Yes / No button is clicked) ── */}
            {tradeSheet && (
                <TradeSheet
                    type="normal"
                    mode="buy"
                    side={tradeSheet.side}
                    yesPct={(tradeSheet.sm?.p_yes ?? 0.5) * 100}
                    noPct={100 - (tradeSheet.sm?.p_yes ?? 0.5) * 100}
                    marketId={tradeSheet.sm?.id ?? 0}
                    question={tradeSheet.sm?.question ?? ''}
                    onClose={() => setTradeSheet(null)}
                    onTradeComplete={onRefreshMarket}
                />
            )}
        </div>
    )
}

function MarketDetailContentRouter({
    marketType,
    marketData,
    isScrolled,
    onRefreshMarket,
}: {
    marketType: "fixture" | "group" | "prediction" | ""
    marketData: any
    isScrolled: boolean
    onRefreshMarket?: () => void | Promise<void>
}) {
    if (!marketData) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FED800]" />
        </div>
    )
    switch (marketType) {
        case 'fixture': return <FixtureMarketDetail marketData={marketData} isScrolled={isScrolled} />
        case 'group': return <GroupMarketDetail marketData={marketData} isScrolled={isScrolled} onRefreshMarket={onRefreshMarket} />
        case 'prediction': return <PredictionMarketDetail marketData={marketData} isScrolled={isScrolled} />
        default: return <div className="p-4 text-gray-400">Unknown market type</div>
    }
}

// ─── Page ─────────────────────────────────────────────────────────
function MarketDetailPageInner() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [menuOpen, setMenuOpen] = useState(false)
    const marketId = parseInt(params.id as string)
    const marketType = searchParams.get('type')
    const [marketToRender, setMarketToRender] = useState<"fixture" | "group" | "prediction" | "">("")
    const [marketData, setMarketData] = useState<PredictionMarketDetailReturn | MatchPredictionMarketDetailReturn | PredictionMarketGroupDetailReturn | null>(null)
    const [loading, setLoading] = useState(true)
    const [isBodyScrolled, setIsBodyScrolled] = useState(false)
    const [buySellButtonsClicked, setBuySellButtonsClicked] = useState<boolean>(false)

    const [sheet, setSheet] = useState<{ mode: 'buy' | 'sell'; side: 'yes' | 'no' } | null>(null)

    const filterTabs: FilterTab[] = [
        { id: 'all', label: 'All' },
        { id: 'football', label: 'Football' },
        { id: 'kenya', label: 'Kenya' },
        { id: 'premier-league', label: 'Premier League' },
        { id: 'ucl', label: 'UCL' },
        { id: 'afcon', label: 'AFCON' },
        { id: 'live', label: 'Live', dot: true },
        { id: 'closing-soon', label: 'Closing soon' },
    ]

    const [filterState, setFilterState] = useState<FilterState>({ type: 'all', leagueId: null })
    const handleTabClick = (tabId: FilterType) => setFilterState({ type: tabId, leagueId: null })

    const { logout } = useAuth()
    const dispatch = useDispatch<AppDispatch>()
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const matchData = useSelector((state: RootState) => state.allFixturesData)

    // Prediction market derived values
    const predMarket = marketData?.market as PredictionMarketReturnType
    const predMarketYesPct = predMarket?.p_yes != null
        ? predMarket.p_yes * 100
        : predMarket
            ? predMarket.q_yes / Math.max(predMarket.q_yes + predMarket.q_no, 1) * 100
            : 50
    const noPct = 100 - predMarketYesPct
    const isLocked = false
    const isResolved = !!predMarket?.outcome

    // Fixture market derived values
    const matchPredMarket = marketData?.market as MatchPredictionMarketReturnType
    const fixtureTotal = Math.max(
        (matchPredMarket?.q_home ?? 0) + (matchPredMarket?.q_draw ?? 0) + (matchPredMarket?.q_away ?? 0),
        1
    )
    const homePct = matchPredMarket?.q_home != null ? (matchPredMarket.q_home / fixtureTotal) * 100 : 33.3
    const drawPct = matchPredMarket?.q_draw != null ? (matchPredMarket.q_draw / fixtureTotal) * 100 : 33.4
    const awayPct = matchPredMarket?.q_away != null ? (matchPredMarket.q_away / fixtureTotal) * 100 : 33.3
    const isMatchPredLocked = false

    // Side choice state — supports both pred market and fixture market sides
    const [sideChoiece, setSideChoice] = useState<{
        type: "normal" | "match_based"
        side: "yes" | "no" | "home" | "draw" | "away"
    } | null>(null)
    const [mode] = useState<{ option: "buy" | "sell" }>({ option: "buy" })

    const loadMarketDetail = async () => {
        const type = marketType as "fixture" | "group" | "prediction"
        setMarketToRender(type || "")
        if (type) {
            const data = await fetchMarketDetail(marketId, type)
            setMarketData(data)
        }
    }

    useEffect(() => {
        dispatch(updateCurrentPage('markets'))
        const init = async () => {
            try {
                setLoading(true)
                await loadMarketDetail()
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [marketId, marketType])

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#1a2633]">

            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* ── Header ── */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 md:px-6 z-20 md:border-none border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden">
                            <Menu className="text-gray-300" size={24} />
                        </button>
                        <h1 className="text-2xl font-bold md:text-3xl">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all md:text-base">
                            Deposit
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Search className="text-gray-300" size={20} />
                        </button>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="mt-4 overflow-x-scroll hide-horizontal-scrollbar">
                    <div className="flex gap-6 min-w-max">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`pb-2 px-1 text-sm font-medium transition-colors relative flex items-center gap-1 whitespace-nowrap ${filterState.type === tab.id ? 'text-[#FED800]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                {tab.label}
                                {tab.dot && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                {filterState.type === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Scrollable body ── */}
            <div
                className="flex-1 overflow-y-auto bg-[#1a2633] hide-vertical-scrollbar"
                onScroll={(e) => setIsBodyScrolled(e.currentTarget.scrollTop > 0)}
            >
                <button
                    onClick={() => router.push('/markets')}
                    className="flex items-center w-full bg-[#1a2633] gap-1.5 px-4 pt-3 pb-0 text-gray-400 hover:text-white text-sm transition-colors group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Markets
                </button>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FED800]" />
                            <p className="text-gray-500 text-sm">Loading market…</p>
                        </div>
                    </div>
                ) : (
                    <MarketDetailContentRouter
                        marketType={marketToRender}
                        marketData={marketData}
                        isScrolled={isBodyScrolled}
                        onRefreshMarket={loadMarketDetail}
                    />
                )}
            </div>

            {/* ── Buy bar — prediction market ── */}
            {!loading && marketToRender === 'prediction' && !isResolved && (
                <div className="flex-none bg-[#1a2633] border-t border-gray-800/60 px-4 py-3 lg:hidden">
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setSideChoice({ type: "normal", side: "yes" }); setBuySellButtonsClicked(true) }}
                            disabled={isLocked}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 bg-[#1DA462] hover:bg-[#22c55e]"
                        >
                            Buy Yes {predMarketYesPct.toFixed(0)}¢
                        </button>
                        <button
                            onClick={() => { setSideChoice({ type: "normal", side: "no" }); setBuySellButtonsClicked(true) }}
                            disabled={isLocked}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 bg-[#ef4444] hover:bg-[#f87171]"
                        >
                            Buy No {noPct.toFixed(0)}¢
                        </button>
                    </div>
                </div>
            )}

            {/* ── Buy bar — fixture market (Home / Draw / Away) ── */}
            {!loading && marketToRender === 'fixture' && !isMatchPredLocked && (
                <div className="flex-none bg-[#1a2633] border-t border-gray-800/60 px-4 py-3 lg:hidden">
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setSideChoice({ type: "match_based", side: "home" }); setBuySellButtonsClicked(true) }}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97]"
                            style={{ background: FIXTURE_HOME_COLOR }}
                        >
                            <div className="text-[10px] opacity-80 mb-0.5">{truncateTeamName(matchPredMarket?.home_team || 'Home', 8)}</div>
                            <div>{homePct.toFixed(0)}¢</div>
                        </button>
                        <button
                            onClick={() => { setSideChoice({ type: "match_based", side: "draw" }); setBuySellButtonsClicked(true) }}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97]"
                            style={{ background: '#4b5563' }}
                        >
                            <div className="text-[10px] opacity-80 mb-0.5">Draw</div>
                            <div>{drawPct.toFixed(0)}¢</div>
                        </button>
                        <button
                            onClick={() => { setSideChoice({ type: "match_based", side: "away" }); setBuySellButtonsClicked(true) }}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97]"
                            style={{ background: FIXTURE_AWAY_COLOR }}
                        >
                            <div className="text-[10px] opacity-80 mb-0.5">{truncateTeamName(matchPredMarket?.away_team || 'Away', 8)}</div>
                            <div>{awayPct.toFixed(0)}¢</div>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Footer nav ── */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage={currentPage} publicStakeNumber={matchData.no_of_public_stakes} />
            </div>

            {/* ── Trade sheets ── */}
            {buySellButtonsClicked && sideChoiece && (
                sideChoiece.type === "normal" ? (
                    <TradeSheet
                        type="normal"
                        mode="buy"
                        side={sideChoiece.side as 'yes' | 'no'}
                        yesPct={predMarketYesPct}
                        noPct={noPct}
                        marketId={marketId}
                        question={predMarket?.question || ''}
                        onClose={() => setBuySellButtonsClicked(false)}
                    />
                ) : (
                    <FixtureTradeSheet
                        side={sideChoiece.side as 'home' | 'draw' | 'away'}
                        homePct={homePct}
                        drawPct={drawPct}
                        awayPct={awayPct}
                        marketId={marketId}
                        homeTeam={matchPredMarket?.home_team || ''}
                        awayTeam={matchPredMarket?.away_team || ''}
                        onClose={() => setBuySellButtonsClicked(false)}
                    />
                )
            )}
        </div>
    )
}

export default function MarketDetailPage() {
    return (
        <ProtectedRoute>
            <MarketDetailPageInner />
        </ProtectedRoute>
    )
}