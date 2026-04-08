'use client'

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../app_state/store"
import { updateCurrentPage } from "../../app_state/slices/pageTracking"
import {
    fetchMarketDetail,
    fetchPriceHistory,
    fetchBuyQuote,
    fetchSellQuote,
    executeBuy,
    executeSell,
    MarketDetail,
    PricePoint,
    BuyQuote,
    SellQuote,
} from "../../api/predictionMarket"
import FooterComponent from "../../components/footer"
import {
    ArrowLeft,
    Clock,
    BarChart2,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    X,
    Loader2,
    Info,
} from "lucide-react"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ReferenceLine,
} from "recharts"

function formatKES(n: number) {
    if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`
    return `KES ${n.toFixed(2)}`
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

function formatChartTime(ts: string) {
    const d = new Date(ts)
    return d.toLocaleDateString("en-KE", { month: "short", day: "numeric" })
}

function StatusBadge({ status, outcome }: { status: string; outcome: string | null }) {
    if (outcome === "yes") return (
        <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full">
            <CheckCircle size={11} /> Resolved YES
        </span>
    )
    if (outcome === "no") return (
        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full">
            <X size={11} /> Resolved NO
        </span>
    )
    if (status === "active") return (
        <span className="inline-flex items-center gap-1 bg-[#60991A]/20 text-[#60991A] border border-[#60991A]/30 text-xs font-bold px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#60991A] animate-pulse" /> Live
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 bg-gray-500/20 text-gray-400 border border-gray-700 text-xs font-bold px-3 py-1 rounded-full">
            {status}
        </span>
    )
}

function CategoryBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        sports: "bg-blue-500/20 text-blue-300",
        politics: "bg-purple-500/20 text-purple-300",
        crypto: "bg-orange-500/20 text-orange-300",
        finance: "bg-green-500/20 text-green-300",
        entertainment: "bg-pink-500/20 text-pink-300",
        other: "bg-gray-500/20 text-gray-300",
    }
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${colors[category?.toLowerCase()] ?? "bg-gray-500/20 text-gray-300"}`}>
            {category}
        </span>
    )
}

type TradeMode = "buy" | "sell"
type TradeSide = "yes" | "no"

interface TradeState {
    mode: TradeMode
    side: TradeSide
    shares: string
    quote: BuyQuote | SellQuote | null
    quoteLoading: boolean
    submitting: boolean
    successMsg: string | null
    errorMsg: string | null
}

interface ToastProps {
    msg: string
    type: "success" | "error"
    onClose: () => void
}

