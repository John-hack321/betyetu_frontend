'use client'
import { useAuth } from "../context/authContext"
import MenuOverlay from "../components/menuOverlay"
import FooterComponent from "../components/footer"
import { fetchMarkets } from "../api/predictionMarket"
import { GroupMarket, PredictionMarket, MatchPredictionMarket } from "../app_state/slices/predictionMarketData"

import { useState, useEffect } from "react"
import { Menu, Search } from "lucide-react"

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

function PredictionMarketCard ({ market }: { market: PredictionMarket }) {
    return (
        <div className="flex flex-col rounded-lg p-4 bg-lightblue-components gap-4 mb-3">

            {/* question and percetage chance */}
            <div className="flex flex-row justify-between">
                <span
                className="w-7/10">{market.question}</span>
                <div className="p-3 w-15 h-15 items-center justify-center border-4 rounded-full"> {/* on this thing here I need this border or whatever implementation you will use , but I need it to have both red and green colors okay so that green color represetns the yes and red for no and the length of green color should be denoted be deonted by the percentage for yes and the red lenght by the percentage for no okay you can also change the size if you want okay or if you think doing semi-circles like in polymarket then it is also okay  though I thik the semi colom might be better to also allow us to write chance below it right ?*/}
                    <span className="text-sm text-center">{(market.yes_price * 100).toFixed(0)}%</span> 
                </div>
            </div>

            {/* selection buttons */}
            <div className="gap-2 flex flex-row ">
                <button 
                className="w-1/2 rounded-lg bg-[#0C3D37] text-green-500 py-2">yes</button>
                <button
                className="w-1/2 rounded-lg bg-[#431D27] text-red-400 py-2">No</button>
            </div>

            {/* volume info and relevant stuff */}
            <div className="flex flex-row justify-between">
                <span className="text-sm">
                    ksh{market.total_collected.toFixed(0)}
                    <span className="text-sm">{(market.total_collected < 1000) ? "" : (market.total_collected < 1000000) ? "k" : "M" }</span>
                </span>
                <span
                className="text-sm"
                >{formatMatchDate(market.locks_at)}</span> {/* we have used locks at here just for now since in the backend it points to the matchs start time , we will find a better way later on */}
            </div>

        </div>
    )
}

function GroupMarketCard ({ market }: { market: GroupMarket }) {
    return (
        <div className="bg-lightblue-components rounded-lg p-4 flex flex-col mb-2 gap-3">
            {/* market name */}
            <div>
                <span>{market.question}</span>
            </div>

            {/* rendering of sub markets here */}
            <div
            className="overflow-y-hidden flex flex-col h-10 scroll-auto">
                {market.sub_markets.length > 0 && (
                    market.sub_markets.map((sub_market) => (
                        <div
                        className="flex justify-between items-center"
                        key={sub_market.id}>
                            <span>ruto</span> {/* ths is just a stand in this value should come from option in the data */}
                            <div className="flex flex-row gap-3">
                                <span>{(sub_market.yes_price * 100).toFixed(0)}%</span>
                                <button className="text-sm px-3 py-2 rounded-full text-green-500 bg-[#0C3D37]">Yes</button>
                                <button className="text-sm px-3 py-2 rounded-full bg-[#431D27] text-red-400">No</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* volume and other info */}
            <div className="flex flex-row justify-between">
                <span className="text-sm">
                    ksh{market.total_collected.toFixed(0)}
                    <span className="text-sm">{(market.total_collected < 1000) ? "" : (market.total_collected < 1000000) ? "k" : "M" }</span>
                </span>
                <span
                className="text-sm"
                >{formatMatchDate(market.locks_at)}</span> {/* we have used locks at here just for now since in the backend it points to the matchs start time , we will find a better way later on */}
            </div>


        </div>
    )
}

function FixtureMarketCard ({ market }: { market: MatchPredictionMarket }) {
    return (
        <div className="flex p-4 flex-col rounded-lg bg-lightblue-components gap-3 mb-2">
            {/* team name part */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <h2>{market.home_team}</h2>
                    <h2>{(market.home_price * 100).toFixed(0)}%</h2> {/* we use toFixed to round it off to a whole nubmer */}
                </div>
                <div className="flex flex-row justify-between">
                    <h2>{market.away_team}</h2>
                    <h2>{(market.away_price * 100).toFixed(0)}%</h2>
                </div>
            </div>   
            
            {/* selection buttons */}       
            <div className="flex flex-row gap-1 justify-between">
                {/* in the color design of these buttons I would realy like it if the buttons were made to change color based on the percentage on the side eg: for low values it can be red and for heigher values it can be green , just like the coloring we did with the pool stake buttons for now I will just put any color as place holders */}
                {/* the text color shold also change color so that it does not look that bad so in short the text color should also be flexible okay  */}
                {/* also about the name formating if ther is way we can format the name for the team it would be good since others have very long names */}
                <button 
                className="px-3 py-2 w-1/3 text-sm rounded-lg bg-green-200"
                >{truncateTeamName(market.home_team)}</button>
                <button
                className="px-3 py-2 w-1/3 text-sm rounded-lg bg-gray-200"
                >Draw</button>
                <button
                className="px-3 py-2 w-1/3 text-sm rounded-lg bg-red-200"
                >{truncateTeamName(market.away_team)}</button>
            </div>

            {/* volume informatin and relevant stuff */}
            <div className="flex flex-row justify-between">
                <span className="text-sm">
                    ksh{market.total_collected.toFixed(0)}
                    <span className="text-sm">{(market.total_collected < 1000) ? "" : (market.total_collected < 1000000) ? "k" : "M" }</span>
                </span>
                <span
                className="text-sm"
                >{formatMatchDate(market.locks_at)}</span> {/* we have used locks at here just for now since in the backend it points to the matchs start time , we will find a better way later on */}
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
    const [searchButtonClicked, setSearchButtonClicked] = useState<boolean>(false)
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

    const filteredMarkets = predictionMarketData.data;

    const handleTabClick = (tabId: FilterType) => {
        setFilterState({ type: tabId, leagueId: null })
    }

    return (
        <div className="flex flex-col h-screen bg-other-blue-main-background-color">
            {/* Mobile Menu Overlay */}
            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* Header */}
            <div className="flex-none bg-[#1a2633] px-4 pt-4 sm:pb-1 lg:pb-4 md:pb-4 md:px-6 z-20  md:border-none ">
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
                <div className="overflow-y-auto pb-24 lg:pb-4  lg:pr-4">

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
                    <div className="px-2 pt-2 lg:px-0 lg:grid lg:grid-cols-2 lg:gap-4 staggered-grid">
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