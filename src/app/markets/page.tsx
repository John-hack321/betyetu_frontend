'use client'
import { useAuth } from "../context/authContext"
import MenuOverlay from "../components/menuOverlay"
import FooterComponent from "../components/footer"
import { fetchMarkets } from "../api/predictionMarket"
import { GroupMarket, PredictionMarket, MatchPredictionMarket } from "../app_state/slices/predictionMarketData"

import { useState, useEffect } from "react"
import { Menu, Search } from "lucide-react"
import { useMemo } from "react"

// redux imports 
import { RootState, AppDispatch } from "../app_state/store"
import { useDispatch, useSelector } from "react-redux"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { SearchBar } from "../components/searchBar"
import { setMarkets } from "../app_state/slices/predictionMarketData"
import { truncateTeamName } from "../components/fixtureCard"
import { formatMatchDate } from "@/utils/dateUtils"

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

function formatCurrencyCompact(amount: number): string {
    if (amount >= 1_000_000) return `Ksh ${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `Ksh ${(amount / 1_000).toFixed(1)}K`
    return `Ksh ${amount.toFixed(0)}`
}

function formatVolumeTiny(amount: number): string {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1).replace('.0', '')}K`
    return `${amount.toFixed(0)}`
}

function getCategoryLabel(category?: string): string {
    if (typeof category === 'string' && category.trim().length > 0) {
        return category.trim().toLowerCase()
    }
    return 'category'
}

