'use client'
import { User , Home , Plus , MenuSquare , LayoutDashboard, Trophy} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Icons = [
    {'iconName' : 'profile', ' icon' : <User/>},
    {'iconName' : 'home', ' icon' : <Home/>},
    {'iconName' : 'dashboard', ' icon' : <LayoutDashboard/>},
    {'iconName' : 'bets', ' icon' : <MenuSquare/>},
    {'iconName' : 'plus', ' icon' : <Plus/>},
]



interface FooterProps{
    currentPage: string;
}

export default function FooterComponent ({currentPage}: FooterProps) {
    const router= useRouter()

    const handleTrophyButtonClick= ()=> {
        router.push('/dashboard')
    }

    return (
        <div className="flex-none bg-[#1a2633] border-t border-gray-800 px-2 py-3 shadow-2xl">
        <div className="flex items-center justify-around relative">

            {/* the buttons will be rendered differently based on whether the use is on the current page */}
            {currentPage === "home" ? (
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Home size={24} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800] font-medium">Home</span>
                </button>
            ) : (
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Home size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Home</span>
                </button>
            )}

            {currentPage === "bets" ? (
               
                <button 
                onClick={()=> {handleTrophyButtonClick()}}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Trophy size={24} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Bets</span>
                </button>
            ) : (
                <button 
                onClick={()=> {handleTrophyButtonClick()}}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Trophy size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Bets</span>
                </button>
            )}
            
            {/* Floating Action Button */}
            <button className="bg-[#FED800] p-4 rounded-full shadow-2xl -mt-8 hover:bg-[#ffd700] transition-all transform hover:scale-110">
                <Plus size={28} className="text-black" strokeWidth={3} />
            </button>
            
            {currentPage === "dashboard" ? (
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <LayoutDashboard size={24} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Dashboard</span>
                </button>
            ) : (
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <LayoutDashboard size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Dashboard</span>
                </button>
            )}
            
            {currentPage === "profile" ? (
               
               <button 
                    onClick={() => router.push('/profile')}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <User size={24} className="text-[#FED800]" />
                    <span className="text-xs text-[#FED800]">Profile</span>
                </button>
            ) : (
                <button 
                    onClick={() => router.push('/profile')}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <User size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Profile</span>
                </button>
            )}
        </div>
    </div>
    )
}

