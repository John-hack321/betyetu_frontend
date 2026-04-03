'use client'
import { truncateTeamName } from "./fixtureCard";

export interface PoolStakeCardProps {
    keyId: number;
    clickedStakeId: number;
    league: string;
    matchTime: string;
    homeTeam: string;
    awayTeam: string;
    onClickHomeButton: () => void;
    onClickAwayButton: () => void;
    onClickDrawButton: () => void;
    onClickStakeButton: () => void;
    homeButtonClicked: boolean;
    awayButtonClicked: boolean;
    drawButtonClicked: boolean;
    isMatchLive: boolean;
    scoreString: string;
    home_pool: number;
    away_pool: number;
    draw_pool: number;
}

export default function PoolStakeCard ({keyId,
    clickedStakeId,
    league,
    matchTime,
    homeTeam,
    awayTeam,
    onClickHomeButton,
    onClickAwayButton,
    onClickDrawButton,
    onClickStakeButton,
    homeButtonClicked,
    awayButtonClicked,
    drawButtonClicked,
    isMatchLive,
    scoreString,
    home_pool,
    away_pool,
    draw_pool,
}: PoolStakeCardProps) {

    const total_pool = home_pool + away_pool + draw_pool;
    
    const findPoolPercentage = (pool: number, pool_type: string) => {
        switch (pool_type) {
            case 'hoem':
                return (pool / total_pool) * 100;
            case 'away':
                return (pool / total_pool) * 100;
            case 'draw':
                return (pool / total_pool) * 100;
            default:
                return 0;
        }
    }

    return (
        <div className='bg-background-blue rounded-lg p-3 shadow-md border border-gray-700'>
            {/* League and Time Header */}
            <div className='flex items-center justify-between mb-2 pb-2 border-b border-gray-600'>
                <span className="text-xs text-gray-400 font-medium">{league}</span>
                <span className='text-xs text-gray-300'>{matchTime}</span>
            </div>

            {/* main match content area */}
            <div>
                
                {/* we need to redesing this live indicator for poolstakes to match that of like pred mkts and I dont thik if we need to show the score string maybe but I will use claude to reason on the best step here */}
                {isMatchLive && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent rounded-lg p-2 border border-red-500/20">
                            {/* Animated LIVE badge */}
                            <div className="flex items-center gap-2 bg-red-500 rounded-md px-2.5 py-1 shadow-lg">
                                <div className="relative flex items-center">
                                    {/* Pulsing dot animation */}
                                    <div className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
                                    <div className="relative w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
                            </div>
                            
                            {/* Score Display */}
                            <div className="bg-red-500/20 px-3 py-1 rounded-md">
                                <span className="text-red-400 text-lg font-bold animate-pulse">
                                    {scoreString}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                

                {/* Main Betting Area */}
                <div className="flex items-center justify-between gap-2">

                    {/* Teams Section : this is team names secions on the left of the fixture card*/}
                    <div className="flex-1 min-w-0">
                        {/* Home Team */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                H
                            </div>
                            <span className="text-sm text-gray-100 font-medium truncate">
                                {truncateTeamName(homeTeam)}
                            </span>
                        </div>
                        
                        {/* Away Team */}
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                A
                            </div>
                            <span className="text-sm text-gray-100 font-medium truncate">
                                {truncateTeamName(awayTeam)}
                            </span>
                        </div>
                    </div>

                    {/* Betting Buttons: buttons part to the right of the team names */}
                    <div className="flex gap-2">
                        {/* Home Button (1) */}
                        <button
                            onClick={onClickHomeButton}
                            className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 
                                ${total_pool > 1 
                                && 'so this is what I want , I need you to help me think it though okay , so I want it to show these parts in the battery format like , so we have range of colors from red, orange , yellow, red, the colors are based on percentages like higher percnetates like 80 and 90 we have green and lower like 10 we have red , and we should have a level like if its at 70 perenct it should be 70 percent covered lke the way batters alway are you have a colord bar showing the battery level right so I need like that but now basd on colors according to percenatages , the percenage value should also show bytheway , but if you think this color thing is too much for this you can also use a monocolor okay so long as it looks good you can also do away with the colors if you want and teh bar too, so long as you delive something good'} 

                                ${ homeButtonClicked
                                    ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                    : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                            }`}
                        >
                            {(total_pool > 1) ? "1" : findPoolPercentage(home_pool, 'home')}
                        </button>

                        {/* Draw Button (X) */}
                        <button
                            onClick={onClickDrawButton}
                            className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 ${
                                drawButtonClicked
                                    ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                    : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                            }`}
                        >
                            {(total_pool > 1) ? "X" : findPoolPercentage(draw_pool, 'draw')}
                        </button>

                        {/* Away Button (2) */}
                        <button
                            onClick={onClickAwayButton}
                            className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 ${
                                awayButtonClicked
                                    ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                    : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                            }`}
                        >
                            {(total_pool > 1) ? "2" : findPoolPercentage(away_pool, 'away')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Optional: Stake Button (if needed) */}
            {(homeButtonClicked || drawButtonClicked || awayButtonClicked) && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                    <button
                    onClick={onClickStakeButton}
                    className="w-full bg-[#60991A] hover:bg-[#4d7a15] text-black font-bold py-2 rounded-lg transition-colors duration-200">
                        Place bet
                    </button>
                </div>
            )}
        </div>
    )
}