'use client'
import { useEffect, useState } from "react"
import { Trophy} from 'lucide-react'


import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"

// redux imports
import { AppDispatch, RootState } from "../app_state/store"
import { useSelector, useDispatch } from "react-redux"
import ProtectedRoute from "../components/protectedRoute" // dont forget to setup this with the component
import { updateCurrentPage } from "../app_state/slices/pageTracking"

export default function PoolStakingPage() {
    const thisPage= "main"

    // redux data and setup
    const dispatch= useDispatch<AppDispatch>()
    const currentPage = useSelector((state: RootState)=> state.currentPageData.page)
    const userData = useSelector((state: RootState) => state.userData)
    const currentPoolStakeData = useSelector((state: RootState) => state.poolStakingData)
    const [poolStakeAmount, setPoolStakeAmount] = useState<number | null>(null)
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

            <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-3 lg:px-3 lg:pt-3 lg:max-w-[1400px] lg:mx-auto lg:w-full">

                 {/* Left Sidebar - Desktop Only - Compact */}
                <div className="hidden lg:block lg:w-[200px] bg-[#16202C] rounded-lg p-3 self-start sticky top-3 h-fit flex-shrink-0">
                    <h3 className="text-gray-200 text-sm font-semibold mb-3 flex items-center gap-2">
                        <Trophy className="text-[#FED800]" size={16} />
                        Match Info
                    </h3>
                    
                    {/* Match Details Card */}
                    <div className="bg-[#1a2633] rounded-lg p-3 mb-3">
                        <div className="text-center mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm mb-1">
                                        {truncateTeamName(currentPoolStakeData.homeTeam, 10)}
                                    </div>
                                    <div className="text-xs text-gray-400">Home</div>
                                </div>
                                <div className="px-2">
                                    <span className="text-[#FED800] font-bold text-lg">VS</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm mb-1">
                                        {truncateTeamName(currentPoolStakeData.awayTeam, 10)}
                                    </div>
                                    <div className="text-xs text-gray-400">Away</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-2">
                        <div className="bg-[#1a2633] rounded-lg p-2">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-xs">Balance</span>
                                <span className="text-[#FED800] font-bold text-xs">
                                    KES {userData.account_balance?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                        
                        {poolStakeAmount && (
                            <div className="bg-[#1a2633] rounded-lg p-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Win</span>
                                    <span className="text-[#60991A] font-semibold text-xs">
                                        {/* for this one potential win the the calculation with the actual stake data in the system but I dont see any reason for showing it here though */}
                                        KES {workOutPotentialWin(currentPoolStakeData.userStakeChoice, poolStakeAmount, poolStakeData!.home_pool, poolStakeData!.draw_pool, poolStakeData!.away_pool )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div> {/** left side bar ends here */}


            </div>

            {/* Footer - Mobile Only */}
            <div className="flex-none lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}