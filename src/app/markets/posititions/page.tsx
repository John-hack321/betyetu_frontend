'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Activity, ChevronRight, BarChart2 } from 'lucide-react'
import { fetchMyPositions, UserPosition } from '../../api/predictionMarket'
import FooterComponent from '../../components/footer'
import { useSelector } from 'react-redux'
import { RootState } from '../../app_state/store'
import ProtectedRoute from '../../components/protectedRoute'

function PositionCard({ pos }: { pos: UserPosition }) {
    const router = useRouter()
    const isYes = pos.side === 'yes'
    const isGain = pos.unrealised_pnl >= 0
    const pnlPct = pos.total_cost > 0 ? ((pos.unrealised_pnl / pos.total_cost) * 100).toFixed(1) : '0.0'

    return (
        <div
            onClick={() => router.push(`/markets/${pos.market_id}`)}
            className="cursor-pointer bg-[#16202C] border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition-all group"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-white font-semibold text-sm leading-snug flex-1 group-hover:text-[#FED800] transition-colors line-clamp-2">
                    {pos.question}
                </p>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 shrink-0 mt-0.5 transition-colors" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Side</div>
                    <div className={`font-bold text-sm uppercase flex items-center gap-1 ${isYes ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isYes ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {pos.side}
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Shares</div>
                    <div className="text-white font-bold text-sm">{pos.shares_held.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Cost</div>
                    <div className="text-white font-bold text-sm">KES {pos.total_cost.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Value</div>
                    <div className="text-white font-bold text-sm">KES {pos.current_value.toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        pos.position_status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : pos.position_status === 'settled'
                            ? 'bg-[#FED800]/10 text-[#FED800] border-[#FED800]/20'
                            : 'bg-gray-700 text-gray-400 border-gray-600'
                    }`}>
                        {pos.position_status.toUpperCase()}
                    </span>
                    {pos.market_status !== 'active' && (
                        <span className="text-gray-600 text-xs">{pos.market_status}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {pos.settled_payout !== null && pos.settled_payout !== undefined && (
                        <span className="text-[#FED800] font-bold text-sm">
                            Payout: KES {pos.settled_payout.toFixed(2)}
                        </span>
                    )}
                    {pos.position_status === 'open' && (
                        <span className={`font-bold text-sm ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isGain ? '+' : ''}KES {pos.unrealised_pnl.toFixed(2)} ({isGain ? '+' : ''}{pnlPct}%)
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

function PositionsPageInner() {
    const router = useRouter()
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)

    const [positions, setPositions] = useState<UserPosition[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'open' | 'settled'>('all')

    useEffect(() => {
        loadPositions()
    }, [])

    const loadPositions = async () => {
        setLoading(true)
        try {
            const data = await fetchMyPositions()
            setPositions(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filtered = positions.filter(p => {
        if (filter === 'all') return true
        if (filter === 'open') return p.position_status === 'open'
        if (filter === 'settled') return p.position_status === 'settled'
        return true
    })

    const totalValue = positions.filter(p => p.position_status === 'open').reduce((s, p) => s + p.current_value, 0)
    const totalCost = positions.filter(p => p.position_status === 'open').reduce((s, p) => s + p.total_cost, 0)
    const totalPnl = totalValue - totalCost
    const openPositions = positions.filter(p => p.position_status === 'open').length
    const settledPositions = positions.filter(p => p.position_status === 'settled').length

    return (
        <div className="flex flex-col min-h-screen bg-[#0f1923]">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0f1923]/95 backdrop-blur-sm border-b border-gray-800/60 px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.push('/markets')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white font-bold text-base">My Positions</h1>
                        <p className="text-gray-500 text-xs">{positions.length} total positions</p>
                    </div>
                    <button
                        onClick={() => router.push('/markets')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16202C] hover:bg-[#23313D] text-gray-300 text-sm font-medium border border-gray-700 transition-all"
                    >
                        <BarChart2 size={14} />
                        Markets
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-3xl mx-auto px-4 py-5">

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="bg-[#16202C] border border-gray-700/50 rounded-xl p-3">
                            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Open</div>
                            <div className="text-white font-black text-xl">{openPositions}</div>
                        </div>
                        <div className="bg-[#16202C] border border-gray-700/50 rounded-xl p-3">
                            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Settled</div>
                            <div className="text-white font-black text-xl">{settledPositions}</div>
                        </div>
                        <div className="bg-[#16202C] border border-gray-700/50 rounded-xl p-3">
                            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Portfolio Value</div>
                            <div className="text-[#FED800] font-black text-lg">KES {totalValue.toFixed(0)}</div>
                        </div>
                        <div className="bg-[#16202C] border border-gray-700/50 rounded-xl p-3">
                            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Unrealised P&L</div>
                            <div className={`font-black text-lg ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {totalPnl >= 0 ? '+' : ''}KES {totalPnl.toFixed(0)}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                        {(['all', 'open', 'settled'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                                    filter === f
                                        ? 'bg-[#FED800] text-black'
                                        : 'bg-[#16202C] text-gray-400 border border-gray-700 hover:text-gray-200'
                                }`}
                            >
                                {f} {f === 'all' ? `(${positions.length})` : f === 'open' ? `(${openPositions})` : `(${settledPositions})`}
                            </button>
                        ))}
                    </div>

                    {/* Positions list */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FED800]" />
                            <p className="text-gray-500 text-sm">Loading positions...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Activity size={40} className="text-gray-700" />
                            <div className="text-center">
                                <p className="text-gray-400 font-semibold mb-1">No positions yet</p>
                                <p className="text-gray-600 text-sm">Browse markets and make your first trade</p>
                            </div>
                            <button
                                onClick={() => router.push('/markets')}
                                className="px-6 py-2.5 bg-[#FED800] text-black font-bold rounded-full text-sm hover:bg-[#ffd700] transition-all"
                            >
                                Browse Markets
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filtered.map((pos, i) => (
                                <PositionCard key={`${pos.market_id}-${pos.side}-${i}`} pos={pos} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage="markets" />
            </div>
        </div>
    )
}

export default function PositionsPage() {
    return (
        <ProtectedRoute>
            <PositionsPageInner />
        </ProtectedRoute>
    )
}