// src/app/main/page.tsx
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
                return filtered;

            case 'leagues':
                if (filterState.leagueId !== null) {
                    return filtered.filter(match => match.league_id === filterState.leagueId);
                }
                return filtered;

            case 'live':
                return filtered.filter(match => {
                    return true;
                });

            case 'top':
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
            if (page > 1 && !isFetching) {
                try {
                    setIsFetching(true);
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
        <div className="flex flex-col h-screen bg-[#1a2633]">
            {/* Full-width Header - Mobile matches footer color */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 md:shadow-none shadow-lg md:px-6 z-20 border-b md:border-none border-gray-800">
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
    
            {/* Main Content Area - Responsive Grid Layout with proper breakpoints */}
            <div className="flex-1 flex flex-col overflow-hidden lg:grid lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[350px_1fr_350px] lg:gap-6 lg:overflow-hidden lg:px-6 lg:pt-6">
    
                {/* Left Sidebar (hidden on mobile/tablet, visible on large desktop, sticky) */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
                    <div className="flex flex-col gap-2">
                        <button onClick={()=> router.push('/main')} className="flex items-center gap-3 p-3 rounded-lg bg-[#FED800] text-black font-semibold transition-colors">
                            <HomeIcon size={20} />
                            <span className="xl:inline">Home</span>
                        </button>
                        <button onClick={()=> router.push('/stakes')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <Trophy size={20} />
                            <span className="xl:inline">My Bets</span>
                        </button>
                        <button onClick={()=> router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <LayoutDashboard size={20} />
                            <span className="xl:inline">Dashboard</span>
                        </button>
                        <button onClick={()=> router.push('/profile')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <User size={20} />
                            <span className="xl:inline">Profile</span>
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
    
                {/* Central Content Column (Scrollable) */}
                {/* this part holds the main content of the matches => this is the fixture cards and there contents  */}
                <div className="overflow-y-auto pb-24 lg:pb-4 custom-scrollbar lg:pr-4">

                    {/* Sticky Filter Section (Desktop) - Positioned lower and with proper clipping */}
                    <div className="hidden lg:block sticky top-0 bg-[#1a2633] z-10 pb-4 mb-4">
                        <div className="bg-[#1a2633] rounded-lg p-4 border border-gray-700">
                            {/* Filter Tabs */}
                            <div className="flex gap-6 border-b border-gray-700 pb-3">
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
                    </div>
                        
                    {/* Sticky Filter Section (Mobile) */}
                    <div className="sticky top-0 bg-[#0F1419] z-10 p-2 md:hidden">
                        {/* Filter Tabs (Mobile Only) */}
                        <div className="flex gap-6 border-b border-gray-700 bg-[#1a2633] p-2 rounded-t-lg">
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
    
                        {/* League Selection (Mobile Only when Leagues tab is active) */}
                        {filterState.type === 'leagues' && (
                            <div className="overflow-x-auto bg-[#1a2633] p-2 rounded-b-lg">
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
    
                    {/* Fixture Cards List (Two-Column Grid on Desktop with proper spacing) */}
                    <div className="px-2 pt-2 lg:px-0 lg:grid lg:grid-cols-2 lg:gap-4 staggered-grid">
                        {filteredFixtures.length > 0 ? (
                            <>
                                {filteredFixtures.map((match) => (
                                    <div key={match.match_id} className="mb-3 lg:mb-0">
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
                                    className="py-8 flex justify-center items-center min-h-[100px]"
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
    
                {/* Right Sidebar (hidden on mobile/tablet, visible on large desktop, sticky) */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Bet Slip</h3>
                    <div className="text-gray-400 text-sm">
                        Your bet slip is empty. Select a bet to begin.
                    </div>
                </div>
            </div>
    
            {/* Footer - FIXED position, mobile and tablet only */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}

export default function HomePage() {
    return (
        <ProtectedRoute>
            <Home />
        </ProtectedRoute>
    )
}