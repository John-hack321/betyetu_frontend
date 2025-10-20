'use client'
import { useEffect, useState } from "react"
import Navigation from "../components/navigation"
import { fetchAllFixtures } from "../api/matches"
import FixtureCard from "../components/fixtureCard"
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import ProtectedRoute from "../components/protectedRoute"

// schema imports
import { Fixture } from "../apiSchemas/matcheSchemas"
import { MatchIdAndPlacement } from "../apiSchemas/stakingSchemas"

// redux setup imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { updateUserDataAsync } from "../app_state/slices/userData"
import { updateAllFixturesData } from "../app_state/slices/matchData"
import { CurrentStakeData } from "../apiSchemas/stakingSchemas"
import { updateMatchIdAndPlacement } from "../app_state/slices/stakingData"


function Dashboard(){

    // redux setup
    const userData = useSelector((state: RootState) => state.userData)
    const matchData = useSelector((state : RootState) => state.allFixturesData)
    const dispatch = useDispatch<AppDispatch>()

    // utility functions for different parts of the code functions
    const updateStakeDataWithMatchIdAndPlacement = (stakeMatchId: number, stakeChoice: string) => {
        const data : MatchIdAndPlacement = {
            matchId : stakeMatchId,
            placement : stakeChoice,
        }
        dispatch(updateMatchIdAndPlacement(data))
    }

    // onClick handlers for the staking button on the fixture card
    const handleHomeButtonClick= (stakeMatchId: number, stakeChoice: string) => {
        /**
         * set other stake buttons states to false
         * set home button to clicked
         * update the stakeData slice with the matchId and the placemnt (stakeChoice)
         */
        setDrawButtonClicked(false);
        setAwayButtonClicked(false);
        if (homeButtonClicked && (stakeChoice === clickedChoice)) {
            console.log(`now running the true && true part , values before for homeclicked and clickedchoice are : ${homeButtonClicked} and stakechoice is ${clickedChoice}`)
            setHomeButtonClicked(false);
            setClickedChoice('')
            console.log(`the valuse after doing the settings on click are : ${homeButtonClicked} and choice is marked as ${clickedChoice}`)
        }
        {/*
        if (!homeButtonClicked && (stakeChoice != clickedChoice)) {
            console.log(`now running the false && false part , values before for homeclicked and clickedchoice are : ${homeButtonClicked} and stakechoice is ${clickedChoice}`)
            setHomeButtonClicked(true);
            console.log(`the valuse after doing the settings on click are : ${homeButtonClicked} and choice is marked as ${clickedChoice}`)

        }
    */}
        if (!homeButtonClicked) {
            console.log(`now running the !homebuttonclicked , values before for homeclicked and clickedchoice are : ${homeButtonClicked} and stakechoice is ${clickedChoice}`)
            setHomeButtonClicked(true)
            console.log(`the valuse after doing the settings on click are : ${homeButtonClicked} and choice is marked as ${clickedChoice}`)

        }
        updateStakeDataWithMatchIdAndPlacement(stakeMatchId, stakeChoice);
        setClickedMatchId(stakeMatchId)
    }

    const handleAwayButtonClick= (stakeMatchId: number, stakeChoice: string) => {
        setHomeButtonClicked(false);
        setDrawButtonClicked(false);
        setAwayButtonClicked(!awayButtonClicked);
        updateStakeDataWithMatchIdAndPlacement(stakeMatchId, stakeChoice);
    }

    const handleDrawButtonClick= (stakeMatchId: number, stakeChoice: string= "draw") => {
        setHomeButtonClicked(false);
        setAwayButtonClicked(false);
        setDrawButtonClicked(!drawButtonClicked);
        updateStakeDataWithMatchIdAndPlacement(stakeMatchId, stakeChoice);
    }
    

    // STAKING STATE USESTATE HANDLERS
    // useState state handlers for the staking buttons { home, draw and away}
    const [homeButtonClicked , setHomeButtonClicked] = useState(false);
    const [awayButtonClicked , setAwayButtonClicked] = useState(false);
    const [drawButtonClicked , setDrawButtonClicked] = useState(false);
    const [clickedMatchId , setClickedMatchId] = useState<number>(0);
    const [clickedChoice , setClickedChoice] = useState<string>("");

    const [matchesListData , setMatchesListData] = useState<Fixture[]>([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState<string | null>(null)

    useEffect(() => {

        const loadFixturesData = async () => {
            try {
                console.log('Fetching fixtures...');
                const fixturesObject = await fetchAllFixtures();
                console.log('Fixtures data:', fixturesObject);
                if (fixturesObject) { 
                    const fixturesList = fixturesObject.data
                    setMatchesListData(fixturesList); // local state match saving
                    dispatch(updateAllFixturesData(fixturesObject)) // global state match saving with redux
                }
            } catch(err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : "Failed to load fixtures data");
            } finally {
                setLoading(false);
            }
        };

        const loadUserData = async () => {
            dispatch(updateUserDataAsync())
        }
        loadFixturesData();
        loadUserData();
    }, [])

    {/* the loading component */}
    if (loading) {
        return (
            <div className = "min-h-screen bg-gray-50 itmes-center flex justify-center">
                <h3 className = 'text-black text-sm'>loading...</h3>
            </div>
        )
    }

    {/* in case an error occurs */}
    if (error) {
        return (
            <div className = "bg-gray-50 min-h-screen flext items-center justify-center">
                <div className = "rounded-lg text-center bg-white flex flex-col">
                    <h2>Failed to load data</h2>
                    <p className = "text-sm text-red-600"></p>
                    <button 
                    onClick={() => window.location.reload()}
                    className="text-center text-black bg-gray-300 hover:bg-gray-900 hover:text-white rounded-lg p-4">reload</button>
                </div>
            </div>
        )
    }                <h3 className = 'text-black text-sm'>loading...</h3>



    if (!matchesListData) {
        return (
            <div className = "bg-gray-50 min-h-screen flex items-center justify-center ">
                <div className = "rounded-lg shadow-sm max-w-md text-center p-6">
                    <p className = "text-black">user data not found</p>
                    <button 
                    onClick={() => window.location.reload()}
                    className= "text-black px-3 py-2 bg-gray-400 rounded-lg shadow-sm font-bold hover:bg-gray-300">reload</button>
                </div>
            </div>
        )
    }
        
    const handleUseInviteButtonClick = () => {
        console.log(`the UseInviteLink button has been clicked`)
    }

    const handleQRCodeButtonClick = () => {
         console.log(`the handleQRCodeButton has been clicked`)
    }

    return (
        <div className="flex flex-col h-screen bg-background-blue">
            {/* Fixed header section */}
            <div className="flex-none">
                <HeaderComponent/>
                
                {/* Invite options */}
                <div className="flex gap-1 pb-2 mt-2">
                    <button
                        onClick={handleUseInviteButtonClick}
                        className="text-black px-3 py-1 text-center rounded-full bg-green-components shadow-sm my-2 mx-2"
                    >
                        use invite link
                    </button>
                    <button
                        onClick={handleQRCodeButtonClick}
                        className="text-black px-3 py-1 text-center rounded-full bg-green-components shadow-sm my-2 mx-2"
                    >
                        scan QRcode
                    </button>
                </div>

                {/* Navigation tabs */}
                <div className="flex gap-4 px-3 pt-3 pb-1 ">
                    <h3 className="text-sm text-gray-100">Leagues</h3>
                    <h3 className="text-sm text-gray-100">Games</h3>
                    <h3 className="text-sm text-gray-100">Live</h3>
                    <h3 className="text-sm text-gray-100">Filter</h3>
                    <h3 className='text-sm text-gray-100'>Top</h3>
                </div>
            </div>

            {/* Scrollable games section */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <p className="text-white text-center py-4">Loading matches...</p>
                ) : error ? (
                    <p className="text-red-500 text-center py-4">Error: {error}</p>
                ) : matchData.data && matchData.data.length > 0 ? (
                    <div className="pb-16"> {/* Extra padding at bottom for fixed footer */}
                        {matchData.data.map((match) => (
                            <div key={match.match_id} className="m-2">
                                <FixtureCard
                                    keyId={match.match_id}
                                    clickedFixtureId={clickedMatchId}
                                    league={match.league_name}
                                    matchTime={match.match_date}
                                    homeTeam={match.home_team}
                                    awayTeam={match.away_team}
                                    onClickHomeButton={() => {handleHomeButtonClick(match.match_id, match.home_team)}}
                                    onClickAwayButton={() => {handleAwayButtonClick(match.match_id, match.away_team)}}
                                    onClickDrawButton={() => {handleDrawButtonClick(match.match_id)}}
                                    homeButtonClicked={homeButtonClicked}
                                    awayButtonClicked={awayButtonClicked}
                                    drawButtonClicked={drawButtonClicked}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-white text-center py-4">No matches available</p>
                )}
            </div>

            {/* Fixed footer */}
            <div className="bottom-0 flex mb-0 fixed items-center justify-center py-2 w-full bg-background-blue">
                <FooterComponent/>
            </div>
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