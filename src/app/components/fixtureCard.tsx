import { formatMatchDate } from "@/utils/dateUtils";

interface FixtureCardProps {
    keyId: number;
    clickedFixtureId: number | null;
    league: string;
    matchTime: string;
    homeTeam: string;
    awayTeam: string;
    onClickHomeButton: ()=> void;
    onClickAwayButton: ()=> void;
    onClickDrawButton: ()=> void;
    onClickStakeButton: ()=> void;
    homeButtonClicked: boolean;
    awayButtonClicked: boolean;
    drawButtonClicked: boolean;
}

export const truncateTeamName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '..';
};

export default function FixtureCard({
    keyId,
    clickedFixtureId,
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
    drawButtonClicked
}: FixtureCardProps) {
    
    // Truncate team names if too long
    

    return (
        <div className='bg-background-blue rounded-lg p-3 shadow-md border border-gray-700'>
            {/* League and Time Header */}
            <div className='flex items-center justify-between mb-2 pb-2 border-b border-gray-600'>
                <span className="text-xs text-gray-400 font-medium">{league}</span>
                <span className='text-xs text-gray-300'>{formatMatchDate(matchTime)}</span>
            </div>

            {/* Main Betting Area */}
            <div className="flex items-center justify-between gap-2">
                {/* Teams Section */}
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

                {/* Betting Buttons */}
                <div className="flex gap-2">
                    {/* Home Button (1) */}
                    <button
                        onClick={onClickHomeButton}
                        className={`w-14 h-14 rounded-lg font-bold text-base transition-all duration-200 ${
                            homeButtonClicked
                                ? 'bg-[#FED800] text-black shadow-lg scale-105'
                                : 'bg-[#1a2633] text-gray-300 hover:bg-[#2a3643] border border-gray-600'
                        }`}
                    >
                        1
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
                        X
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
                        2
                    </button>
                </div>
            </div>

            {/* Optional: Stake Button (if needed) */}
            {(homeButtonClicked || drawButtonClicked || awayButtonClicked) && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                    <button
                    onClick={onClickStakeButton}
                     className="w-full bg-[#60991A] hover:bg-[#4d7a15] text-black font-bold py-2 rounded-lg transition-colors duration-200">
                        Stake Now
                    </button>
                </div>
            )}
        </div>
    );
}