function normalizeForSearch(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function ProbabilityGauge({ yesPct }: { yesPct: number }) {
    const total = 82; // arc length
    const filled = (yesPct / 100) * total;
    const color = yesPct >= 60 ? '#10b981' : yesPct >= 40 ? '#fbbf24' : '#ef4444';

    return (
    <div className="flex flex-col items-center gap-1 shrink-0 self-start px-1 pt-0 pb-1">
        <svg width="84" height="42" viewBox="0 0 64 36" style={{ overflow: 'visible' }}>
        <path
            d="M 6,36 A 10,10 0 0,1 58,36"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <path
            d="M 6,36 A 10,10 0 0,1 58,36"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${total}`}
        />
        <text x="32" y="35.5" textAnchor="middle" fill="#e2e8f0"
            fontSize="17" fontWeight="700">{yesPct.toFixed(0)}%</text>
        </svg>
        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Chance</span>
    </div>
    );
}

function PredictionMarketCard ({ market }: { market: PredictionMarket }) {
    const yesButtonStyle = 'bg-emerald-500/20 border-emerald-400/35 text-emerald-200'
    const noButtonStyle = 'bg-rose-500/20 border-rose-400/35 text-rose-100'
    const marketCategory = getCategoryLabel(market.category)

    return (
        <div className="flex flex-col rounded-2xl p-4 sm:p-5 bg-[#131e28] gap-4 mb-3 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">

            {/* question and probability chance */}
            <div className="flex flex-row items-start justify-between gap-3">
                <span
                className="text-slate-100 font-semibold leading-6">{market.question}</span>
                <ProbabilityGauge yesPct={market.yes_price * 100} />
            </div>

            {/* selection buttons */}
            <div className="gap-2 flex flex-row">
                <button 
                className={`w-1/2 rounded-xl border py-2.5 font-semibold text-sm transition-all hover:brightness-110 ${yesButtonStyle}`}>Yes</button>
                <button
                className={`w-1/2 rounded-xl border py-2.5 font-semibold text-sm transition-all hover:brightness-110 ${noButtonStyle}`}>No</button>
            </div>

            {/* volume info and relevant stuff (divider line intentionally removed) */}
            <div className="flex flex-row items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[12px] leading-none text-slate-400">
                    <span className="font-medium text-slate-300">Ksh {formatVolumeTiny(market.total_collected)} Vol.</span>
                    <span className="text-slate-600">·</span>
                    <span className="tracking-wide lowercase">{marketCategory}</span>
                </div>
                <span className="text-[11px] text-slate-500">{formatMatchDate(market.locks_at)}</span>
            </div>

        </div>
    )
}

function GroupMarketCard ({ market }: { market: GroupMarket }) {
    const marketCategory = getCategoryLabel(market.category)
    const yesButtonStyle = 'bg-emerald-500/20 text-emerald-200'
    const noButtonStyle = 'bg-rose-500/20 text-rose-100'

    return (
        <div className="bg-[#131e28] rounded-xl p-3 sm:p-3.5 flex flex-col mb-3 gap-2.5 border border-white/5 shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
            {/* main market question */}
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-slate-100 font-semibold leading-6">
                    {market.question}
                </h3>
            </div>

            {/* sub-market rows (scrollable, two visible at a time) */}
            <div
            className=" h-[80px] overflow-y-auto hide-vertical-scrollbar space-y-0 pr-0.5">
                {market.sub_markets.length > 0 && (
                    market.sub_markets.map((sub_market) => (
                        <div
                        className="flex flex-row items-center justify-between gap-2 h-10 w-full"
                        key={sub_market.id}>
                            <span className="text-slate-200 text-sm font-semibold leading-5 truncate">
                                {sub_market.option}
                            </span>
                            <div className="flex flex-row items-center gap-1.5">
                                <span className="text-slate-100 font-semibold leading-6 tabular-nums pr-0.5">
                                    {(sub_market.yes_price * 100).toFixed(0)}%
                                </span>
                                <button className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all hover:brightness-110 ${yesButtonStyle}`}>
                                    Yes
                                </button>
                                <button className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all hover:brightness-110 ${noButtonStyle}`}>
                                    No
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* footer info (divider line intentionally removed) */}
            <div className="flex flex-row items-center justify-between pt-1.5">
                <div className="flex items-center gap-2 text-[12px] leading-none text-slate-400">
                    <span className="font-medium text-slate-300">Ksh {formatVolumeTiny(market.total_collected)} Vol.</span>
                    <span className="text-slate-600">·</span>
                    <span className="tracking-wide lowercase">{marketCategory}</span>
                </div>
                <span className="text-[11px] text-slate-500">{formatMatchDate(market.locks_at)}</span>
            </div>
        </div>
    )
}

function getFixtureButtonStyle(
    pct: number,
    hasTrades: boolean,
    side: 'home' | 'draw' | 'away'
): { bar: string; text: string } {
    if (!hasTrades) {
        if (side === 'home') return { bar: 'bg-emerald-700/35 border-emerald-500/30', text: 'text-emerald-200' };
        if (side === 'away') return { bar: 'bg-yellow-700/35 border-yellow-500/30', text: 'text-yellow-100' };
        return { bar: 'bg-slate-700/45 border-slate-500/40', text: 'text-slate-200' };
    }

    if (pct >= 0.6) return { bar: 'bg-emerald-500/25 border-emerald-400/40', text: 'text-emerald-200' };
    if (pct >= 0.4) return { bar: 'bg-yellow-500/25 border-yellow-300/45', text: 'text-yellow-100' };
    if (pct >= 0.25) return { bar: 'bg-orange-500/25 border-orange-300/45', text: 'text-orange-100' };
    return { bar: 'bg-rose-600/25 border-rose-400/45', text: 'text-rose-100' };
}

function FixtureMarketCard ({ market }: { market: MatchPredictionMarket }) {
    const hasTrades = market.total_collected >= 100
    const homeStyle = getFixtureButtonStyle(market.home_price, hasTrades, 'home')
    const drawStyle = getFixtureButtonStyle(market.draw_price, hasTrades, 'draw')
    const awayStyle = getFixtureButtonStyle(market.away_price, hasTrades, 'away')
    const marketCategory = getCategoryLabel(market.category)

    const selections = [
        {
            key: 'home',
            label: truncateTeamName(market.home_team),
            price: market.home_price,
            style: homeStyle,
            widthClass: 'flex-[1.45]',
        },
        {
            key: 'draw',
            label: 'Draw',
            price: market.draw_price,
            style: drawStyle,
            widthClass: 'flex-[0.8]',
        },
        {
            key: 'away',
            label: truncateTeamName(market.away_team),
            price: market.away_price,
            style: awayStyle,
            widthClass: 'flex-[1.45]',
        },
    ]

    return (
        <div className="flex p-4 sm:p-5 flex-col rounded-2xl bg-[#131e28] gap-4 mb-3 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"> {/** initial bg color : 1e2d3d */}
            {/* fixture header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-slate-100 font-semibold leading-6 truncate">
                            {market.home_team}
                        </h2>
                        <span className="text-slate-100 font-semibold leading-6 shrink-0">
                            {(market.home_price * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-slate-100 font-semibold leading-6 truncate">
                            {market.away_team}
                        </h2>
                        <span className="text-slate-100 font-semibold leading-6 shrink-0">
                            {(market.away_price * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">Closes</span>
                    <p className="text-xs sm:text-sm text-slate-200">{formatMatchDate(market.locks_at)}</p>
                </div>
            </div>

            {/* selection buttons */}
            <div className="flex flex-row gap-2 justify-between">
                {selections.map((selection) => (
                    <button
                    key={selection.key}
                    className={`${selection.widthClass} px-2.5 py-2.5 text-xs sm:text-sm rounded-xl font-semibold transition-all border ${selection.style.bar} ${selection.style.text} hover:brightness-110`}
                    >
                        <span className="block truncate">{selection.label}</span>
                    </button>
                ))}
            </div>

            {/* volume information and relevant stuff (divider line intentionally removed) */}
            <div className="flex flex-row items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[12px] leading-none text-slate-400">
                    <span className="font-medium text-slate-300">Ksh {formatVolumeTiny(market.total_collected)} Vol.</span>
                    <span className="text-slate-600">·</span>
                    <span className="tracking-wide lowercase">{marketCategory}</span>
                </div>
                <span className="text-[11px] text-slate-500">{formatMatchDate(market.locks_at)}</span>
            </div>
        </div>
    )
}

function MarketCard ({ market }: { market: PredictionMarket | GroupMarket | MatchPredictionMarket }) {
    switch (market.market_type) {
        case 'prediction':
            return <PredictionMarketCard market={market as PredictionMarket} />
        case 'group':
            return <GroupMarketCard market={market as GroupMarket} />
        case 'fixture':
            return <FixtureMarketCard market={market as MatchPredictionMarket} />
        default:
            return null
    }
}

function MarketsPage () {

    //local state 
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")
    const [searchButtonClicked, setSearchButtonClicked] = useState<boolean>(true) // for this page it looks better with the search bar open by default
    const [activePill, setActivePill] = useState('all')
    const [searchOpen, setSearchOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    // redux state
    const dispatch = useDispatch<AppDispatch>()
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const MatchData = useSelector((state: RootState) => state.allFixturesData)
    const predictionMarketData = useSelector((state: RootState) => state.predictionMarketData)

    const {logout} = useAuth()

    // Initial load => channels all the initial data loads into one useEffect call
    useEffect(() => {
        const init = async () => {
            try {
                const [PredictionMarkets] = await Promise.all([
                    fetchMarkets()
                ]) 
                if (PredictionMarkets) dispatch(setMarkets(PredictionMarkets))
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data')
            } finally {
                setLoading(false)
            }
        }

        dispatch(updateCurrentPage('markets'))
        init()
    }, [dispatch])


    // Filter state
    // TODO: make this filter logic to be specific to prediction market stuff
    const [filterState, setFilterState] = useState<FilterState>({
        type: 'all',
        leagueId: null,
    })
    
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

    const filteredMarkets = useMemo(() => {
        if (!predictionMarketData.data || predictionMarketData.data.length === 0) return []
        let predictionMarketDataCopy = [...predictionMarketData.data]
        let filtered = predictionMarketDataCopy.filter(market => {
            const userSearch = normalizeForSearch(search)
            return normalizeForSearch(market.question).includes(userSearch) || normalizeForSearch(market.category).includes(userSearch)
            || (market.market_type === 'fixture' && (normalizeForSearch(truncateTeamName(market.home_team)).includes(userSearch) || normalizeForSearch(truncateTeamName(market.away_team)).includes(userSearch)))
            || (market.market_type === 'group' && market.sub_markets.some(sub_market => normalizeForSearch(sub_market.option).includes(userSearch)))
        })
        return filtered
    }, [predictionMarketData.data, search])

    const handleTabClick = (tabId: FilterType) => {
        setFilterState({ type: tabId, leagueId: null })
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-other-blue-main-background-color">
            {/* Mobile Menu Overlay */}
            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* Header */}
            <div className="flex-none bg-[#1a2633] px-4 pt-4 sm:pb-1 lg:pb-4 md:pb-4 md:px-6 z-20  md:border-none overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
                        >
                            <Menu className="text-gray-300" size={24} />
                        </button>
                        <h1 className="text-2xl font-bold md:text-3xl">
                            <span className="text-[#FED800]">peer</span>
                            <span className="text-gray-100">stake</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all md:text-base">
                            Deposit
                        </button>

                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => {
                            if (searchButtonClicked ) {
                                setSearch("")
                            }
                            setSearchButtonClicked(!searchButtonClicked)
                        }}>
                            <Search className="text-gray-300" size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden lg:grid lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[350px_1fr_350px] lg:gap-6 lg:overflow-hidden lg:px-6 lg:pt-6">
            {/** we will decide later on whethe we need the left and right side bars */}

                {/* central content  TODO : Fix the hide vertical scrollbar part */}
                <div className="overflow-y-auto hide-vertical-scrollbar pb-24 lg:pb-4  lg:pr-4">

                    {/* filters for mobile */}
                    <div className="sticky top-0 bg-[#1a2633] z-10 p-2  md:hidden">  

                        {/* the search bar will be rendered here now */}
                        { searchButtonClicked && (
                            <SearchBar
                            onClose={()=> {
                                setSearch("")
                                setSearchButtonClicked(false)
                            }}
                            handleOnChange={e => setSearch(e.target.value)}
                            />
                        )}                

                        <div className="border-b border-gray-700 bg-[#1a2633] overflow-x-scroll hide-horizontal-scrollbar">
                            <div className="flex gap-6 p-2 rounded-t-lg min-w-max">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative flex items-center gap-1 whitespace-nowrap ${filterState.type === tab.id ? 'text-[#FED800]' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        {tab.label}
                                        {tab.dot && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                        {filterState.type === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div> 
                    </div> {/* end of mobile header */}

                    {/* Filter — desktop : this is just a stand in for now we are focused on mobile : I will make this better laters*/}
                    <div className="hidden lg:block sticky top-0 bg-[#1a2633] z-10 pb-4 mb-4">
                        <div className="bg-[#1a2633] rounded-lg p-4 border border-gray-700">
                            <div className="flex gap-6 border-b border-gray-700 pb-3">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative flex items-center gap-1 whitespace-nowrap ${filterState.type === tab.id ? 'text-[#FED800]' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        {tab.label}
                                        {tab.dot && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                        {filterState.type === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/** rendering the markets now */}
                    <div className=" lg:px-0 lg:grid lg:grid-cols-2 px-3 flex flex-col  lg:gap-4 staggered-grid">
                        {filteredMarkets.length > 0 ? (
                            filteredMarkets.map((market) => (
                                <MarketCard key={market.created_at} market={market} /> // I dont think created_at is a good way for assigning market we will fix this later on 
                            ))
                        ) : (
                            <div className="text-center text-gray-400">
                                No markets found
                            </div>
                        )}
                    </div>

                </div> {/* end of center content */}
                
            </div>


            {/* Footer — mobile only */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={currentPage} publicStakeNumber={MatchData.no_of_public_stakes} />
            </div>
            

        </div>
    )
}

export default MarketsPage