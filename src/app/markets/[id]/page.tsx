'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Activity, Info, ChevronDown, ChevronUp, Check, X, DollarSign, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import {
    fetchMarketDetail,
    fetchPriceHistory,
    fetchBuyQuote,
    fetchSellQuote,
    executeBuy,
    executeSell,
    fetchMyPositions,
    MarketDetail,
    PricePoint,
    BuyQuote,
    SellQuote,
    UserPosition,
} from '../../api/predictionMarket'
import { formatMatchDate } from '@/utils/dateUtils'
import FooterComponent from '../../components/footer'
import { useSelector } from 'react-redux'
import { RootState } from '../../app_state/store'
import ProtectedRoute from '../../components/protectedRoute'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-[#1a2633] border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-gray-400 mb-1">{label}</p>
            <p className="text-emerald-400 font-bold">YES: {Math.round(payload[0]?.value * 100)}¢</p>
            <p className="text-red-400 font-bold">NO: {Math.round((1 - payload[0]?.value) * 100)}¢</p>
        </div>
    )
}

function MarketDetailPageInner() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const marketId = parseInt(params.id as string)
    const initialSide = searchParams.get('side') as 'yes' | 'no' | null

    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)

    const [market, setMarket] = useState<MarketDetail | null>(null)
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
    const [myPosition, setMyPosition] = useState<UserPosition | null>(null)
    const [loading, setLoading] = useState(true)

    // Trade state
    const [side, setSide] = useState<'yes' | 'no'>(initialSide || 'yes')
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState<number | null>(null)
    const [shares, setShares] = useState<number | null>(null)
    const [quote, setQuote] = useState<BuyQuote | SellQuote | null>(null)
    const [loadingQuote, setLoadingQuote] = useState(false)
    const [trading, setTrading] = useState(false)
    const [tradeSuccess, setTradeSuccess] = useState(false)
    const [tradeError, setTradeError] = useState<string | null>(null)
    const [showInfo, setShowInfo] = useState(false)

    useEffect(() => {
        loadData()
    }, [marketId])

    useEffect(() => {
        if (shares && shares > 0 && market) {
            getQuote()
        } else {
            setQuote(null)
        }
    }, [shares, side, tradeType])

    const loadData = async () => {
        setLoading(true)
        try {
            const [mkt, history, positions] = await Promise.all([
                fetchMarketDetail(marketId),
                fetchPriceHistory(marketId, 50),
                fetchMyPositions(),
            ])
            setMarket(mkt)
            setPriceHistory(history)
            const pos = positions.find(p => p.market_id === marketId && p.position_status === 'open')
            if (pos) setMyPosition(pos)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const getQuote = async () => {
        if (!shares || shares <= 0) return
        setLoadingQuote(true)
        try {
            if (tradeType === 'buy') {
                const q = await fetchBuyQuote(marketId, side, shares)
                setQuote(q)
            } else {
                const q = await fetchSellQuote(marketId, side, shares)
                setQuote(q)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingQuote(false)
        }
    }

    const handleTrade = async () => {
        if (!shares || shares <= 0) return
        setTrading(true)
        setTradeError(null)
        try {
            if (tradeType === 'buy') {
                await executeBuy(marketId, side, shares)
            } else {
                await executeSell(marketId, side, shares)
            }
            setTradeSuccess(true)
            setShares(null)
            setAmount(null)
            setQuote(null)
            await loadData()
            setTimeout(() => setTradeSuccess(false), 3000)
        } catch (e: any) {
            setTradeError(e?.response?.data?.detail || 'Trade failed. Please try again.')
        } finally {
            setTrading(false)
        }
    }

    const chartData = priceHistory.map((p, i) => ({
        name: `${i + 1}`,
        yes: p.yes_price,
        time: p.timestamp,
    }))

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f1923]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FED800]" />
                    <p className="text-gray-500 text-sm">Loading market...</p>
                </div>
            </div>
        )
    }

    if (!market) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f1923]">
                <p className="text-gray-400">Market not found.</p>
            </div>
        )
    }

    const yesPct = Math.round(market.yes_price * 100)
    const noPct = Math.round(market.no_price * 100)
    const isActive = market.market_status === 'active'

    return (
        <div className="flex flex-col min-h-screen bg-[#0f1923]">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0f1923]/95 backdrop-blur-sm border-b border-gray-800/60 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => router.push('/markets')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-white font-bold text-sm truncate">{market.question}</h1>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-gray-700 text-gray-400'
                            }`}>
                                {market.market_status.toUpperCase()}
                            </span>
                            {market.category && (
                                <span className="text-[10px] text-gray-500">{market.category}</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/markets/positions')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Activity size={18} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-5xl mx-auto px-4 py-5 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">

                    {/* Left: Info + Chart */}
                    <div>
                        {/* Price Display */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className={`rounded-xl p-4 border cursor-pointer transition-all ${
                                side === 'yes'
                                    ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                    : 'bg-[#16202C] border-gray-700/50 hover:border-emerald-500/30'
                            }`} onClick={() => { setSide('yes'); setTradeType('buy') }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Yes</span>
                                    <TrendingUp size={14} className="text-emerald-400" />
                                </div>
                                <div className="text-emerald-400 text-3xl font-black">{yesPct}¢</div>
                                <div className="text-emerald-600 text-xs mt-1">{yesPct}% probability</div>
                            </div>
                            <div className={`rounded-xl p-4 border cursor-pointer transition-all ${
                                side === 'no'
                                    ? 'bg-red-500/15 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                                    : 'bg-[#16202C] border-gray-700/50 hover:border-red-500/30'
                            }`} onClick={() => { setSide('no'); setTradeType('buy') }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">No</span>
                                    <TrendingDown size={14} className="text-red-400" />
                                </div>
                                <div className="text-red-400 text-3xl font-black">{noPct}¢</div>
                                <div className="text-red-600 text-xs mt-1">{noPct}% probability</div>
                            </div>
                        </div>

                        {/* Price bar */}
                        <div className="mb-5">
                            <div className="flex h-2 rounded-full overflow-hidden gap-px mb-1">
                                <div className="bg-emerald-500 transition-all duration-700 rounded-l-full" style={{ width: `${yesPct}%` }} />
                                <div className="bg-red-500 transition-all duration-700 rounded-r-full" style={{ width: `${noPct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Yes {yesPct}%</span>
                                <span>No {noPct}%</span>
                            </div>
                        </div>

                        {/* Chart */}
                        {chartData.length > 1 && (
                            <div className="bg-[#16202C] border border-gray-700/50 rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Price History</span>
                                    <span className="text-gray-600 text-xs">{chartData.length} trades</span>
                                </div>
                                <ResponsiveContainer width="100%" height={140}>
                                    <LineChart data={chartData}>
                                        <XAxis dataKey="name" hide />
                                        <YAxis domain={[0, 1]} hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine y={0.5} stroke="#374151" strokeDasharray="3 3" />
                                        <Line
                                            type="monotone"
                                            dataKey="yes"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4, fill: '#10b981' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'Volume', value: `KES ${market.total_collected.toLocaleString()}` },
                                { label: 'Trades', value: market.trade_count.toLocaleString() },
                                { label: 'Shares YES', value: market.yes_shares_issued.toFixed(0) },
                                { label: 'Shares NO', value: market.no_shares_issued.toFixed(0) },
                                { label: 'Resolves', value: market.resolution_date ? formatMatchDate(market.resolution_date) : '—' },
                                { label: 'Locks at', value: market.locks_at ? formatMatchDate(market.locks_at) : '—' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-[#16202C] border border-gray-700/50 rounded-xl p-3">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                                    <div className="text-white font-bold text-sm">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        {market.description && (
                            <div className="bg-[#16202C] border border-gray-700/50 rounded-xl p-4 mb-4">
                                <button
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="flex items-center justify-between w-full"
                                >
                                    <div className="flex items-center gap-2">
                                        <Info size={14} className="text-gray-400" />
                                        <span className="text-gray-400 text-sm font-semibold">About this market</span>
                                    </div>
                                    {showInfo ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                                </button>
                                {showInfo && (
                                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                                        <p className="text-gray-400 text-sm leading-relaxed">{market.description}</p>
                                        {market.resolution_source && (
                                            <p className="text-gray-600 text-xs mt-2">Resolution source: {market.resolution_source}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Position (if any) */}
                        {myPosition && (
                            <div className="bg-[#16202C] border border-[#FED800]/20 rounded-xl p-4">
                                <h3 className="text-[#FED800] text-xs font-bold uppercase tracking-wider mb-3">My Position</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Side</div>
                                        <div className={`font-bold text-sm uppercase ${myPosition.side === 'yes' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {myPosition.side}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Shares</div>
                                        <div className="text-white font-bold text-sm">{myPosition.shares_held.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Total Cost</div>
                                        <div className="text-white font-bold text-sm">KES {myPosition.total_cost.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Current Value</div>
                                        <div className={`font-bold text-sm ${myPosition.unrealised_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            KES {myPosition.current_value.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className={`mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between`}>
                                    <span className="text-gray-500 text-xs">Unrealised P&L</span>
                                    <span className={`font-bold text-sm ${myPosition.unrealised_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {myPosition.unrealised_pnl >= 0 ? '+' : ''}KES {myPosition.unrealised_pnl.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Trade panel */}
                    <div className="lg:self-start lg:sticky lg:top-[72px] mt-5 lg:mt-0">
                        <div className="bg-[#16202C] border border-gray-700/50 rounded-xl overflow-hidden">
                            {/* Trade type tabs */}
                            <div className="flex border-b border-gray-700/50">
                                {(['buy', 'sell'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setTradeType(t); setQuote(null) }}
                                        className={`flex-1 py-3 text-sm font-bold capitalize transition-colors ${
                                            tradeType === t
                                                ? 'text-white border-b-2 border-[#FED800]'
                                                : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4">
                                {/* Side selector */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setSide('yes')}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                                            side === 'yes'
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                : 'bg-transparent text-gray-500 border-gray-700 hover:border-emerald-500/30 hover:text-emerald-400'
                                        }`}
                                    >
                                        Yes {yesPct}¢
                                    </button>
                                    <button
                                        onClick={() => setSide('no')}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                                            side === 'no'
                                                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                                : 'bg-transparent text-gray-500 border-gray-700 hover:border-red-500/30 hover:text-red-400'
                                        }`}
                                    >
                                        No {noPct}¢
                                    </button>
                                </div>

                                {/* Shares input */}
                                <div className="mb-3">
                                    <label className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Shares</label>
                                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                                        {[10, 25, 50, 100, 200].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setShares(s)}
                                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    shares === s
                                                        ? 'bg-[#FED800] text-black'
                                                        : 'bg-[#0f1923] text-gray-400 hover:text-gray-200 border border-gray-700'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        value={shares || ''}
                                        onChange={e => setShares(Number(e.target.value) || null)}
                                        placeholder="Enter shares"
                                        className="w-full bg-[#0f1923] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FED800] border border-gray-700"
                                    />
                                </div>

                                {/* Quote */}
                                {loadingQuote && (
                                    <div className="flex items-center gap-2 py-2 text-gray-500 text-xs">
                                        <div className="animate-spin rounded-full h-3 w-3 border-t border-gray-500" />
                                        Getting quote...
                                    </div>
                                )}
                                {quote && !loadingQuote && (
                                    <div className="bg-[#0f1923] rounded-xl p-3 mb-3 border border-gray-700/50">
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    {tradeType === 'buy' ? 'Cost' : 'Payout'}
                                                </span>
                                                <span className="text-white font-bold">
                                                    KES {('cost_kes' in quote ? quote.cost_kes : quote.payout_kes).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">YES price after</span>
                                                <span className="text-emerald-400">{Math.round(quote.yes_price_after * 100)}¢</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">NO price after</span>
                                                <span className="text-red-400">{Math.round(quote.no_price_after * 100)}¢</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Balance */}
                                <div className="flex justify-between text-xs mb-4">
                                    <span className="text-gray-500">Balance</span>
                                    <span className="text-[#FED800] font-bold">KES {userData.account_balance?.toLocaleString()}</span>
                                </div>

                                {/* Error */}
                                {tradeError && (
                                    <div className="flex items-center gap-2 text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        <AlertCircle size={12} />
                                        {tradeError}
                                    </div>
                                )}

                                {/* Success */}
                                {tradeSuccess && (
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                        <Check size={12} />
                                        Trade executed successfully!
                                    </div>
                                )}

                                {/* CTA */}
                                <button
                                    onClick={handleTrade}
                                    disabled={!shares || shares <= 0 || !isActive || trading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                                        shares && shares > 0 && isActive && !trading
                                            ? side === 'yes'
                                                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95'
                                                : 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {trading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-current" />
                                            Processing...
                                        </span>
                                    ) : !isActive ? 'Market Closed' : !shares ? 'Enter shares' : (
                                        `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${side.toUpperCase()}`
                                    )}
                                </button>

                                {!isActive && (
                                    <p className="text-gray-600 text-xs text-center mt-2">This market is not currently accepting trades.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage="markets" />
            </div>
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