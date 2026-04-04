'use client'

/**
 * PoolMarketsToggle
 * Drop-in replacement for the inline "pool mkts" toggle button in main/page.tsx
 *
 * Usage:
 *   <PoolMarketsToggle active={showPoolMarkets} onToggle={() => setShowPoolMarkets(v => !v)} />
 */

import { TrendingUp, Zap } from 'lucide-react';

interface PoolMarketsToggleProps {
    active: boolean;
    onToggle: () => void;
    /** Optional: show a pulse badge when there are live pool markets */
    liveCount?: number;
}

export default function PoolMarketsToggle({ active, onToggle, liveCount = 0 }: PoolMarketsToggleProps) {
    return (
        <button
            onClick={onToggle}
            className={`
                relative flex items-center gap-1.5 px-3 py-1 rounded-full
                text-[11px] font-bold tracking-wide uppercase
                border transition-all duration-200 select-none shrink-0 mb-2
                ${active
                    ? 'bg-[#FED800]/15 border-[#FED800]/50 text-[#FED800] shadow-[0_0_10px_rgba(254,216,0,0.2)]'
                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                }
            `}
        >
            {/* Icon swap */}
            {active
                ? <TrendingUp size={11} className="shrink-0" />
                : <TrendingUp size={11} className="shrink-0" />
            }

            <span>Pool</span>

            {/* Live count badge */}
            {liveCount > 0 && (
                <span className="
                    absolute -top-1 -right-1
                    min-w-[16px] h-4 px-1 rounded-full
                    bg-red-500 text-white text-[9px] font-black
                    flex items-center justify-center
                    border-2 border-[#1a2633]
                ">
                    {liveCount > 9 ? '9+' : liveCount}
                </span>
            )}
        </button>
    );
}