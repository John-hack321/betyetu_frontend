'use client'
import { truncateTeamName } from "./fixtureCard";
import { Flame, Users, TrendingUp } from 'lucide-react';

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

// Returns a colour and label based on the percentage of the pool
function getOddsStyle(pct: number): { bar: string; text: string; label: string } {
    if (pct >= 60) return { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Favourite' };
    if (pct >= 40) return { bar: 'bg-[#FED800]', text: 'text-[#FED800]', label: 'Even' };
    if (pct >= 25) return { bar: 'bg-orange-400', text: 'text-orange-400', label: 'Underdog' };
    return { bar: 'bg-red-500', text: 'text-red-400', label: 'Long shot' };
}

interface OddsButtonProps {
    label: string;        // "1" | "X" | "2"
    teamName: string;     // full team name
    pool: number;
    totalPool: number;
    clicked: boolean;
    disabled?: boolean;
    onClick: () => void;
}

function OddsButton({ label, teamName, pool, totalPool, clicked, disabled = false, onClick }: OddsButtonProps) {
    const pct = totalPool > 0 ? Math.round((pool / totalPool) * 100) : 0;
    const style = getOddsStyle(pct);
    const impliedOdds = totalPool > 0 && pool > 0 ? (totalPool / pool).toFixed(2) : '—';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative flex flex-col items-center justify-between
                w-[30%] h-20 rounded-xl overflow-hidden
                border transition-all duration-200 select-none
                ${clicked
                    ? 'border-[#FED800] shadow-[0_0_12px_rgba(254,216,0,0.35)] scale-[1.03]'
                    : 'border-gray-700 hover:border-gray-500 active:scale-95'
                }
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                bg-[#0f1923]
            `}
        >
            {/* Filled odds bar at bottom */}
            <div
                className={`absolute bottom-0 left-0 right-0 ${style.bar} transition-all duration-500`}
                style={{ height: `${Math.max(pct, 4)}%`, opacity: clicked ? 0.35 : 0.22 }}
            />

            {/* Selected glow overlay */}
            {clicked && (
                <div className="absolute inset-0 bg-[#FED800]/10 rounded-xl" />
            )}

            {/* Content */}
            <div className="relative z-8 flex flex-col items-center justify-center h-full gap-0.5 px-1">
                <span className={`text-[11px] font-bold tracking-widest uppercase ${clicked ? 'text-[#FED800]' : 'text-gray-400'}`}>
                    {label} {/* the 1 * 2 * 3 part the the top  */}
                </span>
                <span className={`text-base font-black  ${clicked ? 'text-[#FED800]' : `${style.text}`}`}>
                    {pct}%
                </span>
                {/* for now I dont thik there is need to show implied odds all we should show id percentages I think 
                <span className={`text-base font-black ${clicked ? 'text-[#FED800]' : 'text-white'}`}>
                    {impliedOdds}x
                </span>
                */}
                <span className={`text-[10px] font-semibold ${clicked ? 'text-[#FED800]' : `text-white`}`}>
                    {impliedOdds}
                </span>
            </div>
        </button>
    );
}


export default function PoolStakeCard({
    keyId, // represents stake id
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

    const totalPool = home_pool + away_pool + draw_pool;
    const homePct = totalPool > 0 ? Math.round((home_pool / totalPool) * 100) : 33;
    const awayPct = totalPool > 0 ? Math.round((away_pool / totalPool) * 100) : 33;
    const drawPct = totalPool > 0 ? Math.round((draw_pool / totalPool) * 100) : 34;

    const anyClicked = homeButtonClicked || awayButtonClicked || drawButtonClicked;
    const hasPool = totalPool > 0;

    const formatPool = (n: number) =>
        n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

    return (
        <div className="
            bg-[#131e28] rounded-xl border border-gray-800
            hover:border-gray-600 transition-all duration-200
            shadow-md overflow-hidden
        ">
            {/* ── Header ───────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <div className="flex items-center gap-2">
                    {/* Pool badge */}
                    <span className="flex items-center gap-1 bg-[#FED800]/10 border border-[#FED800]/20 rounded-full px-2 py-0.5">
                        <TrendingUp size={10} className="text-[#FED800]" />
                        <span className="text-[#FED800] text-[10px] font-bold tracking-wide uppercase">Pool</span>
                    </span>
                    <span className="text-gray-500 text-[11px]">{league}</span>
                </div>

                <div className="flex items-center gap-2">
                    {isMatchLive && (
                        <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute" />
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 relative" />
                            <span className="text-red-400 text-[10px] font-bold tracking-widest">LIVE</span>
                            {scoreString && (
                                <span className="text-red-300 text-[10px] font-black ml-1">{scoreString}</span>
                            )}
                        </div>
                    )}
                    <span className="text-gray-500 text-[11px]">{matchTime}</span>
                </div>
            </div>

            {/* ── Teams row ────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 pb-3">
                {/* Home */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-700/20 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-300 shrink-0">
                        H
                    </div>
                    <span className="text-sm font-semibold text-gray-100 truncate">
                        {truncateTeamName(homeTeam, 14)}
                    </span>
                </div>

                <span className="text-gray-600 text-xs font-bold px-2">vs</span>

                {/* Away */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-sm font-semibold text-gray-100 truncate text-right">
                        {truncateTeamName(awayTeam, 14)}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-700/20 border border-purple-500/20 flex items-center justify-center text-[9px] font-bold text-purple-300 shrink-0">
                        A
                    </div>
                </div>
            </div>

            {/* ── Pool size bar ─────────────────────────────── */}
            {hasPool && (
                <div className="px-3 pb-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500 text-[10px]">Pool distribution</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Users size={9} />
                            KES {formatPool(totalPool)}
                        </span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                        <div
                            className="bg-blue-500 transition-all duration-700"
                            style={{ width: `${homePct}%` }}
                        />
                        <div
                            className="bg-gray-500 transition-all duration-700"
                            style={{ width: `${drawPct}%` }}
                        />
                        <div
                            className="bg-purple-500 transition-all duration-700"
                            style={{ width: `${awayPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-0.5 text-[9px]">
                        <span className="text-blue-400">{homePct}%</span>
                        <span className="text-gray-500">{drawPct}%</span>
                        <span className="text-purple-400">{awayPct}%</span>
                    </div>
                </div>
            )}

            {/* ── Divider ───────────────────────────────────── */}
            <div className="mx-3 border-t border-gray-800 mb-3" />

            {/* ── Odds buttons ─────────────────────────────── */}
            <div className="flex gap-2 px-1 pb-3 justify-center">
                <OddsButton
                    label="1"
                    teamName={homeTeam}
                    pool={home_pool}
                    totalPool={totalPool}
                    clicked={homeButtonClicked && clickedStakeId === keyId}
                    onClick={onClickHomeButton}
                />
                <OddsButton
                    label="X"
                    teamName="Draw"
                    pool={draw_pool}
                    totalPool={totalPool}
                    clicked={drawButtonClicked && clickedStakeId === keyId}
                    onClick={onClickDrawButton}
                />
                <OddsButton
                    label="2"
                    teamName={awayTeam}
                    pool={away_pool}
                    totalPool={totalPool}
                    clicked={awayButtonClicked && clickedStakeId === keyId}
                    onClick={onClickAwayButton}
                />
            </div>

            {/* ── Place bet CTA ─────────────────────────────── */}
            {anyClicked && (
                <div className="px-3 pb-3 animate-in slide-in-from-bottom-2 duration-200">
                    <button
                        onClick={onClickStakeButton}
                        className="
                            w-full py-3 rounded-xl font-bold text-sm text-black
                            bg-gradient-to-r from-[#FED800] to-[#f5c800]
                            hover:from-[#ffd700] hover:to-[#e8bc00]
                            active:scale-[0.98] transition-all duration-150
                            shadow-[0_4px_14px_rgba(254,216,0,0.3)]
                            flex items-center justify-center gap-2
                        "
                    >
                        <Flame size={15} />
                        Join Pool Market
                    </button>
                </div>
            )}
        </div>
    );
}