'use client'
import { useEffect, useState } from "react"
import { fetchAllFixtures } from "../api/matches"
import FixtureCard from "../components/fixtureCard"
import ProtectedRoute from "../components/protectedRoute"
import { useRouter } from "next/navigation"
import { Menu, Search} from 'lucide-react'

// imports from othe files and self modules
import FooterComponent from "../components/footer"

// schema imports
import { Fixture } from "../apiSchemas/matcheSchemas"

// redux setup imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateUserDataAsync } from "../app_state/slices/userData"
import { updateAllFixturesData } from "../app_state/slices/matchData"
import {addOwnerMatchIdAndPlacemntToCurrentStakeData, updateGuestStakePlacementOnCurrentStakeData } from "../app_state/slices/stakingData"
import { updateCurrentPage } from "../app_state/slices/pageTracking"

function Dashboard(){
    const router = useRouter()
    const userData = useSelector((state: RootState) => state.userData)
    const matchData = useSelector((state : RootState) => state.allFixturesData)
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page)
    const dispatch = useDispatch<AppDispatch>()

    const [selectedOption, setSelectedOption]= useState<'home' | 'away' | 'draw' | null>(null)
    const [selectedMatchId, setSelectedMatchId]= useState<number | null>(null)
    const [matchesListData , setMatchesListData] = useState<Fixture[]>([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('all')
    const thisPage: string= "home"

    const updateStakeDataWithMatchIdAndPlacement = (stakeMatchId: number, stakeChoice: string, homeTeam: string, awayTeam: string) => {
        const data= {
            matchId: stakeMatchId,
            placement: stakeChoice,
            home: homeTeam,
            away: awayTeam,
        }
        dispatch(addOwnerMatchIdAndPlacemntToCurrentStakeData(data))
    }

    /**
     * 
     * @param fixtureId 
     * @param option 
     * @param teamName 
     * @param homeTeam 
     * @param awayTeam 
     * 
     * this function updates the stake data based on the choices on the stakingPage
     */
    const handleOptionclick = (fixtureId: number,
         option: "home" | "away" | "draw",
         teamName: string,
         homeTeam: string,
         awayTeam: string) => {
            if (selectedMatchId=== fixtureId && selectedOption === option) {
                setSelectedOption(null);
                setSelectedMatchId(null);
                updateStakeDataWithMatchIdAndPlacement(0, "", "", "")
            } else {
                setSelectedOption(option)
                setSelectedMatchId(fixtureId)
                updateStakeDataWithMatchIdAndPlacement(fixtureId, teamName, homeTeam, awayTeam)
            }
    }

    const handleStakeButtonClick = () => {
         router.push("/stakingPage")
    }

    const handleUseInviteLinkButtonClick= ()=> {
        router.push('/stakeLinking')
    }

    const handleUserQrCodeButtonClick= ()=> {
        router.push('/stakeLinking')
    }
    
    useEffect(() => {
        const loadFixturesData = async () => {
            try {
                const fixturesObject = await fetchAllFixtures();
                if (fixturesObject) { 
                    const fixturesList = fixturesObject.data
                    setMatchesListData(fixturesList);
                    dispatch(updateAllFixturesData(fixturesObject))
                }
            } catch(err) {
                setError(err instanceof Error ? err.message : "Failed to load fixtures data");
            } finally {
                setLoading(false);
            }
        };

        const loadUserData = async () => {
            dispatch(updateUserDataAsync())
        };

        const updatePageData= (page: string)=> {
            updateCurrentPage(page)
        };

        loadFixturesData();
        loadUserData();
        updatePageData(thisPage);

    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0F1419]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
                    <p className="text-gray-400 text-sm">Loading matches...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-[#0F1419] min-h-screen flex items-center justify-center p-4">
                <div className="rounded-lg bg-[#1a2633] p-6 text-center max-w-md w-full">
                    <h2 className="text-red-400 text-lg font-semibold mb-2">Failed to load data</h2>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="text-black bg-[#FED800] hover:bg-[#ffd700] rounded-lg px-6 py-3 font-semibold transition-colors w-full">
                        Reload
                    </button>
                </div>
            </div>
        )
    }

    if (!matchesListData) {
        return (
            <div className="bg-[#0F1419] min-h-screen flex items-center justify-center p-4">
                <div className="rounded-lg bg-[#1a2633] p-6 text-center max-w-md w-full">
                    <p className="text-gray-300 mb-4">Match data not found</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="text-black bg-[#FED800] hover:bg-[#ffd700] rounded-lg px-6 py-3 font-semibold transition-colors w-full">
                        Reload
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-[#0F1419]">
            {/* Modern Header */}
            <div className="flex-none bg-gradient-to-b from-[#1a2633] to-[#16202C] px-4 py-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Menu className="text-gray-300" size={24} />
                        </button>
                        <h1 className="text-2xl font-bold">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all">
                            Deposit
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Search className="text-gray-300" size={20} />
                        </button>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button 
                    onClick={()=> {handleUseInviteLinkButtonClick()}}
                    className="bg-[#60991A] text-black font-medium px-4 py-2 rounded-full text-sm whitespace-nowrap shadow-md hover:bg-[#4d7a15] transition-all">
                        🔗 Use Invite Link
                    </button>
                    <button
                    onClick={()=> {handleUserQrCodeButtonClick()}}
                     className="bg-[#60991A] text-black font-medium px-4 py-2 rounded-full text-sm whitespace-nowrap shadow-md hover:bg-[#4d7a15] transition-all">
                        📱 Scan QR Code
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-4 border-b border-gray-700">
                    {['All', 'Leagues', 'Live', 'Top'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                                activeTab === tab.toLowerCase()
                                    ? 'text-[#FED800]'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable games section */}
            <div className="flex-1 overflow-y-auto">
                <div className="pb-20 px-2 pt-2">
                    {matchData.data && matchData.data.length > 0 ? (
                        matchData.data.map((match) => (
                            <div key={match.match_id} className="mb-2">
                                <FixtureCard
                                    keyId={match.match_id}
                                    clickedFixtureId={selectedMatchId}
                                    league={match.league_name}
                                    matchTime={match.match_date}
                                    homeTeam={match.home_team}
                                    awayTeam={match.away_team}
                                    onClickHomeButton={() => handleOptionclick(match.match_id, "home", match.home_team, match.home_team, match.away_team)}
                                    onClickAwayButton={() => handleOptionclick(match.match_id, "away", match.away_team, match.home_team, match.away_team)}
                                    onClickDrawButton={() => handleOptionclick(match.match_id, "draw", "draw", match.home_team, match.away_team)}
                                    onClickStakeButton={handleStakeButtonClick}
                                    homeButtonClicked={selectedMatchId === match.match_id && selectedOption === "home"}
                                    awayButtonClicked={selectedMatchId === match.match_id && selectedOption === "away"}
                                    drawButtonClicked={selectedMatchId === match.match_id && selectedOption === "draw"}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400">No matches available</p>
                        </div>
                    )}
                </div>
            </div>
            <FooterComponent currentPage={currentPage}/>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard/>
        </ProtectedRoute>
    )
}