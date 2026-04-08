'use client'

import { X, LogOut, Link2, QrCode, ArrowDownRight, ArrowUpRight, User, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export interface MenuOverlayProps {
    isOpen: boolean
    onClose: () => void
    onLogoutClick: () => void
    username: string
    accountBalance: number
}

export default function MenuOverlay({
    isOpen,
    onClose,
    onLogoutClick,
    username,
    accountBalance,
}: MenuOverlayProps) {
    const router = useRouter()

    // prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleNavigate = (path: string) => {
        onClose()
        router.push(path)
    }

    const quickLinks = [
        {
            label: 'My Profile',
            icon: <User size={18} />,
            onClick: () => handleNavigate('/profile'),
        },
        {
            label: 'Use Invite Link',
            icon: <Link2 size={18} />,
            onClick: () => handleNavigate('/stakeLinking'),
        },
        {
            label: 'Scan QR Code',
            icon: <QrCode size={18} />,
            onClick: () => handleNavigate('/stakeLinking'),
        },
    ]

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Slide-in Panel */}
            <div
                className={`fixed top-0 left-0 z-50 h-full w-[80%] max-w-[320px] bg-[#16202C] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Close Button */}
                <div className="flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={22} className="text-gray-300" />
                    </button>
                </div>

                {/* User Info Card */}
                <div className="mx-4 mb-6 bg-[#1a2633] rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FED800] to-[#ffd700] flex items-center justify-center shrink-0">
                            <User size={24} className="text-black" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-bold text-base truncate">{username}</p>
                            <p className="text-gray-400 text-xs">Active account</p>
                        </div>
                    </div>
                    <div className="bg-[#23313D] rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-xs mb-0.5">Available Balance</p>
                        <p className="text-[#FED800] font-bold text-lg">
                            KES {accountBalance?.toLocaleString() || '0'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mx-4 mb-6">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
                        Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleNavigate('/profile')}
                            className="flex flex-col items-center gap-2 bg-[#60991A]/20 border border-[#60991A]/30 rounded-xl p-4 hover:bg-[#60991A]/30 transition-colors active:scale-95"
                        >
                            <ArrowDownRight size={22} className="text-[#60991A]" />
                            <span className="text-white text-sm font-semibold">Deposit</span>
                        </button>
                        <button
                            onClick={() => handleNavigate('/profile')}
                            className="flex flex-col items-center gap-2 bg-[#FED800]/10 border border-[#FED800]/20 rounded-xl p-4 hover:bg-[#FED800]/20 transition-colors active:scale-95"
                        >
                            <ArrowUpRight size={22} className="text-[#FED800]" />
                            <span className="text-white text-sm font-semibold">Withdraw</span>
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mx-4 mb-4">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
                        Quick Links
                    </p>
                    <div className="flex flex-col gap-1">
                        {quickLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={link.onClick}
                                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors active:scale-[0.98] group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[#FED800]">{link.icon}</span>
                                    <span className="text-gray-200 text-sm font-medium">{link.label}</span>
                                </div>
                                <ChevronRight
                                    size={16}
                                    className="text-gray-500 group-hover:text-gray-300 transition-colors"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Logout */}
                <div className="mx-4 mb-6">
                    <button
                        onClick={() => {
                            onClose()
                            onLogoutClick()
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-semibold py-3 rounded-xl transition-colors active:scale-95"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}