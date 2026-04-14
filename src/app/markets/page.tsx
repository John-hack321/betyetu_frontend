'use client'
import { useAuth } from "../context/authContext"
import MenuOverlay from "../components/menuOverlay"
import FooterComponent from "../components/footer"

import { useState, useEffect } from "react"
import { Menu, Search } from "lucide-react"

// redux imports 
import { RootState, AppDispatch } from "../app_state/store"
import { useDispatch, useSelector } from "react-redux"
import { updateCurrentPage } from "../app_state/slices/pageTracking"

type FilterType = 'all' | 'leagues' | 'live' | 'top'

interface FilterState {
    type: FilterType
    leagueId: number | null
}


function MarketsPage () {

    //local state 
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")
    const [searchButtonClicked, setSearchButtonClicked] = useState<boolean>(false)

    // redux state
    const dispatch = useDispatch<AppDispatch>()
    const userData = useSelector((state: RootState) => state.userData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const MatchData = useSelector((state: RootState) => state.allFixturesData)

    const {logout} = useAuth()

    // Initial load => channels all the initial data loads into one useEffect call
    useEffect(() => {
        const init = async () => {
            try {
                
            } catch (err) {
            } finally {
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
    
    const filterTabs: { id: FilterType; name: string }[] = [
        { id: 'all', name: 'All' },
        { id: 'leagues', name: 'Leagues' },
            { id: 'live', name: 'Live' },
            { id: 'top', name: 'Top' },
        ]

    const handleTabClick = (tabId: FilterType) => {
        setFilterState({ type: tabId, leagueId: tabId === 'leagues' ? filterState.leagueId : null })
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
            <div className="flex-none bg-[#1a2633] px-4 py-4 md:shadow-none shadow-lg md:px-6 z-20 border-b md:border-none border-gray-800">
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

                <div className="border-b border-gray-700 bg-[#1a2633] flex flex-row">
                    <div className="flex gap-6  p-2 rounded-t-lg w-3/4">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${filterState.type === tab.id ? 'text-[#FED800]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                {tab.name}
                                {filterState.type === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]" />
                                )}
                            </button>
                        ))}
                    </div>

                </div>
                {filterState.type === 'leagues' && (
                <div className="overflow-x-auto bg-[#1a2633] p-2 rounded-b-lg">
                    <div className="flex gap-2 pb-2">
                        {leagueListData.map((league) => (
                            <button
                                key={league.id}
                                onClick={() => handleLeagueSelect(league.id)}
                                className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterState.leagueId === league.id ? 'bg-[#FED800] text-black' : 'bg-[#23313D] text-gray-300 hover:bg-[#2a3643]'}`}
                            >
                                {league.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            </div>



            {/* Footer — mobile only */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={currentPage} publicStakeNumber={MatchData.no_of_public_stakes} />
            </div>
            

        </div>
    )
}

export default MarketsPage