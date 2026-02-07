'use client'
import { User, Plus, Trophy, Target, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, LogOut, Edit, Home as HomeIcon, LayoutDashboard, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import FooterComponent from '../components/footer';
import PublicStakeCard from '../components/publicStakeCard';

// Redux setup imports
import { AppDispatch, RootState } from '../app_state/store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateCurrentPage } from '../app_state/slices/pageTracking';
import { updatePublicStakesData, appendPublicStakesData, setLoadingState } from '../app_state/slices/publicStakesData';
import { guestSetCurrentStakeDataWhenJoiningPublicStake } from '../app_state/slices/stakingData';
import { resetCurrentStakeData } from '../app_state/slices/stakingData';
import { setIsJoiningPublicStake } from '../app_state/slices/stakingData';

import { CurrentStakeData, FetchPublicStakesApiResponseInterface } from '../apiSchemas/stakingSchemas';
import { fetchPublicStakes } from '../api/stakes';



export default function AnonymousStakingPage () {

    // redux data setup here
    const currentPage = useSelector((state: RootState) => state.currentPageData.page)
    const publicStakes: FetchPublicStakesApiResponseInterface = useSelector((state: RootState) => state.publicStakesData)
    const dispatch = useDispatch<AppDispatch>()
    const currentStakeData = useSelector((state: RootState)=> state.currentStakeData)
    const userData= useSelector((state: RootState)=> state.userData)

    const router = useRouter()

    // Infinite scroll state
    const loaderRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<number>(1);
    const [isFetching, setIsFetching] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const handleUseInviteLinkButtonClick = () => {
        router.push('/stakeLinking')
    }

    const handleStakeButtonClick= ()=> {
        router.push('/main')
    }

    /**
     * 
     * @param stakeId 
     * @param option 
     * @param homeTeam 
     * @param awayTeam 
     * @param teamName 
     * 
     * the mechanism and its data types below is just for determining what button as been clicked and actring accordingly just like in the main page
     */

    const [selectedStakeId, setSelectedStakeId] = useState<number | null>(null)
    const [selectedOption, setSelectedOption]= useState<string | null>(null)

    const handleOptionClick= (
        stakeId: number,
        matchId: number,
        option: string,
        homeTeam: string , 
        awayTeam: string , 
        ownerStakeAmount: number,
        ownerStakeplacement: string,
    )=> {
        if (stakeId == selectedStakeId && option == selectedOption) {
            setSelectedOption(null)
            setSelectedStakeId(null)
            dispatch(resetCurrentStakeData())

        }
        else {
            setSelectedOption(option)
            setSelectedStakeId(stakeId)
            // we will do the data update here so that when we click on place bet all it does is to push us to push the user to the stake linking page 
            const data: CurrentStakeData = {
                stakeId: stakeId,
                matchId: matchId,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                ownerStakeAmount: ownerStakeAmount,
                ownerStakeplacement: ownerStakeplacement,
                guestStakeAmount: ownerStakeAmount,
                guestStakePlacement: option,
            }

            dispatch(guestSetCurrentStakeDataWhenJoiningPublicStake(data))
            // after setting the data the next stop is to now push the user to the stake linking page specifcaly the confirmation part 
        }
    }

    const handleOnClickStakeButton = () => {
        console.log('the place bet button has been clicked')
        
        // Set the flag BEFORE navigation so the stakeLinking page knows we're joining a public stake
        dispatch(setIsJoiningPublicStake(true))
        
        router.push('/stakeLinking')
    }

    // ─── Page tracking ──────────────────────────────────────────────
    useEffect(() => {
        dispatch(updateCurrentPage('anonymous-staking'))
    }, [dispatch])

    // Initial data load (page 1) 
    useEffect(() => {
        const loadPublicStakesData = async () => {
            try {
                const publicStakesData: FetchPublicStakesApiResponseInterface | null = await fetchPublicStakes(1, 100)

                if (!publicStakesData) {
                    throw new Error(`data sent back from the api is not defined`)
                }

                dispatch(updatePublicStakesData(publicStakesData))
            } catch (error) {
                console.error(`an error occurred while loading public stakes data`)
            } finally {
                setInitialLoading(false)
            }
        }

        loadPublicStakesData()
    }, [dispatch])

    // IntersectionObserver – triggers page increment 
    useEffect(() => {
        const currentLoader = loaderRef.current;
        if (!currentLoader) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && publicStakes.has_next_page && !isFetching) {
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
    }, [publicStakes.has_next_page, isFetching, publicStakes.data?.length])

    // Fetch next page when `page` changes 
    useEffect(() => {
        const fetchMoreData = async () => {
            if (page > 1 && !isFetching) {
                try {
                    setIsFetching(true);
                    dispatch(setLoadingState());

                    const moreData: FetchPublicStakesApiResponseInterface | null = await fetchPublicStakes(page, 100);

                    if (moreData) {
                        dispatch(appendPublicStakesData(moreData));
                    }
                } catch (err) {
                    console.error('Error fetching more public stakes:', err);
                } finally {
                    setIsFetching(false);
                    dispatch(setLoadingState());
                }
            }
        };

        fetchMoreData();
    }, [page, dispatch]);

    // ─── Loading screen ─────────────────────────────────────────────
    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a2633]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
                    <p className="text-gray-400 text-sm">Loading stakes...</p>
                </div>
            </div>
        )
    }

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-[#1a2633]">

            {/* ── Header ──────────────────────────────────────────── */}
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

            {/* ── Main content area ───────────────────────────────── */}
            {/* Desktop: 3-col grid that grows/shrinks with viewport  */}
            {/* Mobile:  single scrollable column with sticky hero    */}
            <div className="flex-1 flex flex-col overflow-hidden lg:grid lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[350px_1fr_350px] lg:gap-6 lg:overflow-hidden lg:px-6 lg:pt-6">

                {/* ── Left Sidebar (desktop only, sticky) ─────────── */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => router.push('/main')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <HomeIcon size={20} />
                            <span>Home</span>
                        </button>
                        <button onClick={() => router.push('/stakes')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <Trophy size={20} />
                            <span>My Bets</span>
                        </button>
                        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>
                        <button onClick={() => router.push('/profile')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
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

                {/* ── Central content column (scrollable) ──────────── */}
                <div className="overflow-y-auto pb-24 lg:pb-4 custom-scrollbar lg:pr-4">

                    {/* ── Mobile hero – sticky so stakes scroll over it ── */}
                    {/* The hero sits in a sticky container. Its height is fixed
                        so that the scrolling stake cards slide up and visually
                        cover it as you scroll down.                           */}
                    <div className="lg:hidden sticky top-0 z-0">
                        {/* Fixed-height wrapper – cards will scroll past this */}
                        <div className="relative w-full" style={{ height: '220px' }}>
                            {/* Background image */}
                            <img
                                src="/laliga.png"
                                alt="Football stadium with crowd"
                                className="absolute inset-0 w-full  object-cover brightness-75" 
                            />
                            {/* Dark overlay */}
                            <div className="absolute h-40px inset-0  bg-black/50"></div>

                            {/* Text content – positioned over the image */}
                            <div className="relative z-10 px-5 pt-6 pb-4 flex flex-col justify-between h-full">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white drop-shadow-lg leading-tight">
                                        <span className="text-[#FED800]">Stake</span> against<br />
                                        millions  of people <span className="text-[#FED800]">anonymously</span>
                                    </h2>
                                </div>
                                <div className='flex flex-row justify-end pl-8 '>
                                    {/* <p className='text-lg'>wanna create a public stake ? </p> */}
                                    <button
                                    onClick={handleStakeButtonClick}
                                    className='px-6 py-2 text-black bg-green-components font-bold rounded-full justify-end'
                                    >Stake</button>
                                </div>
                                <p className="text-gray-100 font-bold text-sm mt-auto">
                                    Test your predictions against the world
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop hero (inside the central column) ────── */}
                    {/** For now I dont think we need this hero part on the desktop , this is only available to mobile users : changes may be made in the future
                    <div className="hidden lg:block mb-5">
                        <div className="relative w-full rounded-lg overflow-hidden" style={{ height: '200px' }}>
                            <img
                                src="/laliga.png"
                                alt="Football stadium with crowd"
                                className="absolute inset-0 w-full h-full object-cover brightness-75"
                            />
                            <div className="absolute inset-0 bg-black/50"></div>
                            <div className="relative z-10 px-6 pt-6 pb-5 flex flex-col justify-between h-full">
                                <h2 className="text-3xl xl:text-4xl font-extrabold text-white drop-shadow-lg">
                                    <span className="text-[#FED800]">Stake</span> against millions of people{' '}
                                    <span className="text-[#FED800]">anonymously</span>
                                </h2>
                                <p className="text-gray-200 text-base">
                                    Join the action and test your predictions against the world
                                </p>
                            </div>
                        </div>
                    </div>
                     */}

                    {/* ── Stake cards list ────────────────────────────── */}
                    {/* On mobile: negative top margin pulls cards up so they
                        overlap and scroll over the sticky hero.            */}
                    <div className="relative z-10  lg:mt-0 px-1 lg:px-0 lg:grid lg:grid-cols-2 lg:gap-4 staggered-grid">
                        {publicStakes.data.length > 0 ? (
                            <>
                                {publicStakes.data.map((stake) => (
                                    <div
                                        key={stake.stakeId}
                                        className="mb-1 lg:mb-0 bg-[#1a2633] rounded-lg"
                                    >
                                        {userData.username !== stake.ownerDisplayName && (
                                            <PublicStakeCard
                                            stakeId={stake.stakeId}
                                            date={stake.date}
                                            league="generic"
                                            homeTeam={stake.homeTeam}
                                            awayTeam={stake.awayTeam}
                                            creatorUsername={stake.ownerDisplayName}
                                            creatorPlacement={stake.ownerPlacement}
                                            stakeAmount={stake.ownerStakeAmount}
                                            potentialWin= {2} // {stake.potentialWin}
                                            onHomeClick={()=> {handleOptionClick(stake.stakeId, stake.matchId, stake.homeTeam, stake.homeTeam, stake.awayTeam, stake.ownerStakeAmount, stake.ownerPlacement)}}
                                            onAwayClick={() => {handleOptionClick(stake.stakeId, stake.matchId, stake.awayTeam, stake.homeTeam, stake.awayTeam, stake.ownerStakeAmount,stake.ownerPlacement)}}
                                            onDrawClick={()=> {handleOptionClick(stake.stakeId, stake.matchId, "draw", stake.homeTeam, stake.awayTeam, stake.ownerStakeAmount,stake.ownerPlacement)}}
                                            onClickStakeButton={()=> {handleOnClickStakeButton()}}
                                            homeButtonClicked= {selectedStakeId == stake.stakeId && selectedOption == stake.homeTeam}
                                            awayButtonclicked= {selectedStakeId == stake.stakeId && selectedOption == stake.awayTeam}
                                            drawButtonClicked= {selectedStakeId == stake.stakeId && selectedOption == "draw" }
                                            selectedPlacement={stake.guestPlacement}
                                        />
                                        )}
                                    </div>
                                ))}

                                {/* ── Infinite-scroll sentinel ────────────── */}
                                <div
                                    ref={loaderRef}
                                    className="col-span-2 py-8 flex justify-center items-center min-h-[100px]"
                                    style={{ marginBottom: '80px' }}
                                >
                                    {isFetching ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FED800]"></div>
                                            <p className="text-gray-400 text-xs">Loading more...</p>
                                        </div>
                                    ) : publicStakes.has_next_page ? (
                                        <p className="text-gray-500 text-xs">↓ Scroll for more ↓</p>
                                    ) : (
                                        <p className="text-gray-400 text-sm">✓ All stakes loaded</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="col-span-2 flex items-center justify-center h-64">
                                <div className="text-center">
                                    <p className="text-gray-400 text-lg mb-2">No public stakes yet</p>
                                    <p className="text-gray-500 text-sm">Check back soon or create one yourself</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Sidebar (desktop only, sticky) ─────────── */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Bet Slip</h3>
                    <div className="text-gray-400 text-sm">
                        Your bet slip is empty. Select a bet to begin.
                    </div>
                </div>

            </div>

            {/* ── Bottom navbar (mobile only) ─────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>

        </div>
    )
}