function Toast({ msg, type, onClose }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000)
        return () => clearTimeout(t)
    }, [onClose])
    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
            type === "success"
                ? "bg-[#60991A]/90 text-white border-[#60991A]"
                : "bg-red-900/90 text-red-200 border-red-700"
        }`}>
            {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
                <X size={13} />
            </button>
        </div>
    )
}

interface TradePanel {
    market: MarketDetail
    state: TradeState
    setState: (s: TradeState) => void
    onTradeComplete: () => void
    userBalance: number
}

function TradePanel({ market, state, setState, onTradeComplete, userBalance }: TradePanel) {
    const sharesNum = parseFloat(state.shares) || 0
    const isActive = market.market_status === "active"

    const fetchQuote = useCallback(async () => {
        if (sharesNum <= 0 || !isActive) return
        setState({ ...state, quoteLoading: true, quote: null, errorMsg: null })
        try {
            let q: BuyQuote | SellQuote
            if (state.mode === "buy") {
                q = await fetchBuyQuote(market.id, state.side, sharesNum)
            } else {
                q = await fetchSellQuote(market.id, state.side, sharesNum)
            }
            setState({ ...state, quoteLoading: false, quote: q })
        } catch {
            setState({ ...state, quoteLoading: false, errorMsg: "Could not fetch quote. Try again." })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharesNum, state.mode, state.side, market.id, isActive])

    useEffect(() => {
        const timer = setTimeout(() => { if (sharesNum > 0) fetchQuote() }, 600)
        return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharesNum, state.mode, state.side])

    const handleExecute = async () => {
        if (!state.quote || sharesNum <= 0) return
        setState({ ...state, submitting: true, errorMsg: null })
        try {
            if (state.mode === "buy") {
                await executeBuy(market.id, state.side, sharesNum)
            } else {
                await executeSell(market.id, state.side, sharesNum)
            }
            setState({
                ...state,
                submitting: false,
                shares: "",
                quote: null,
                successMsg: `${state.mode === "buy" ? "Bought" : "Sold"} ${sharesNum} ${state.side.toUpperCase()} shares successfully!`,
            })
            onTradeComplete()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Trade failed. Try again."
            setState({ ...state, submitting: false, errorMsg: msg })
        }
    }

    const buyQuote = state.mode === "buy" ? (state.quote as BuyQuote) : null
    const sellQuote = state.mode === "sell" ? (state.quote as SellQuote) : null

    return (
        <div className="bg-[#1a2633] border border-gray-800 rounded-2xl overflow-hidden">
            {/* Mode tabs */}
            <div className="grid grid-cols-2 border-b border-gray-800">
                {(["buy", "sell"] as TradeMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setState({ ...state, mode: m, quote: null, errorMsg: null })}
                        className={`py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                            state.mode === m
                                ? m === "buy"
                                    ? "text-[#FED800] border-b-2 border-[#FED800] bg-[#FED800]/5"
                                    : "text-red-400 border-b-2 border-red-500 bg-red-500/5"
                                : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {m === "buy" ? "Buy" : "Sell"}
                    </button>
                ))}
            </div>

            <div className="p-4">
                {/* Side selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {(["yes", "no"] as TradeSide[]).map((s) => {
                        const price = s === "yes" ? market.yes_price : market.no_price
                        const pct = Math.round(price * 100)
                        const active = state.side === s
                        return (
                            <button
                                key={s}
                                onClick={() => setState({ ...state, side: s, quote: null, errorMsg: null })}
                                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-bold ${
                                    active
                                        ? s === "yes"
                                            ? "border-[#60991A] bg-[#60991A]/15 text-[#60991A]"
                                            : "border-red-500 bg-red-500/15 text-red-400"
                                        : "border-gray-700 text-gray-500 hover:border-gray-600"
                                }`}
                            >
                                <span className="text-xl">{pct}¢</span>
                                <span className="text-xs mt-0.5">{s.toUpperCase()}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Balance */}
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500">Wallet Balance</span>
                    <span className="text-xs font-semibold text-gray-300">
                        KES {userBalance.toLocaleString()}
                    </span>
                </div>

                {/* Shares input */}
                <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-1.5 block">Number of Shares</label>
                    <div className="flex items-center gap-2 bg-[#16202C] border border-gray-700 rounded-xl px-4 py-3 focus-within:border-[#FED800]/50 transition-colors">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={state.shares}
                            onChange={(e) =>
                                setState({ ...state, shares: e.target.value, quote: null, errorMsg: null })
                            }
                            placeholder="Enter shares..."
                            disabled={!isActive}
                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-gray-500 shrink-0">shares</span>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-1.5 mt-2">
                        {[10, 50, 100, 500].map((n) => (
                            <button
                                key={n}
                                onClick={() =>
                                    setState({ ...state, shares: String(n), quote: null, errorMsg: null })
                                }
                                className="flex-1 text-xs py-1 bg-[#16202C] border border-gray-700 rounded-lg text-gray-400 hover:border-[#FED800]/40 hover:text-[#FED800] transition-colors"
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quote loading */}
                {state.quoteLoading && (
                    <div className="flex items-center justify-center gap-2 py-3 text-gray-400 text-xs">
                        <Loader2 size={14} className="animate-spin" />
                        Fetching best price...
                    </div>
                )}

                {/* Quote display */}
                {!state.quoteLoading && buyQuote && (
                    <div className="bg-[#16202C] border border-[#FED800]/20 rounded-xl p-3 mb-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Shares</span>
                            <span className="text-white font-medium">{buyQuote.shares}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Total cost (incl. 2% fee)</span>
                            <span className="text-[#FED800] font-bold">{formatKES(buyQuote.cost_kes)}</span>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">YES price after trade</span>
                            <span className="text-gray-300">{(buyQuote.yes_price_after * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                )}

                {!state.quoteLoading && sellQuote && (
                    <div className="bg-[#16202C] border border-[#60991A]/20 rounded-xl p-3 mb-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Shares to sell</span>
                            <span className="text-white font-medium">{sellQuote.shares}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Payout (after 2% fee)</span>
                            <span className="text-[#60991A] font-bold">{formatKES(sellQuote.payout_kes)}</span>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">YES price after trade</span>
                            <span className="text-gray-300">{(sellQuote.yes_price_after * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                )}

                {/* Error */}
                {state.errorMsg && (
                    <p className="text-red-400 text-xs mb-3 flex items-start gap-1.5">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        {state.errorMsg}
                    </p>
                )}

                {/* Market locked notice */}
                {!isActive && (
                    <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl p-3 mb-4">
                        <Info size={14} className="text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-400">This market is no longer accepting new trades.</p>
                    </div>
                )}

                {/* CTA */}
                <button
                    disabled={!isActive || sharesNum <= 0 || !state.quote || state.submitting}
                    onClick={handleExecute}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                        state.mode === "buy"
                            ? "bg-[#FED800] text-black hover:bg-[#ffd700] shadow-[#FED800]/20 enabled:hover:scale-[1.02]"
                            : "bg-red-500 text-white hover:bg-red-400 shadow-red-500/20 enabled:hover:scale-[1.02]"
                    }`}
                >
                    {state.submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 size={15} className="animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        `${state.mode === "buy" ? "Buy" : "Sell"} ${state.side.toUpperCase()} ${sharesNum > 0 ? `· ${sharesNum} shares` : ""}`
                    )}
                </button>

                <p className="text-[10px] text-gray-600 text-center mt-2">
                    A 2% platform fee applies to all trades.
                </p>
            </div>
        </div>
    )
}

export default function MarketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const marketId = parseInt(params.id as string)
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)

    const [market, setMarket] = useState<MarketDetail | null>(null)
    const [chartData, setChartData] = useState<PricePoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

    const [tradeState, setTradeState] = useState<TradeState>({
        mode: "buy",
        side: "yes",
        shares: "",
        quote: null,
        quoteLoading: false,
        submitting: false,
        successMsg: null,
        errorMsg: null,
    })

    const loadMarket = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [detail, history] = await Promise.all([
                fetchMarketDetail(marketId),
                fetchPriceHistory(marketId, 150),
            ])
            setMarket(detail)
            setChartData(history)
        } catch {
            setError("Failed to load market. Please try again.")
        } finally {
            setLoading(false)
        }
    }, [marketId])

    useEffect(() => {
        if (!isNaN(marketId)) loadMarket()
        dispatch(updateCurrentPage("market-detail"))
    }, [marketId, loadMarket, dispatch])

    // Watch for trade success toast
    useEffect(() => {
        if (tradeState.successMsg) {
            setToast({ msg: tradeState.successMsg, type: "success" })
            setTradeState((s) => ({ ...s, successMsg: null }))
        }
    }, [tradeState.successMsg])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#16202C] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#FED800]" size={36} />
                    <p className="text-gray-400 text-sm">Loading market...</p>
                </div>
            </div>
        )
    }

    if (error || !market) {
        return (
            <div className="min-h-screen bg-[#16202C] flex flex-col items-center justify-center gap-4 px-4">
                <AlertCircle size={48} className="text-red-500" />
                <p className="text-red-300 text-center">{error ?? "Market not found."}</p>
                <button onClick={() => router.back()} className="text-[#FED800] underline text-sm">
                    Go back
                </button>
            </div>
        )
    }

    const yesPct = Math.round(market.yes_price * 100)
    const noPct = 100 - yesPct
    const hasChart = chartData.length >= 2

    const chartMin = hasChart
        ? Math.max(0, Math.min(...chartData.map((d) => d.yes_price)) - 0.05)
        : 0
    const chartMax = hasChart
        ? Math.min(1, Math.max(...chartData.map((d) => d.yes_price)) + 0.05)
        : 1

    return (
        <div className="min-h-screen bg-[#16202C] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#1a2633]/95 backdrop-blur border-b border-gray-800 px-4 py-3 lg:px-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push("/markets")}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#FED800] transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        <span className="hidden sm:inline">Markets</span>
                    </button>

                    <h1 className="text-lg font-bold">
                        <span className="text-[#FED800]">bet</span>
                        <span className="text-gray-100">yetu</span>
                    </h1>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] text-gray-500">Balance</span>
                            <span className="text-sm font-bold text-gray-200">
                                KES {userData.account_balance.toLocaleString()}
                            </span>
                        </div>
                        <button className="bg-[#FED800] text-black font-bold px-4 py-2 rounded-full text-sm">
                            Deposit
                        </button>
                    </div>
                </div>
            </header>

            {/* Toast */}
            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-6 pb-28 lg:pb-10">
                {/* Market header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <CategoryBadge category={market.category} />
                        <StatusBadge status={market.market_status} outcome={market.outcome} />
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <BarChart2 size={11} />
                            {market.trade_count} trades
                        </span>
                    </div>

                    <h1 className="text-xl lg:text-3xl font-extrabold text-white leading-tight mb-3">
                        {market.question}
                    </h1>

                    {market.description && (
                        <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-2xl">
                            {market.description}
                        </p>
                    )}

                    {/* Key stats row */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <BarChart2 size={12} />
                            Volume: {formatKES(market.total_collected)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Closes: {formatDate(market.locks_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Resolves: {formatDate(market.resolution_date)}
                        </span>
                        {market.resolution_source && (
                            <span className="flex items-center gap-1.5">
                                <Info size={12} />
                                Source: {market.resolution_source}
                            </span>
                        )}
                    </div>
                </div>

                {/* Current prices - prominent bar */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#1a2633] border border-[#60991A]/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400 font-medium">YES</span>
                            <TrendingUp size={14} className="text-[#60991A]" />
                        </div>
                        <p className="text-3xl font-extrabold text-[#60991A]">{yesPct}¢</p>
                        <p className="text-xs text-gray-500 mt-1">per share</p>
                    </div>
                    <div className="bg-[#1a2633] border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400 font-medium">NO</span>
                            <TrendingDown size={14} className="text-red-400" />
                        </div>
                        <p className="text-3xl font-extrabold text-red-400">{noPct}¢</p>
                        <p className="text-xs text-gray-500 mt-1">per share</p>
                    </div>
                </div>

                {/* Two-column layout (chart + trade panel) */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: chart */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-[#1a2633] border border-gray-800 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-gray-300">Price History</h2>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1.5 text-[#FED800]">
                                        <div className="w-3 h-0.5 bg-[#FED800] rounded" /> YES
                                    </span>
                                    <span className="flex items-center gap-1.5 text-red-400">
                                        <div className="w-3 h-0.5 bg-red-400 rounded" /> NO
                                    </span>
                                </div>
                            </div>

                            {hasChart ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4a" vertical={false} />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={formatChartTime}
                                            tick={{ fill: "#6b7280", fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            domain={[chartMin, chartMax]}
                                            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                                            tick={{ fill: "#6b7280", fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={38}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: "#16202C",
                                                border: "1px solid #FED800",
                                                borderRadius: 10,
                                                fontSize: 11,
                                                color: "#d1d5dc",
                                            }}
                                            formatter={(v: unknown, name: unknown) => [
                                                `${((v as number) * 100).toFixed(1)}%`,
                                                name === "yes_price" ? "YES" : "NO",
                                            ]}
                                            labelFormatter={(l: unknown) => typeof l === "string" ? new Date(l).toLocaleString("en-KE") : ""}
                                        />
                                        <ReferenceLine y={0.5} stroke="#374151" strokeDasharray="4 4" />
                                        <Line
                                            type="monotone"
                                            dataKey="yes_price"
                                            stroke="#FED800"
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 5, fill: "#FED800", stroke: "#16202C", strokeWidth: 2 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="no_price"
                                            stroke="#ef4444"
                                            strokeWidth={1.5}
                                            dot={false}
                                            strokeDasharray="4 2"
                                            activeDot={{ r: 4, fill: "#ef4444" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-52 text-center">
                                    <TrendingUp size={32} className="text-gray-700 mb-3" />
                                    <p className="text-gray-500 text-sm">No price history yet</p>
                                    <p className="text-gray-600 text-xs mt-1">Chart will appear after the first trade</p>
                                </div>
                            )}
                        </div>

                        {/* Outcome notes (if resolved) */}
                        {market.outcome_notes && (
                            <div className="mt-4 bg-[#1a2633] border border-gray-800 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                    Resolution Notes
                                </h3>
                                <p className="text-sm text-gray-300">{market.outcome_notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right: trade panel (sticky on desktop) */}
                    <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-20 lg:self-start">
                        <TradePanel
                            market={market}
                            state={tradeState}
                            setState={setTradeState}
                            onTradeComplete={loadMarket}
                            userBalance={userData.account_balance}
                        />
                    </div>
                </div>
            </main>

            {/* Bottom Nav (mobile) */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}
