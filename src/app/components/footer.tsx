'use client'
import { User , Home , Plus , MenuSquare , LayoutDashboard, Trophy, SquareMenu, TrendingUp} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// trial to setup redux data on a component 
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../app_state/store"

const Icons = [
    {'iconName' : 'profile', ' icon' : <User/>},
    {'iconName' : 'home', ' icon' : <Home/>},
    {'iconName' : 'dashboard', ' icon' : <LayoutDashboard/>},
    {'iconName' : 'bets', ' icon' : <MenuSquare/>},
    {'iconName' : 'plus', ' icon' : <Plus/>},
    {'iconname' : 'squaremenu', 'icon' : <SquareMenu/>},
]



interface FooterProps{
    currentPage: string;
    publicStakeNumber?: number;
}

// TODO => remove publicStakeNumber from parameters list since we are now access the redux store directly form the footer component itself
export default function FooterComponent ({currentPage, publicStakeNumber}: FooterProps) {
    const router= useRouter()

    const handleTrophyButtonClick= ()=> {
        router.push('/stakes')
    }

    const handleDashboardButtonClick= ()=> {
        router.push('/dashboard')
    }

    const handleProfileButtonClick= ()=> {
        router.push('/profile')
    }

    const handleHomeButtonClick= ()=> {
        router.push('/main')
    }

    const handleFloatingButtonClick= ()=> {
        router.push('/anonymous_staking')
    }

    const noOfPublicStakes= useSelector((state: RootState)=> state.allFixturesData.no_of_public_stakes)

    return (
        <div className="flex-none bg-[#1a2633] border-t border-gray-800 px-2 py-2 w-full shadow-2xl">
        <div className="flex items-center justify-around relative">

            {/* the buttons will be rendered differently based on whether the use is on the current page */}
            {currentPage === "main" ? (
                <button
                onClick={()=> router.push('/main')}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Home size={20} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800] font-medium">Home</span>
                </button>
            ) : (
                <button
                onClick={()=> router.push('/main')}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Home size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Home</span>
                </button>
            )}

            {/* trophy button : points to the stakes page */}
            {currentPage === "bets" ? (
            
                <button 
                onClick={()=> {handleTrophyButtonClick()}}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Trophy size={20} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Bets</span>
                </button>
            ) : (
                <button 
                onClick={()=> {handleTrophyButtonClick()}}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Trophy size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Bets</span>
                </button>
            )}
            
            {/* Public button */}
            {currentPage === 'anonymous-staking' ? (
                <button 
                onClick={handleFloatingButtonClick}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors relative">
                    {/* Notification Badge */}
                    <div className="absolute -top-1 -right-1 bg-red-600 min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-[#1a2633] shadow-lg">
                        <p className="text-white text-[10px] font-bold px-1">{noOfPublicStakes}</p>
                    </div>
                    <SquareMenu size={20} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Public</span>
                </button>
            ) : (
                <button
                onClick={handleFloatingButtonClick}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors relative">
                    {/* Notification Badge */}
                    <div className="absolute -top-1 -right-1 bg-red-600 min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-[#1a2633] shadow-lg">
                        <p className="text-white text-[10px] font-bold px-1">{noOfPublicStakes}</p>
                    </div>
                    <SquareMenu size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Public</span>
                </button>
            )}
            
            {/* Markets button */}
            {currentPage === "markets" ? (
                <button 
                onClick={()=> router.push('/markets')}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <TrendingUp size={20} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Markets</span>
                </button>
            ) : (
                <button 
                onClick={()=> router.push('/markets')}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <TrendingUp size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Markets</span>
                </button>
            )}
            
            {currentPage === "dashboard" ? (
                <button
                onClick={()=> router.push('/dashboard')}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <LayoutDashboard size={20} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Board</span>
                </button>
            ) : (
                <button 
                onClick={()=> router.push('/dashboard')}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <LayoutDashboard size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Board</span>
                </button>
            )}
        </div>
    </div>
    )
}

