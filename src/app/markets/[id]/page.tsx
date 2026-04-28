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
    PredictionMarketReturnType
} from "@/app/api/predictionMarket"

import { useAuth } from "@/app/context/authContext"
import FooterComponent from "@/app/components/footer"

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from "react"
import {
    Menu, Search, ArrowLeft,
    ChevronDown, CheckCircle2, AlertCircle, Minus, Plus, X, Settings2, ChevronDownIcon
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

// ─── Types ────────────────────────────────────────────────────────
interface PricePoint {
    created_at: string
    yes_price_at_trade: number
    trade_type: string
    side: string
}

interface MarketData {
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

// ─── Custom Tooltip ───────────────────────────────────────────────
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

// ─── Trade bottom sheet — Polymarket style ───────────────────────
function TradeSheet({
    type,
    mode,
    side,
    yesPct,
    noPct,
    marketId,
    question,
    onClose,
}: {
    type: "normal" | "match_based"
    mode: 'buy' | 'sell'
    side: 'yes' | 'no'
    yesPct: number
    noPct: number
    marketId: number
    question: string
    onClose: () => void
}) {
    const [shares, setShares] = useState(0)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [visible, setVisible] = useState(false)
    const [currentMode, setCurrentMode] = useState<'buy' | 'sell'>(mode)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(onClose, 300)
    }

    const price = side === 'yes' ? yesPct / 100 : noPct / 100
    const total = shares * price * 100
    const toWin = shares * 100

    const handleConfirm = async () => {
        if (shares <= 0) return
        setLoading(true)
        setErr(null)
        try {
            if (currentMode === 'buy') await executeBuy(marketId, side, shares)
            else await executeSell(marketId, side, shares)
            setDone(true)
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
            {console.log('TradeSheet render', { visible, currentMode, side, marketId })}
            {/* Backdrop */}
            <div
                onClick={handleClose}
                className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
            />

            {/* Sheet — slides up from bottom */}
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

                {/* Header: buy/sell toggle + close */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                    <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        <button
                            onClick={() => setCurrentMode('buy')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                currentMode === 'buy'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Buy
                        </button>
                        <button
                            onClick={() => setCurrentMode('sell')}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                currentMode === 'sell'
                                    ? 'bg-amber-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Sell
                        </button>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Market name + side badge */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/40">
                    <p className="text-gray-300 text-sm leading-snug truncate flex-1 mr-3 max-w-[260px]">
                        {question.length > 55 ? question.slice(0, 55) + '…' : question}
                    </p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                        isYes
                            ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/25'
                            : 'text-red-300 bg-red-500/15 border border-red-500/25'
                    }`}>
                        {side.toUpperCase()}
                    </span>
                </div>

                {/* Scrollable body */}
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: 'calc(92vh - 130px)' }}
                >
                    <div className="px-4 py-5 space-y-5">

                        {/* Current Price (LMSR) */}
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
                                    className="bg-transparent text-white font-bold text-xl text-right w-28 focus:outline-none placeholder-gray-700 tabular-nums"
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

                        
                        {/* Divider */}
                        <div className="border-t border-gray-800/70" />

                        {/* Total + To win */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Total</span>
                                <span className={`font-semibold text-sm ${total > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {total > 0 ? `KES ${total.toFixed(2)}` : '$0'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                    {isBuy ? 'To win' : 'To receive'}
                                    <span className="w-3.5 h-3.5 rounded-full border border-gray-600 text-[9px] flex items-center justify-center text-gray-500 cursor-help">i</span>
                                </span>
                                <span className={`font-semibold text-sm flex items-center gap-1 ${toWin > 0 ? (isBuy ? 'text-emerald-400' : 'text-amber-400') : 'text-gray-500'}`}>
                                    {toWin > 0 && <span>{isBuy ? '💵' : '💰'}</span>}
                                    {toWin > 0 ? `KES ${toWin.toFixed(2)}` : '$0'}
                                </span>
                            </div>
                        </div>

                        {/* Error */}
                        {err && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2.5 rounded-lg border border-red-500/20">
                                <AlertCircle size={14} className="shrink-0" />
                                {err}
                            </div>
                        )}

                        {/* Trade CTA */}
                        <button
                            onClick={handleConfirm}
                            disabled={loading || shares <= 0 || done}
                            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: ctaColor }}
                        >
                            {done ? (
                                <><CheckCircle2 size={18} /> Done!</>
                            ) : loading ? (
                                <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</>
                            ) : (
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

// ─── Prediction Market Detail ─────────────────────────────────────
function PredictionMarketDetail({
    marketData,
    isScrolled,
}: {
    marketData: PredictionMarketDetailReturn
    isScrolled: boolean
}) {
    const [activeTime, setActiveTime] = useState<TimeFilter>('1W')
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
    const rulesPreview = shouldTruncateRules
        ? `${market.description.slice(0, 200).trimEnd()}...`
        : market.description

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
        // NOTE: This component renders inside a scrollable parent.
        // The buy/sell bar is rendered OUTSIDE this component, in the page layout.
        <div className="flex flex-col bg-[#1a2633]">

            {/* Category + question */}
            <div className={`sticky top-0 z-30 px-4 pt-2 pb-3 bg-[#1a2633] border-b ${isScrolled ? 'border-gray-700/70' : 'border-transparent'}`}>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">
                    {market.category}
                </p>
                <h1 className="text-white font-bold text-xl leading-snug">{market.question}</h1>
            </div>

            {/* Probability headline */}
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
                    <Image
                        src="/icons/favicon-32x32.png"
                        alt="peerstake"
                        width={28}
                        height={28}
                        className="opacity-60"
                    />
                    <span>peerstake</span>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full" style={{ height: 300 }}>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 8, right: 1, left: 8, bottom: 8 }}
                        >
                            <CartesianGrid horizontal={true} vertical={false} stroke="#334155" strokeDasharray="3 3" />
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
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                width={46}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {(chartView === 'yes' || chartView === 'both') && (
                                <Line
                                    type="monotone"
                                    dataKey="yesValue"
                                    name="Yes"
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f1923', strokeWidth: 2 }}
                                />
                            )}
                            {(chartView === 'no' || chartView === 'both') && (
                                <Line
                                    type="monotone"
                                    dataKey="noValue"
                                    name="No"
                                    stroke="#ef4444"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#ef4444', stroke: '#0f1923', strokeWidth: 2 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-600 text-sm">Not enough data for this period</p>
                    </div>
                )}
            </div>

            {/* Volume + Time filters */}
            <div className="flex items-center justify-between px-4 mb-2 gap-3 mt-4">
                <span className="text-gray-400 text-sm font-semibold">{volFormatted} Vol.</span>
                <div className="flex items-center gap-0.5 ml-auto">
                    {TIME_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveTime(f)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                activeTime === f
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                    <button
                        onClick={() => setChartSettingsOpen(true)}
                        aria-label="Open chart settings"
                        className="w-7 h-7 rounded-md border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 flex items-center justify-center transition-colors"
                    >
                        <Settings2 size={14} />
                    </button>
                </div>
            </div>

            {chartSettingsOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/55"
                        onClick={() => setChartSettingsOpen(false)}
                    />
                    <div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-700 bg-[#16202C] p-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white text-sm font-semibold">Chart display</h3>
                            <button
                                onClick={() => setChartSettingsOpen(false)}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
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

            {/* Divider */}
            <div className="h-px bg-gray-800/70 mx-4" />

            {/* Recent activity */}
            <div className="flex items-center justify-between px-4 mt-3 mb-2 gap-3 text-sm font-semibold border border-gray-700 rounded-lg p-3 mx-2">
                <span>Recent activity</span>
                <button onClick={() => handleRecentActivityButtonClick(market.id)}>
                    {showRecentActivity ? <X size={16} /> : <ChevronDownIcon size={16} />}
                </button>
            </div>

            {showRecentActivity && (
                <div className="mx-2 mb-4 border border-gray-700 rounded-lg bg-[#1a2633] h-60 overflow-y-auto p-2">
                    {activityData?.recent_trades.map((trade) => (
                        <div
                            key={`${trade.created_at}-${trade.shares}-${trade.kes_amount}`}
                            className={`grid grid-cols-3 gap-2 text-xs px-2 py-2 border-b border-gray-700/60 last:border-b-0 ${
                                trade.side?.toLowerCase() === 'no' ? 'bg-red-500/5 text-gray-100' : 'text-gray-200'
                            }`}
                        >
                            <span>{new Date(trade.created_at).toLocaleDateString()}</span>
                            <span>{trade.shares} shares</span>
                            <span className={trade.side?.toLowerCase() === 'no' ? 'text-red-300 font-semibold' : 'text-emerald-300 font-semibold'}>
                                KES {trade.kes_amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {!activityData?.recent_trades?.length && (
                        <p className="text-gray-400 text-xs px-2 py-3">No recent activity yet.</p>
                    )}
                </div>
            )}

            {/* Rules */}
            <div className="px-4 mb-4 mt-4">
                <div className="flex gap-6 mb-4">
                    <button className="text-white text-sm font-semibold pb-1 border-b-2 border-white">
                        Rules
                    </button>
                    <button className="text-gray-500 text-sm font-semibold pb-1 border-b-2 border-transparent">
                        Market Context
                    </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {showFullRules ? market.description : rulesPreview}
                </p>
                {shouldTruncateRules && (
                    <button
                        onClick={() => setShowFullRules(prev => !prev)}
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

            {/* Resolved */}
            {market.outcome && (
                <div className={`mx-4 mb-4 rounded-xl p-4 ${
                    market.outcome === 'yes'
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                }`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className={market.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400'} />
                        <span className={`font-bold text-sm uppercase ${market.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400'}`}>
                            Resolved {market.outcome}
                        </span>
                    </div>
                    {market.outcome_notes && (
                        <p className="text-gray-400 text-xs mt-1">{market.outcome_notes}</p>
                    )}
                </div>
            )}

            {/* Bottom spacer so last content isn't hidden behind buy/sell bar */}
            <div className="h-6" />

            {/*
                IMPORTANT: the buy/sell bar is NOT rendered here.
                It is rendered in MarketDetailPageInner as a flex-none sibling
                of the scrollable content area, sitting above the footer.
                We expose `sheet` state via the `onOpenSheet` prop below.
                See MarketDetailPageInner for the actual bar rendering.
            */}
        </div>
    )
}

// ─── Stubs ────────────────────────────────────────────────────────
function FixtureMarketDetail({ marketData }: { marketData: MatchPredictionMarketDetailReturn }) {
    if (!marketData) return <div className="p-4 text-gray-400">Loading...</div>
    return <div className="p-4 text-white">Fixture Market</div>
}

function GroupMarketDetail({ marketData }: { marketData: PredictionMarketGroupDetailReturn }) {
    if (!marketData) return <div className="p-4 text-gray-400">Loading...</div>
    return <div className="p-4 text-white">Group Market</div>
}

function MarketDetailContentRouter({
    marketType,
    marketData,
    isScrolled,
}: {
    marketType: "fixture" | "group" | "prediction" | ""
    marketData: any
    isScrolled: boolean
}) {
    if (!marketData) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FED800]" />
        </div>
    )
    switch (marketType) {
        case 'fixture': return <FixtureMarketDetail marketData={marketData} />
        case 'group': return <GroupMarketDetail marketData={marketData} />
        case 'prediction': return (
        <PredictionMarketDetail 
            marketData={marketData}
            isScrolled={isScrolled}
            />)
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
    const [buySellButtonsClicked ,setBuySellButtonsClicked]= useState<boolean>(false)

    // Buy/sell bar state — lives here so the bar can be flex-none in the layout
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

    // Derived market values for the buy/sell bar
    // for now we just do it for the prediction market type we will expand the logic later on to handle the other market types.
    
    const predMarket = marketData?.market as PredictionMarketReturnType 
    const predMarketYesPct = predMarket?.p_yes != null
    ? predMarket.p_yes * 100
    : predMarket
        ? predMarket.q_yes / Math.max(predMarket.q_yes + predMarket.q_no, 1) * 100
        : 50
    const noPct = 100 - predMarketYesPct
    const isLocked = false // market?.locks_at ? new Date(market.locks_at) < new Date() : false
    const isResolved = !!predMarket?.outcome

    const matchPredMarket = marketData?.market as MatchPredictionMarketReturnType
    const homePct = matchPredMarket?.q_home != null
    ? matchPredMarket.q_home / Math.max(matchPredMarket.q_home + matchPredMarket.q_draw + matchPredMarket.q_away, 1) * 100
    : 50
    const drawPct = matchPredMarket?.q_draw != null
    ? matchPredMarket.q_draw / Math.max(matchPredMarket.q_home + matchPredMarket.q_draw + matchPredMarket.q_away, 1) * 100
    : 50
    const awayPct = matchPredMarket?.q_away != null
    ? matchPredMarket.q_away / Math.max(matchPredMarket.q_home + matchPredMarket.q_draw + matchPredMarket.q_away, 1) * 100
    : 50
    const isMatchPredLocked = false    

    // a new way for handling how the coding buying window is pulled up
    const [sideChoiece , setSideChoice] = useState<{type:"normal" | "match_based" ,side: "yes" | "no"} | null>(null)
    const [mode, setMode] = useState<{option: "buy" | "sell"}>({option: "buy"})

    useEffect(() => {
        dispatch(updateCurrentPage('markets'))
        const init = async () => {
            try {
                setLoading(true)
                const type = marketType as "fixture" | "group" | "prediction"
                setMarketToRender(type || "")
                if (type) setMarketData(await fetchMarketDetail(marketId, type))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [marketId, marketType])

    return (
        // ── Outer shell: full screen flex column ──────────────────
        <div className="flex flex-col h-screen overflow-hidden bg-[#1a2633]">

            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* ── Header (flex-none) ── */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 md:px-6 z-20 md:border-none border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
                        >
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
                                {filterState.type === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Scrollable body (flex-1) ── */}
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
                    />
                )}
            </div>

            {/* ── Buy/sell bar (flex-none) — sits between scroll area and footer ── */}
            {/* TODO : make these buttons well reusable so that we dont have to code it for each market type from the ground up */}
            {!loading && marketToRender === 'prediction' && !isResolved && (
                <div className="flex-none bg-[#1a2633] border-t border-gray-800/60 px-4 py-3 lg:hidden">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                console.log('Buy Yes clicked', { isLocked, marketId: predMarket?.id });
                                // setSheet({ mode: 'buy', side: 'yes' }); we are chaing to the side choice type method for now
                                setSideChoice({type : "normal" , side : "yes"})
                                setBuySellButtonsClicked(true)
                            }}
                            disabled={isLocked}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 bg-[#1DA462] hover:bg-[#22c55e]"
                        >
                            Buy Yes {predMarketYesPct.toFixed(0)}¢
                        </button>
                        <button
                            onClick={() => {
                                console.log('Buy No clicked', { isLocked, marketId: predMarket?.id });
                                // setSheet({ mode: 'buy', side: 'no' });
                                setSideChoice({type: "normal" , side : "no"})
                                setBuySellButtonsClicked(true)
                            }}
                            disabled={isLocked}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 bg-[#ef4444] hover:bg-[#f87171]"
                        >
                            Buy No {noPct.toFixed(0)}¢
                        </button>
                    </div>
                </div>
            )}

            {/* ── Footer nav (flex-none) ── */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage={currentPage} publicStakeNumber={matchData.no_of_public_stakes} />
            </div>

            {/* Trade sheet — rendered at root so it overlays everything */}
            {buySellButtonsClicked && (
                <>
                    {console.log('Rendering TradeSheet', { sheet })}
                    {
                        sideChoiece?.type === "normal" ? (
                            <TradeSheet 
                                type="normal"
                                mode="buy"
                                side={sideChoiece.side}
                                yesPct={predMarketYesPct}
                                noPct={noPct}
                                marketId={marketId}
                                question={predMarket.question}
                                onClose={() => setBuySellButtonsClicked(false)} 
                            />
                        ) : (
                            <div>we will buld the trade sheet renderig logc of the fixture type here</div>
                        )
                    }
                </>
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