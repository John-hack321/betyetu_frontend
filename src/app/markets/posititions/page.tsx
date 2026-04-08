'use client'
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../app_state/store"
import { updateCurrentPage } from "../../app_state/slices/pageTracking"
import { fetchMyPositions, UserPosition } from "../../api/predictionMarket"
import FooterComponent from "../../components/footer"
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Loader2,
    AlertCircle,
    ChevronRight,
    BarChart2,
} from "lucide-react"

function formatKES(n: number) {
    return `KES ${Math.abs(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function PnlBadge({ pnl }: { pnl: number }) {
    const isPos = pnl >= 0
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                isPos ? "bg-[#60991A]/20 text-[#60991A]" : "bg-red-500/20 text-red-400"
            }`}
        >
            {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPos ? "+" : "-"}{formatKES(pnl)}
        </span>
    )
}

function PositionCard({ pos, onTrade }: { pos: UserPosition; onTrade: () => void }) {
    const isOpen = pos.position_status === "open"
    const sidePct = Math.round(pos.current_price * 100)

    return (
        <div className="bg-[#1a2633] border border-gray-800 hover:border-[#FED800]/30 rounded-xl p-4 transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                pos.side === "yes"
                                    ? "bg-[#60991A]/20 text-[#60991A]"
                                    : "bg-red-500/20 text-red-400"
                            }`}
                        >
                            {pos.side}
                        </span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                isOpen
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-gray-700 text-gray-400"
                            }`}
                        >
                            {pos.position_status}
                        </span>
                        <PnlBadge pnl={pos.unrealised_pnl} />
                    </div>
                    <p className="text-sm text-white font-medium leading-snug line-clamp-2">
                        {pos.question}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-[#16202C] rounded-lg py-2">
                    <p className="text-xs text-gray-500">Shares</p>
                    <p className="text-sm font-bold text-gray-200">{pos.shares_held}</p>
                </div>
                <div className="bg-[#16202C] rounded-lg py-2">
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="text-sm font-bold text-gray-200">{formatKES(pos.total_cost)}</p>
                </div>
                <div className="bg-[#16202C] rounded-lg py-2">
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="text-sm font-bold text-gray-200">{formatKES(pos.current_value)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-gray-500">
                        Avg. {formatKES(pos.average_cost_per_share)} · Current {sidePct}¢
                    </p>
                    {pos.settled_payout != null && (
                        <p className="text-xs text-[#FED800] font-medium mt-0.5">
                            Settled payout: {formatKES(pos.settled_payout)}
                        </p>
                    )}
                </div>
                {isOpen && (
                    <button
                        onClick={onTrade}
                        className="flex items-center gap-1 text-xs text-[#FED800] hover:text-white transition-colors font-medium"
                    >
                        Trade <ChevronRight size={13} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default function PositionsPage() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)

    const [positions, setPositions] = useState<UserPosition[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchMyPositions()
            setPositions(data)
        } catch {
            setError("Failed to load positions.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { 
        load() 
        dispatch(updateCurrentPage("markets-positions"))
    }, [load, dispatch])

    const open = positions.filter((p) => p.position_status === "open")
    const settled = positions.filter((p) => p.position_status !== "open")

    const totalValue = open.reduce((acc, p) => acc + p.current_value, 0)
    const totalCost = open.reduce((acc, p) => acc + p.total_cost, 0)
    const totalPnl = totalValue - totalCost

    return (
        <div className="min-h-screen bg-[#16202C] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#1a2633]/95 backdrop-blur border-b border-gray-800 px-4 py-3 lg:px-8">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push("/markets")}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#FED800] transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Markets
                    </button>

                    <h1 className="text-lg font-bold">
                        <span className="text-[#FED800]">bet</span>
                        <span className="text-gray-100">yetu</span>
                    </h1>

                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] text-gray-500">Balance</span>
                        <span className="text-sm font-bold text-gray-200">
                            KES {userData.account_balance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 lg:px-8 py-6 pb-28 lg:pb-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-white mb-1">My Positions</h2>
                    <p className="text-gray-400 text-sm">Your open and settled prediction market positions.</p>
                </div>

                {/* Portfolio summary */}
                {!loading && open.length > 0 && (
                    <div className="bg-gradient-to-br from-[#1a2633] to-[#16202C] border border-[#FED800]/20 rounded-2xl p-5 mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Portfolio Overview</h3>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Invested</p>
                                <p className="text-base font-bold text-gray-200">{formatKES(totalCost)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Current Value</p>
                                <p className="text-base font-bold text-gray-200">{formatKES(totalValue)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Unrealised P&L</p>
                                <p className={`text-base font-bold ${totalPnl >= 0 ? "text-[#60991A]" : "text-red-400"}`}>
                                    {totalPnl >= 0 ? "+" : ""}{formatKES(totalPnl)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 size={32} className="animate-spin text-[#FED800]" />
                        <p className="text-gray-400 text-sm">Loading positions...</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <AlertCircle size={36} className="text-red-500" />
                        <p className="text-red-300 text-sm">{error}</p>
                        <button onClick={load} className="text-[#FED800] underline text-sm">Retry</button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && positions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <BarChart2 size={48} className="text-gray-700 mb-4" />
                        <h3 className="text-lg font-bold text-gray-300 mb-2">No Positions Yet</h3>
                        <p className="text-gray-500 text-sm max-w-xs mb-5">
                            You haven&apos;t traded in any prediction markets yet.
                        </p>
                        <button
                            onClick={() => router.push("/markets")}
                            className="bg-[#FED800] text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#ffd700] transition-all"
                        >
                            Browse Markets
                        </button>
                    </div>
                )}

                {/* Open positions */}
                {!loading && open.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Open</h3>
                            <div className="flex-1 h-px bg-gray-800" />
                            <span className="text-xs text-gray-600">{open.length}</span>
                        </div>
                        <div className="space-y-3">
                            {open.map((p, i) => (
                                <PositionCard
                                    key={i}
                                    pos={p}
                                    onTrade={() => router.push(`/markets/${p.market_id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Settled positions */}
                {!loading && settled.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Settled</h3>
                            <div className="flex-1 h-px bg-gray-800" />
                            <span className="text-xs text-gray-600">{settled.length}</span>
                        </div>
                        <div className="space-y-3">
                            {settled.map((p, i) => (
                                <PositionCard
                                    key={i}
                                    pos={p}
                                    onTrade={() => router.push(`/markets/${p.market_id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile nav */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}
