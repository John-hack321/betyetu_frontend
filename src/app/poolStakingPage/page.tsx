'use client'
import { useEffect, useState } from "react"
import { Trophy} from 'lucide-react'
import { useRouter } from "next/navigation"

import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"

// redux imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector, useDispatch } from "react-redux"
import ProtectedRoute from "../components/protectedRoute" // dont forget to setup this with the component
import { updateCurrentPage } from "../app_state/slices/pageTracking"

export default function PoolStakingPage() {
    const thisPage= "main"
    const router = useRouter()

    // redux data and setup
    const dispatch= useDispatch<AppDispatch>()
    const currentPage = useSelector((state: RootState)=> state.currentPageData.page)
    const userData = useSelector((state: RootState) => state.userData)
    const currentPoolStakeData = useSelector((state: RootState) => state.poolStakingData)
    const [poolStakeAmount, setPoolStakeAmount] = useState<number | null>(null)
    const [stakeInitialized, setStakeInitialized] = useState<boolean>(false)

    // though getting this feels like too much but lets just do it for now
    const poolStakeData = (useSelector((state: RootState) => state.poolMarketData.data)).find((poolStake) => poolStake.id === currentPoolStakeData.poolStakeId)

    useEffect(() => {
        dispatch(updateCurrentPage(thisPage))
    }, [])

    // this is not a must I have just added it to see what happens when I try it on the component
    const workOutPotentialWin = (
        side: "home" | "away" | "draw" | "", // we added the empty string to avoid type errors
        amount: number, 
        homePool: number, 
        drawPool: number, 
        awayPool: number
        ) => {
            switch (side) {
                case "home" :
                    // first get the totoal home that will be expected once the usr joins the stak
                    // we simply add his suggested amount to the relevant pool
                    const updatedHomePool= homePool + amount
                    const h_totalPool = updatedHomePool + awayPool + drawPool // I added the h to avoid name conflicts whe all cases use the same variable name
                    const h_potential = (amount * h_totalPool) / updatedHomePool
                    return h_potential

                case "away":
                    const updatedAwayPool = awayPool + amount
                    const a_totalPool = updatedAwayPool + homePool + drawPool
                    const a_potential = (amount * a_totalPool) / updatedAwayPool
                    return a_potential

                case "draw":
                    const updatedDrawPool = drawPool + amount
                    const d_totalPool = updatedDrawPool + homePool + awayPool
                    const d_potential = (amount * d_totalPool) / updatedDrawPool
                    return d_potential

                default :
                    return 0

                }
            }

    return (
        <div className="flex flex-col h-screen bg-[#1a2633]">
            {/* Header - Constrained width */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 lg:px-6 z-20">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold lg:text-3xl">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all lg:text-base">
                            Deposit
                        </button>
                    </div>
                </div>
            </div>

            {/* the main content area  */}
            <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-6 lg:px-6 lg:pt-6 lg:max-w-[1400px] lg:mx-auto lg:w-full">
            
                 {/* Left Sidebar - Desktop Only - Compact */}
                <div className="hidden lg:block lg:w-[280px] bg-[#16202C] rounded-lg p-6 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="text-[#FED800]" size={20} />
                        Match Info
                    </h3>
                    
                    {/* Match Details Card */}
                    <div className="bg-[#1a2633] rounded-lg p-6 mb-4">
                        <div className="text-center mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <div className="text-white font-bold text-lg mb-2">
                                        {truncateTeamName(currentPoolStakeData.homeTeam, 10)}
                                    </div>
                                    <div className="text-sm text-gray-400">Home</div>
                                </div>
                                <div className="px-4">
                                    <span className="text-[#FED800] font-bold text-2xl">VS</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-lg mb-2">
                                        {truncateTeamName(currentPoolStakeData.awayTeam, 10)}
                                    </div>
                                    <div className="text-sm text-gray-400">Away</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-3">
                        <div className="bg-[#1a2633] rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Balance</span>
                                <span className="text-[#FED800] font-bold text-base">
                                    KES {userData.account_balance?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                        
                        {poolStakeAmount && (
                            <div className="bg-[#1a2633] rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Win</span>
                                    <span className="text-[#60991A] font-semibold text-base">
                                        KES {workOutPotentialWin(currentPoolStakeData.userStakeChoice, poolStakeAmount, poolStakeData!.home_pool, poolStakeData!.draw_pool, poolStakeData!.away_pool)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div> {/* the left side bar ends here */}

                {/* the center content now goes here */}
                {stakeInitialized ? (
                    // this is the success state => contains the best summary and an option to cancel the stake too 
                    <div></div>
                ) : (
                    // betting state
                    <div className="lg:mx-auto mx-4 pt-2 lg:pt-8 lg:max-w-4xl">

                        {/* Page Title - Mobile */}
                        <div className="mb-4 lg:mb-8">
                            {/* Mobile Layout */}
                            <div className="lg:hidden flex flex-col gap-3">
                                <div>
                                <h1 className="text-xl font-bold text-white mb-1">Place Your Bet</h1>
                                <p className="text-gray-400 text-xs">Choose your prediction and amount</p>
                                </div>  
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex items-center justify-start">
                                <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Place Your Bet</h1>
                                <p className="text-gray-400 text-base">Choose your prediction and amount</p>
                                </div>
                            </div>
                        </div>

                        {/* Match Card - Mobile */}
                        <div className="lg:hidden bg-[#1a2633] rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-center">
                                    <div className="text-white font-bold text-sm mb-1">
                                        {truncateTeamName(currentPoolStakeData.homeTeam, 12)}
                                    </div>
                                    <div className="text-xs text-gray-400">Home</div>
                                </div>
                                <div className="px-3">
                                    <span className="text-[#FED800] font-bold text-lg">VS</span>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="text-white font-bold text-sm mb-1">
                                        {truncateTeamName(currentPoolStakeData.awayTeam, 12)}
                                    </div>
                                    <div className="text-xs text-gray-400">Away</div>
                                </div>
                            </div>
                        </div>

                    </div>

                )}

                <div className="hidden lg:block lg:w-[260px] bg-[#16202C] rounded-lg p-6 self-start sticky top-6 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Betting Tips</h3>
                    
                    <div className="space-y-3">
                        <div className="bg-[#1a2633] rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-sm font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Check Form</h4>
                                    <p className="text-gray-400 text-sm">Review recent performance</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-sm font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Bet Responsibly</h4>
                                    <p className="text-gray-400 text-sm">Only stake what you can afford</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2633] rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-black text-sm font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm mb-1">Share Wisely</h4>
                                    <p className="text-gray-400 text-sm">Only with trusted friends</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 pt-6">
                        <h4 className="text-gray-300 text-sm font-semibold mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push('/main')}
                                className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-3 rounded-lg text-sm transition-all text-left"
                            >
                                ← Back to Matches
                            </button>
                            <button
                                onClick={() => router.push('/stakes')}
                                className="w-full bg-[#1a2633] hover:bg-[#23313D] text-gray-300 font-medium px-4 py-3 rounded-lg text-sm transition-all text-left"
                            >
                                View My Bets →
                            </button>
                        </div>
                    </div>
                </div> {/* the right side bar ends here */}

            </div>

            {/* Footer - Mobile Only */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}