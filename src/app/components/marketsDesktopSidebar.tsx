'use client'

import { useRouter } from 'next/navigation'
import {
    Home,
    TrendingUp,
    LayoutDashboard,
    Trophy,
    SquareMenu,
    User,
    BarChart2,
    ArrowLeft,
} from 'lucide-react'

type MarketsSidebarVariant = 'list' | 'detail' | 'positions'

interface MarketsDesktopSidebarProps {
    variant?: MarketsSidebarVariant
    activePage?: 'markets' | 'positions' | 'main'
}

export default function MarketsDesktopSidebar({
    variant = 'list',
    activePage = 'markets',
}: MarketsDesktopSidebarProps) {
    const router = useRouter()

    const navItems = [
        { id: 'main', label: 'Home', icon: Home, href: '/main' },
        { id: 'public', label: 'Public Stakes', icon: SquareMenu, href: '/anonymous_staking' },
        { id: 'markets', label: 'Markets', icon: TrendingUp, href: '/markets' },
        { id: 'positions', label: 'My Positions', icon: BarChart2, href: '/markets/posititions' },
        { id: 'dashboard', label: 'Board', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'bets', label: 'My Bets', icon: Trophy, href: '/stakes' },
        { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    ] as const

    return (
        <div className="hidden lg:flex flex-col gap-4 self-start sticky top-6">
            {variant === 'detail' && (
                <div className="bg-[#131e28] rounded-2xl border border-white/5 p-4 w-full">
                    <button
                        onClick={() => router.push('/markets')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors w-full p-2 rounded-lg hover:bg-white/5"
                    >
                        <ArrowLeft size={16} />
                        Back to Markets
                    </button>
                </div>
            )}

            <div className="bg-[#131e28] rounded-2xl border border-white/5 p-4 w-full min-w-[240px]">
                <h3 className="text-gray-300 text-sm font-bold mb-3">Navigation</h3>
                <div className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive =
                            (item.id === 'markets' && activePage === 'markets') ||
                            (item.id === 'positions' && activePage === 'positions') ||
                            (item.id === 'main' && activePage === 'main')

                        return (
                            <button
                                key={item.id}
                                onClick={() => router.push(item.href)}
                                className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-[#FED800] text-black'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {variant === 'list' && (
                <div className="bg-[#131e28] rounded-2xl border border-white/5 p-4 w-full">
                    <h3 className="text-gray-300 text-sm font-bold mb-3">Trending</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                        Prediction markets on Kenyan politics, football, and current events — trade shares like Polymarket.
                    </p>
                </div>
            )}
        </div>
    )
}
