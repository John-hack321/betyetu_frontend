import { Trophy, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { formatMatchDate } from '@/utils/dateUtils';

interface PublicStakeCardProps {
    stakeId: number;
    date: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    creatorUsername: string;
    creatorPlacement: string; // "home", "away", or "draw"
    stakeAmount: number;
    potentialWin: number;
    onHomeClick?: () => void;
    onDrawClick?: () => void;
    onAwayClick?: () => void;
    onJoinClick?: () => void;
    selectedPlacement: string | null; // "home", "away", "draw", or null
}

export default function PublicStakeCard({
    stakeId,
    date,
    league,
    homeTeam,
    awayTeam,
    creatorUsername,
    creatorPlacement,
    stakeAmount,
    potentialWin,
    onHomeClick,
    onDrawClick,
    onAwayClick,
    onJoinClick,
    selectedPlacement
}: PublicStakeCardProps) {

    const [expanded, setExpanded] = useState(false);

    const truncateTeamName = (name: string, maxLength: number = 12) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 2) + '..';
    };

    // Check if a button should be disabled (opponent already selected it)
    const isButtonDisabled = (placement: string) => {
        if (creatorPlacement === 'home' && placement === 'home') return true;
        if (creatorPlacement === 'away' && placement === 'away') return true;
        if (creatorPlacement === 'draw' && placement === 'draw') return true;
        return false;
    };

    return (
        <div className='bg-[#16202C] rounded-lg p-3 shadow-md border border-gray-700 hover:border-gray-600 transition-all'>
            {/* Compact Header */}
            <div className='flex items-center justify-between mb-2 pb-2 border-b border-gray-600'>
                <span className="text-xs text-gray-400 font-medium">{league}</span>
                <span className='text-xs text-gray-300'>{formatMatchDate(date)}</span>
            </div>

            {/* Main Content - Teams and Buttons */}
            <div className="flex items-center justify-between gap-2">
                {/* Teams Section */}
                <div className="flex-1 min-w-0">
                    {/* Home Team */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                            H
                        </div>
                        <span className="text-sm text-gray-100 font-medium truncate">
                            {truncateTeamName(homeTeam)}
                        </span>
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                            A
                        </div>
                        <span className="text-sm text-gray-100 font-medium truncate">
                            {truncateTeamName(awayTeam)}
                        </span>
                    </div>
                </div>

                {/* Betting Buttons */}
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={onHomeClick}
                        disabled={isButtonDisabled('home')}
                        className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 ${
                            isButtonDisabled('home')
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                : selectedPlacement === 'home'
                                    ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                    : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                        }`}
                    >
                        1
                    </button>

                    <button
                        onClick={onDrawClick}
                        disabled={isButtonDisabled('draw')}
                        className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 ${
                            isButtonDisabled('draw')
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                : selectedPlacement === 'draw'
                                    ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                    : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                        }`}
                    >
                        X
                    </button>

                    <button
                        onClick={onAwayClick}
                        disabled={isButtonDisabled('away')}
                        className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 ${
                            isButtonDisabled('away')
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                : selectedPlacement === 'away'
                                    ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                    : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                        }`}
                    >
                        2
                    </button>
                </div>
            </div>

            {/* Quick Info Row - Always Visible */}
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-700">
                <span className="text-gray-400">
                    By: <span className="text-white font-semibold capitalize">{creatorUsername}</span>
                </span>
                <span className="text-gray-400">
                    Stake: <span className="text-[#FED800] font-semibold">KES {stakeAmount}</span>
                </span>
            </div>

            {/* Expandable Details - Mobile only */}
            {expanded && (
                <div className="mt-3 pt-3 border-t border-gray-600 lg:hidden animate-in slide-in-from-top-2">
                    <div className="bg-[#1a2633] rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Creator picked:</span>
                            <span className="text-sm font-semibold text-[#FED800] capitalize">
                                {creatorPlacement}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Potential Win:</span>
                            <span className="text-sm font-bold text-[#60991A]">
                                KES {potentialWin.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Details - Always visible on large screens */}
            <div className="hidden lg:block mt-3 pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#FED800]" />
                        <span className="text-gray-400">
                            <span className="text-white font-semibold">{creatorUsername}</span> picked{' '}
                            <span className="text-[#FED800] capitalize">{creatorPlacement}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-[#60991A]" />
                        <span className="text-gray-400">
                            Win: <span className="text-[#60991A] font-bold">KES {potentialWin.toLocaleString()}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
                {/* Expand/Collapse Button - Mobile only */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="lg:hidden flex-1 bg-[#1a2633] hover:bg-[#23313D] text-gray-300 py-2 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                    {expanded ? (
                        <>
                            Less <ChevronUp size={14} />
                        </>
                    ) : (
                        <>
                            More <ChevronDown size={14} />
                        </>
                    )}
                </button>

                {/* Join Button - Shows when placement selected */}
                {selectedPlacement && (
                    <button
                        onClick={onJoinClick}
                        className="flex-1 bg-[#60991A] hover:bg-[#4d7a15] text-black font-bold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                    >
                        <Users size={16} />
                        Join
                    </button>
                )}
            </div>
        </div>
    );
}