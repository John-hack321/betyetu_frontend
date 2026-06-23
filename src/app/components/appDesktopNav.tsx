'use client'

import { useRouter } from 'next/navigation'
import {
    Home,
    TrendingUp,
    Trophy,
    LayoutDashboard,
    User,
    SquareMenu,
} from 'lucide-react'
import { ReactNode } from 'react'

export type AppNavPage = 'main' | 'markets' | 'public' | 'stakes' | 'dashboard' | 'profile'

interface AppDesktopNavProps {
    activePage: AppNavPage
    className?: string
    children?: ReactNode
}

const NAV_ITEMS: { id: AppNavPage; label: string; href: string; icon: typeof Home }[] = [
    { id: 'main', label: 'Home', href: '/main', icon: Home },
    { id: 'markets', label: 'Markets', href: '/markets', icon: TrendingUp },
    { id: 'public', label: 'Public Stakes', href: '/anonymous_staking', icon: SquareMenu },
    { id: 'stakes', label: 'My Bets', href: '/stakes', icon: Trophy },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', href: '/profile', icon: User },
]

export default function AppDesktopNav({ activePage, className = '', children }: AppDesktopNavProps) {
    const router = useRouter()

    return (
        <div className={`hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit ${className}`}>
            <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
            <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = activePage === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.href)}
                            className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${
                                isActive
                                    ? 'bg-[#FED800] text-black font-semibold'
                                    : 'hover:bg-white/10 text-gray-300'
                            }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </div>
            {children}
        </div>
    )
}
