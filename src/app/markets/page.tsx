'use client'
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../app_state/store"
// setMarkets, setLoading, setSelectedCategory
import { setMarkets, setLoading, setSelectedCategory } from "../app_state/slices/predictionMarketData"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { fetchActiveMarkets, fetchPriceHistory, MarketSummary, PricePoint } from "../api/predictionMarket"
import FooterComponent from "../components/footer"
import {
    ArrowLeft,
    TrendingUp,
    Clock,
    Users,
    ChevronRight,
    Menu,
    RefreshCw,
    BarChart2,
} from "lucide-react"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    Tooltip,
    YAxis,
} from "recharts"

const CATEGORIES = ["all", "sports", "politics", "crypto", "finance", "entertainment", "other"]

function formatKES(amount: number): string {
    if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(1)}K`
    return `KES ${amount.toFixed(0)}`
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Open"
    const d = new Date(dateStr)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return "Closed"
    if (days === 0) return "Today"
    if (days === 1) return "Tomorrow"
    if (days < 7) return `${days}d`
    if (days < 30) return `${Math.floor(days / 7)}w`
    return `${Math.floor(days / 30)}mo`
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
    const cls = colors[category.toLowerCase()] ?? "bg-gray-500/20 text-gray-300"
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>
            {category}
        </span>
    )
}

function YesPriceBar({ yesPrice }: { yesPrice: number }) {
    const pct = Math.round(yesPrice * 100)
    const isHigh = pct >= 60
    const isLow = pct <= 40

    return (
        <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${isHigh ? "text-[#60991A]" : isLow ? "text-red-400" : "text-[#FED800]"}`}>
                    YES {pct}%
                </span>
                <span className="text-xs text-gray-500">NO {100 - pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isHigh ? "bg-[#60991A]" : isLow ? "bg-red-500" : "bg-[#FED800]"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

function MarketCard({ market, onClick }: { market: MarketSummary; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-[#1a2633] hover:bg-[#1f2e3e] border border-gray-800 hover:border-[#FED800]/30 rounded-xl p-4 transition-all duration-200 group"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <CategoryBadge category={market.category} />
                <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                    <Clock size={11} />
                    {formatDate(market.locks_at)}
                </span>
            </div>

            <p className="text-sm text-gray-100 font-medium leading-snug line-clamp-3 group-hover:text-white transition-colors">
                {market.question}
            </p>

            <YesPriceBar yesPrice={market.yes_price} />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <BarChart2 size={11} />
                    {formatKES(market.total_collected)} vol
                </span>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-[#FED800] transition-colors" />
            </div>
        </button>
    )
}

function MiniChart({ data }: { data: PricePoint[] }) {
    if (!data || data.length < 2) {
        return (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
                Not enough data
            </div>
        )
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <YAxis domain={[0, 1]} hide />
                <Tooltip
                    contentStyle={{
                        background: "#16202C",
                        border: "1px solid #FED800",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "#d1d5dc",
                    }}
                    formatter={(v: unknown) => [`${((v as number) * 100).toFixed(1)}%`, "YES"]}
                    labelFormatter={() => ""}
                />
                <Line
                    type="monotone"
                    dataKey="yes_price"
                    stroke="#FED800"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#FED800" }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

function FeaturedMarket({
    market,
    chartData,
    onClick,
}: {
    market: MarketSummary
    chartData: PricePoint[]
    onClick: () => void
}) {
    const yesPct = Math.round(market.yes_price * 100)
    const isHigh = yesPct >= 60
    const isLow = yesPct <= 40

    return (
        <div className="bg-gradient-to-br from-[#1a2633] to-[#16202C] border border-[#FED800]/20 rounded-2xl overflow-hidden shadow-2xl mb-6">
            <div className="p-1 bg-gradient-to-r from-[#FED800]/20 via-transparent to-transparent">
                <span className="text-[10px] font-bold text-[#FED800] uppercase tracking-widest px-3">
                    ⭐ Featured Market
                </span>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Left: info */}
                <div className="flex-1 p-5 lg:p-7">
                    <div className="flex items-center gap-2 mb-3">
                        <CategoryBadge category={market.category} />
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={11} />
                            Closes {formatDate(market.locks_at)}
                        </span>
                    </div>

                    <h2 className="text-lg lg:text-2xl font-bold text-white leading-snug mb-4">
                        {market.question}
                    </h2>

                    {market.description && (
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                            {market.description}
                        </p>
                    )}

                    {/* Price pills */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`flex flex-col items-center px-5 py-3 rounded-xl border ${isHigh ? "border-[#60991A]/40 bg-[#60991A]/10" : "border-[#FED800]/30 bg-[#FED800]/5"}`}>
                            <span className={`text-2xl font-bold ${isHigh ? "text-[#60991A]" : "text-[#FED800]"}`}>
                                {yesPct}%
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">YES</span>
                        </div>
                        <div className={`flex flex-col items-center px-5 py-3 rounded-xl border ${isLow ? "border-red-500/40 bg-red-500/10" : "border-gray-700 bg-gray-800/40"}`}>
                            <span className={`text-2xl font-bold ${isLow ? "text-red-400" : "text-gray-300"}`}>
                                {100 - yesPct}%
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">NO</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                        <span className="flex items-center gap-1.5">
                            <BarChart2 size={13} />
                            {formatKES(market.total_collected)} volume
                        </span>
                    </div>

                    <button
                        onClick={onClick}
                        className="bg-[#FED800] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#ffd700] transition-all transform hover:scale-105 text-sm shadow-lg shadow-[#FED800]/20"
                    >
                        Trade This Market →
                    </button>
                </div>

                {/* Right: chart */}
                <div className="lg:w-80 xl:w-96 h-52 lg:h-auto border-t lg:border-t-0 lg:border-l border-gray-800/60 p-4 flex flex-col">
                    <p className="text-xs text-gray-500 mb-2 font-medium">YES Price History</p>
                    <div className="flex-1">
                        <MiniChart data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function FilterPills({
    selected,
    onSelect,
}: {
    selected: string
    onSelect: (c: string) => void
}) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border transition-all ${
                        selected === cat
                            ? "bg-[#FED800] text-black border-[#FED800] shadow-lg shadow-[#FED800]/20"
                            : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    )
}

export default function MarketsPage() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { markets, isLoading, selectedCategory } = useSelector(
        (state: RootState) => state.predictionMarketData
    )
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)

    const [featuredChart, setFeaturedChart] = useState<PricePoint[]>([])
    const [error, setError] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    const loadMarkets = useCallback(
        async (category: string) => {
            dispatch(setLoading(true))
            setError(null)
            try {
                const cat = category === "all" ? undefined : category
                const res = await fetchActiveMarkets(1, 50, cat)
                dispatch(
                    setMarkets({
                        markets: res.data,
                        page: res.page,
                        total: res.total,
                        total_pages: res.total_pages,
                        has_next_page: res.has_next_page,
                    })
                )
                if (res.data.length > 0) {
                    try {
                        const history = await fetchPriceHistory(res.data[0].id, 80)
                        setFeaturedChart(history)
                    } catch {
                        setFeaturedChart([])
                    }
                }
            } catch {
                setError("Failed to load markets. Please try again.")
            } finally {
                dispatch(setLoading(false))
            }
        },
        [dispatch]
    )

    useEffect(() => {
        loadMarkets(selectedCategory)
        dispatch(updateCurrentPage("markets"))
    }, [selectedCategory, loadMarkets, dispatch])

    const handleCategorySelect = (cat: string) => {
        dispatch(setSelectedCategory(cat))
    }

    const featuredMarket = markets[0]
    const otherMarkets = markets.slice(1)

    return (
        <div className="min-h-screen bg-[#16202C] flex flex-col">
            {/* ── Header ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 bg-[#1a2633]/95 backdrop-blur border-b border-gray-800 px-4 py-3 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Menu size={20} className="text-gray-300" />
                        </button>

                        {/* Back to main (desktop) */}
                        <button
                            onClick={() => router.push("/main")}
                            className="hidden lg:flex items-center gap-2 text-gray-400 hover:text-[#FED800] transition-colors text-sm font-medium mr-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Matches
                        </button>

                        <h1 className="text-xl font-bold">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>

                        <div className="hidden lg:flex items-center gap-1 bg-[#FED800]/10 border border-[#FED800]/30 rounded-full px-3 py-1 ml-1">
                            <TrendingUp size={13} className="text-[#FED800]" />
                            <span className="text-xs font-bold text-[#FED800]">Prediction Markets</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Balance */}
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 leading-none">Balance</span>
                            <span className="text-sm font-bold text-gray-200">
                                KES {userData.account_balance.toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={() => loadMarkets(selectedCategory)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={`text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
                        </button>

                        <button className="bg-[#FED800] text-black font-bold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all">
                            Deposit
                        </button>
                    </div>
                </div>

                {/* Mobile nav dropdown */}
                {menuOpen && (
                    <div className="lg:hidden absolute left-0 right-0 top-full bg-[#1a2633] border-b border-gray-800 px-4 py-3 shadow-xl z-40">
                        <button
                            onClick={() => { router.push("/main"); setMenuOpen(false) }}
                            className="flex items-center gap-2 text-gray-300 hover:text-[#FED800] transition-colors text-sm py-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Matches
                        </button>
                        <button
                            onClick={() => { router.push("/profile"); setMenuOpen(false) }}
                            className="flex items-center gap-2 text-gray-300 hover:text-[#FED800] transition-colors text-sm py-2"
                        >
                            <Users size={16} />
                            My Profile
                        </button>
                        <button
                            onClick={() => { router.push("/markets/positions"); setMenuOpen(false) }}
                            className="flex items-center gap-2 text-gray-300 hover:text-[#FED800] transition-colors text-sm py-2"
                        >
                            <BarChart2 size={16} />
                            My Positions
                        </button>
                    </div>
                )}
            </header>

            {/* ── Main Content ───────────────────────────────────── */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 pb-28 lg:pb-8">
                {/* Page title + subtitle (desktop) */}
                <div className="mb-5 hidden lg:block">
                    <h2 className="text-3xl font-extrabold text-white">Prediction Markets</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Trade on the outcomes of real-world events.
                    </p>
                </div>

                {/* Filter row */}
                <div className="mb-5">
                    <FilterPills selected={selectedCategory} onSelect={handleCategorySelect} />
                </div>

                {/* Error state */}
                {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-5 text-red-300 text-sm">
                        {error}
                        <button
                            onClick={() => loadMarkets(selectedCategory)}
                            className="ml-3 underline hover:text-red-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="space-y-4">
                        <div className="bg-[#1a2633] rounded-2xl h-56 animate-pulse" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-[#1a2633] rounded-xl h-44 animate-pulse" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && markets.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <TrendingUp size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No Markets Found</h3>
                        <p className="text-gray-500 text-sm max-w-xs">
                            {selectedCategory !== "all"
                                ? `No active ${selectedCategory} markets right now.`
                                : "No active markets at the moment. Check back soon."}
                        </p>
                        {selectedCategory !== "all" && (
                            <button
                                onClick={() => handleCategorySelect("all")}
                                className="mt-4 text-[#FED800] text-sm underline"
                            >
                                View all markets
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                {!isLoading && markets.length > 0 && (
                    <>
                        {/* Featured market */}
                        {featuredMarket && (
                            <FeaturedMarket
                                market={featuredMarket}
                                chartData={featuredChart}
                                onClick={() => router.push(`/markets/${featuredMarket.id}`)}
                            />
                        )}

                        {/* My positions shortcut */}
                        <button
                            onClick={() => router.push("/markets/positions")}
                            className="w-full flex items-center justify-between bg-[#1a2633] border border-gray-800 hover:border-[#FED800]/30 rounded-xl px-4 py-3 mb-5 transition-all group"
                        >
                            <div className="flex items-center gap-2 text-sm text-gray-300 group-hover:text-white">
                                <BarChart2 size={16} className="text-[#FED800]" />
                                <span>My Positions</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-[#FED800] transition-colors" />
                        </button>

                        {/* Section label */}
                        {otherMarkets.length > 0 && (
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
                                    All Markets
                                </h3>
                                <div className="flex-1 h-px bg-gray-800" />
                                <span className="text-xs text-gray-600">{otherMarkets.length} markets</span>
                            </div>
                        )}

                        {/* Market grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {otherMarkets.map((market) => (
                                <MarketCard
                                    key={market.id}
                                    market={market}
                                    onClick={() => router.push(`/markets/${market.id}`)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* ── Bottom Nav (mobile only) ────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}
