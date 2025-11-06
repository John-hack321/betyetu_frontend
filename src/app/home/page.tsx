'use client'
import { useEffect, useState, useRef } from "react"
import { fetchAllFixtures } from "../api/matches"
import FixtureCard from "../components/fixtureCard"
import ProtectedRoute from "../components/protectedRoute"
import { useRouter } from "next/navigation"
import { Menu, Search } from 'lucide-react'

import FooterComponent from "../components/footer"
import { Fixture } from "../apiSchemas/matcheSchemas"

// redux setup imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateUserDataAsync } from "../app_state/slices/userData"
import { updateAllFixturesData, appendFixturesData, setLoadingState } from "../app_state/slices/matchData"
import { addOwnerMatchIdAndPlacemntToCurrentStakeData } from "../app_state/slices/stakingData"
import { updateCurrentPage } from "../app_state/slices/pageTracking"

function Dashboard() {
    const loaderRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<number>(1);
    const [isFetching, setIsFetching] = useState(false); // Local fetching state

    const router = useRouter()
    const userData = useSelector((state: RootState) => state.userData)
    const matchData = useSelector((state: RootState) => state.allFixturesData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const dispatch = useDispatch<AppDispatch>()

    const [selectedOption, setSelectedOption] = useState<'home' | 'away' | 'draw' | null>(null)
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
    const [matchesListData, setMatchesListData] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('all')
    const thisPage: string = "home"

    const updateStakeDataWithMatchIdAndPlacement = (stakeMatchId: number, stakeChoice: string, homeTeam: string, awayTeam: string) => {
        const data = {
            matchId: stakeMatchId,
            placement: stakeChoice,
            home: homeTeam,
            away: awayTeam,
        }
        dispatch(addOwnerMatchIdAndPlacemntToCurrentStakeData(data))
    }

    const handleOptionclick = (fixtureId: number, option: "home" | "away" | "draw", teamName: string, homeTeam: string, awayTeam: string) => {
        if (selectedMatchId === fixtureId && selectedOption === option) {
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

    const handleUseInviteLinkButtonClick = () => {
        router.push('/stakeLinking')
    }

    const handleUserQrCodeButtonClick = () => {
        router.push('/stakeLinking')
    }

    // Intersection Observer setup
    useEffect(() => {
        const currentLoader = loaderRef.current;
        
        console.log('🔧 Setting up observer:', {
            loaderExists: !!currentLoader,
            hasNextPage: matchData.has_next_page,
            isFetching: isFetching,
            currentPage: page,
            totalMatches: matchData.data?.length
        });
        
        if (!currentLoader) {
            console.error('❌ Loader ref is null!');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                
                console.log('👁️ Observer triggered:', {
                    isIntersecting: first.isIntersecting,
                    intersectionRatio: first.intersectionRatio,
                    hasNextPage: matchData.has_next_page,
                    isFetching: isFetching,
                    currentPage: page
                });

                if (first.isIntersecting && matchData.has_next_page && !isFetching) {
                    console.log('✅ Loading next page...', page + 1);
                    setPage(prev => prev + 1);
                    console.log(`page has been set to ${page}`)
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '200px', // Even more aggressive
                root: null // Use viewport as root
            }
        );

        observer.observe(currentLoader);
        console.log('✅ Observer attached to loader'); // observer has been attached to loader for better handling

        return () => {
            observer.unobserve(currentLoader);
            console.log('🧹 Observer cleaned up');
        };
    }, [matchData.has_next_page, isFetching, page, matchData.data?.length])

    // Fetch more data when page changes
    useEffect(() => {
        const fetchMoreData = async () => {
            console.log("the fetch more data useEffect has been initiated now running the fetch more data endpoing")
            if (page > 1 && !isFetching) {
                try {
                    setIsFetching(true);
                    dispatch(setLoadingState());
                    
                    console.log(`Fetching page ${page}...`);
                    const fixturesObject = await fetchAllFixtures(100, page);
                    
                    if (fixturesObject) {
                        console.log(`Received ${fixturesObject.data.length} fixtures`);
                        dispatch(appendFixturesData(fixturesObject));
                    }
                } catch (err) {
                    console.error('Error fetching more fixtures:', err);
                } finally {
                    setIsFetching(false);
                    dispatch(setLoadingState());
                }
            }
        };

        fetchMoreData();
        console.log("fetch more data function has just finished running")
    }, [page, dispatch]); // Only trigger when page changes

    // Initial data load
    useEffect(() => {
        const loadFixturesData = async () => {
            console.log("the load fixture_data useEffect has been ignited and is now running")
            try {
                const fixturesObject = await fetchAllFixtures(100, 1);
                if (fixturesObject) {
                    const fixturesList = fixturesObject.data
                    setMatchesListData(fixturesList);
                    dispatch(updateAllFixturesData(fixturesObject))
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load fixtures data");
            } finally {
                setLoading(false);
            }
        };

        const loadUserData = async () => {
            dispatch(updateUserDataAsync())
        };

        const updatePageData = (page: string) => {
            dispatch(updateCurrentPage(page))
        };

        loadFixturesData();
        loadUserData();
        updatePageData(thisPage);
    }, [dispatch])

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
            {/* Header */}
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
                        onClick={() => { handleUseInviteLinkButtonClick() }}
                        className="bg-[#60991A] text-black font-medium px-4 py-2 rounded-full text-sm whitespace-nowrap shadow-md hover:bg-[#4d7a15] transition-all">
                        🔗 Use Invite Link
                    </button>
                    <button
                        onClick={() => { handleUserQrCodeButtonClick() }}
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
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === tab.toLowerCase()
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
                <div className="px-2 pt-2 pb-24">
                    {matchData.data && matchData.data.length > 0 ? (
                        <>
                            {matchData.data.map((match) => (
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
                            ))}

                            {/* Loader element - MUST be visible and ABOVE footer */}
                            <div 
                                ref={loaderRef} 
                                className="py-8 bg-red-500 flex justify-center items-center min-h-[100px] bg-[#0F1419]"
                                style={{ marginBottom: '80px' }}
                            >
                                {isFetching ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FED800]"></div>
                                        <p className="text-gray-400 text-xs">Loading more...</p>
                                    </div>
                                ) : matchData.has_next_page ? (
                                    <p className="text-gray-500 text-xs">↓ Scroll for more ↓</p>
                                ) : (
                                    <p className="text-gray-400 text-sm">✓ All matches loaded</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400">No matches available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer - FIXED position */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    )
}