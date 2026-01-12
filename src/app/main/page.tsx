// src/app/home/page.tsx
'use client'
import { useEffect, useState, useRef, useMemo } from "react"
import { fetchAllFixtures } from "../api/matches"
import FixtureCard from "../components/fixtureCard"
import ProtectedRoute from "../components/protectedRoute"
import { useRouter } from "next/navigation"
import { LucideToggleRight} from 'lucide-react'
import FooterComponent from "../components/footer"
import { Fixture } from "../apiSchemas/matcheSchemas"

// Redux imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateUserDataAsync } from "../app_state/slices/userData"
import { updateAllFixturesData, appendFixturesData, setLoadingState } from "../app_state/slices/matchData"
import { addOwnerMatchIdAndPlacemntToCurrentStakeData } from "../app_state/slices/stakingData"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { updateLeagueData } from "../app_state/slices/leagueData"
import { getAvailableLeagues, LeagueInterface } from "../api/leagues"
import { Home as HomeIcon , LayoutDashboard, Menu, Search, Trophy, User } from 'lucide-react'

// Filter types for type safety
type FilterType = 'all' | 'leagues' | 'live' | 'top';

interface FilterState {
    type: FilterType;
    leagueId: number | null;
}

function Home() {
    const loaderRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<number>(1);
    const [isFetching, setIsFetching] = useState(false);
    const router = useRouter()

    // Redux state
    const userData = useSelector((state: RootState) => state.userData)
    const matchData = useSelector((state: RootState) => state.allFixturesData)
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const leagueListData: LeagueInterface[] = useSelector((state: RootState) => state.leagueData.leagues_list)
    const dispatch = useDispatch<AppDispatch>()

    // Local state
    const [selectedOption, setSelectedOption] = useState<'home' | 'away' | 'draw' | null>(null)
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const thisPage: string = "main"

    // Enhanced filter state
    const [filterState, setFilterState] = useState<FilterState>({
        type: 'all',
        leagueId: null
    });

    // Filter tabs configuration
    const filterTabs: { id: FilterType; name: string }[] = [
        { id: 'all', name: "All" },
        { id: 'leagues', name: "Leagues" },
        { id: 'live', name: "Live" },
        { id: 'top', name: "Top" },
    ]

    // Computed filtered fixtures using useMemo for performance
    const filteredFixtures = useMemo(() => {
        if (!matchData.data || matchData.data.length === 0) return [];

        let filtered = [...matchData.data];

        switch (filterState.type) {
            case 'all':
                // Return all fixtures
                return filtered;

            case 'leagues':
                // If a specific league is selected, filter by it
                if (filterState.leagueId !== null) {
                    return filtered.filter(match => match.league_id === filterState.leagueId);
                }
                // Otherwise return all (will show league selector)
                return filtered;

            case 'live':
                // Filter for live matches (you'll need to add is_live field to your Fixture type)
                // For now, this is a placeholder
                return filtered.filter(match => {
                    // TODO: Add is_live field to your backend data
                    // return match.is_live === true;
                    return true; // Placeholder - show all for now
                });

            case 'top':
                // Show top leagues or featured matches
                // TODO: find data that we might want to show as top leageus
                const topLeagueIds = leagueListData.slice(0, 5).map(league => league.id);
                return filtered.filter(match => topLeagueIds.includes(match.league_id));

            default:
                return filtered;
        }
    }, [matchData.data, filterState, leagueListData]);

    // Handler for tab clicks
    const handleTabClick = (tabId: FilterType) => {
        setFilterState({
            type: tabId,
            leagueId: tabId === 'leagues' ? filterState.leagueId : null
        });
    };

    // Handler for league selection
    const handleLeagueSelect = (leagueId: number) => {
        setFilterState({
            type: 'leagues',
            leagueId: filterState.leagueId === leagueId ? null : leagueId
        });
    };

    // Match selection handlers
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

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const currentLoader = loaderRef.current;
        
        if (!currentLoader) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];

                if (first.isIntersecting && matchData.has_next_page && !isFetching) {
                    setPage(prev => prev + 1);
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '200px',
                root: null
            }
        );

        observer.observe(currentLoader);

        return () => {
            observer.unobserve(currentLoader);
        };
    }, [matchData.has_next_page, isFetching, page, matchData.data?.length])

    // Fetch more data when page changes
    useEffect(() => {
        const fetchMoreData = async () => {

            console.log(`the intersection for fetching more match data has been reached and now fetching more matches`)
            if (page > 1 && !isFetching) {
                try {
                    setIsFetching(true);
                    console.log(`is fetching has been set to : ${isFetching}`)
                    dispatch(setLoadingState());
                    
                    const fixturesObject = await fetchAllFixtures(100, page);
                    
                    if (fixturesObject) {
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
    }, [page, dispatch]);

    // Initial data load
    useEffect(() => {
        const loadLeaguesData = async () => {
            try {
                const data: LeagueInterface[] | null = await getAvailableLeagues()

                if (!data) {
                    throw new Error(`Data received from API is not defined`)
                }

                dispatch(updateLeagueData(data))
            } catch (err) {
                console.error(`Error loading league data: ${err}`)
            }
        };

        const loadFixturesData = async () => {
            try {
                const fixturesObject = await fetchAllFixtures(100, 1);
                if (fixturesObject) {
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

        loadLeaguesData();
        loadFixturesData();
        loadUserData();
        updatePageData('main');
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
                        className="w-full bg-[#FED800] hover:bg-[#ffd700] text-black rounded-lg px-6 py-3 font-semibold transition-colors">
                        Reload
                    </button>
                </div>
            </div>
        )
    }

        return (
            <div className="flex flex-col h-screen bg-[#0F1419]">
                {/* Full-width Header */}
                <div className="flex-none bg-gradient-to-b from-[#1a2633] to-[#16202C] px-4 py-4 shadow-lg md:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden">
                                <Menu className="text-gray-300" size={24} />
                            </button>
                            <h1 className="text-2xl font-bold md:text-3xl">
                                <span className="text-[#FED800]">bet</span>
                                <span className="text-gray-100">yetu</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all md:text-base">
                                Deposit
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Search className="text-gray-300" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
    
                {/* Main Content Area - Responsive Grid Layout */}
                <div className="flex-1 overflow-y-auto md:grid md:grid-cols-[250px_1fr_250px] md:gap-4 lg:grid-cols-[300px_1fr_300px] md:p-4">
    
                    {/* Left Sidebar (hidden on mobile, visible on desktop) */}
                    <div className="hidden md:block bg-[#1a2633] rounded-lg p-4 self-start">
                        <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
                        <div className="flex flex-col gap-2">
                            {/* Navigation Links from Footer */}
                            <button onClick={()=> router.push('/main')} className="flex items-center gap-3 p-3 rounded-lg bg-[#FED800] text-black font-semibold transition-colors">
                                <HomeIcon size={20} />
                                <span>Home</span>
                            </button>
                            <button onClick={()=> router.push('/stakes')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                                <Trophy size={20} />
                                <span>My Bets</span>
                            </button>
                            <button onClick={()=> router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </button>
                            <button onClick={()=> router.push('/profile')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                                <User size={20} />
                                <span>Profile</span>
                            </button>
                        </div>
    
                        <h3 className="text-gray-200 text-lg font-semibold my-4">Quick Links</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleUseInviteLinkButtonClick}
                                className="bg-[#2c3a47] text-gray-200 font-medium px-4 py-2 rounded-lg text-sm shadow-md hover:bg-[#344452] transition-all text-left">
                                🔗 Use Invite Link
                            </button>
                            <button
                                onClick={handleUseInviteLinkButtonClick}
                                className="bg-[#2c3a47] text-gray-200 font-medium px-4 py-2 rounded-lg text-sm shadow-md hover:bg-[#344452] transition-all text-left">
                                📱 Scan QR Code
                            </button>
                        </div>
                    </div>
    
                    {/* Central Content Column (Fixture Cards) */}
                    <div className="px-2 pt-2 pb-24 md:px-0 md:pt-0">
                        {/* Filter Section */}
                        <div className="bg-[#1a2633] rounded-lg p-4 mb-4">
                            {/* Filter Tabs */}
                            <div className="flex gap-6 border-b border-gray-700">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                                            filterState.type === tab.id
                                                ? 'text-[#FED800]'
                                                : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        {tab.name}
                                        {filterState.type === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
    
                            {/* League Selection */}
                            {filterState.type === 'leagues' && (
                                <div className="mt-4 overflow-x-auto">
                                    <div className="flex gap-2 pb-2">
                                        {leagueListData.map((league) => (
                                            <button
                                                key={league.id}
                                                onClick={() => handleLeagueSelect(league.id)}
                                                className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                                    filterState.leagueId === league.id
                                                        ? 'bg-[#FED800] text-black'
                                                        : 'bg-[#23313D] text-gray-300 hover:bg-[#2a3643]'
                                                }`}
                                            >
                                                {league.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
    
                        {/* Fixture Cards Grid */}
                        <div className="md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-4">
                            {filteredFixtures.length > 0 ? (
                                <>
                                    {filteredFixtures.map((match) => (
                                        <div key={match.match_id} className="mb-2 md:mb-0">
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
                                                isMatchLive={match.is_match_live}
                                                scoreString={match.score_string}
                                            />
                                        </div>
                                    ))}
    
                                    {/* Loader for infinite scroll */}
                                    <div
                                        ref={loaderRef}
                                        className="py-8 flex justify-center items-center min-h-[100px] md:col-span-1 lg:col-span-2 xl:col-span-3"
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
                                <div className="flex items-center justify-center h-64 md:col-span-1 lg:col-span-2 xl:col-span-3">
                                    <div className="text-center">
                                        <p className="text-gray-400 text-lg mb-2">No matches found</p>
                                        <p className="text-gray-500 text-sm">
                                            {filterState.type === 'leagues' && filterState.leagueId
                                                ? 'Try selecting a different league'
                                                : 'Try changing your filter'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
    
                    {/* Right Sidebar (hidden on mobile, visible on desktop) */}
                    <div className="hidden md:block bg-[#1a2633] rounded-lg p-4 self-start">
                        <h3 className="text-gray-200 text-lg font-semibold mb-4">Bet Slip</h3>
                        <div className="text-gray-400 text-sm">
                            {/* Placeholder for bet slip content */}
                            Your bet slip is empty. Select a bet to begin.
                        </div>
                        {/* The actual bet slip would be a more complex component */}
                    </div>
                </div>
    
                {/* Footer - FIXED position, mobile only */}
                <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                    <FooterComponent currentPage={currentPage} />
                </div>
            </div>
        )}

export default function HomePage() {
    return (
        <ProtectedRoute>
            <Home />
        </ProtectedRoute>
    )
}