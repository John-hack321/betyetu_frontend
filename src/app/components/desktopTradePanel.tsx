'use client'

import { truncateTeamName } from './fixtureCard'

const FIXTURE_HOME_COLOR = '#10b981'
const FIXTURE_AWAY_COLOR = '#f97316'

interface DesktopTradePanelProps {
    marketType: 'fixture' | 'group' | 'prediction' | ''
    yesPct?: number
    noPct?: number
    homePct?: number
    drawPct?: number
    awayPct?: number
    homeTeam?: string
    awayTeam?: string
    isResolved?: boolean
    isLocked?: boolean
    onBuyYes?: () => void
    onBuyNo?: () => void
    onBuyHome?: () => void
    onBuyDraw?: () => void
    onBuyAway?: () => void
}

export default function DesktopTradePanel({
    marketType,
    yesPct = 50,
    noPct = 50,
    homePct = 33,
    drawPct = 34,
    awayPct = 33,
    homeTeam = 'Home',
    awayTeam = 'Away',
    isResolved = false,
    isLocked = false,
    onBuyYes,
    onBuyNo,
    onBuyHome,
    onBuyDraw,
    onBuyAway,
}: DesktopTradePanelProps) {
    const disabled = isResolved || isLocked

    return (
        <div className="hidden lg:block self-start sticky top-6 w-full">
            <div className="bg-[#131e28] rounded-2xl border border-white/5 p-4">
                <h3 className="text-gray-300 text-sm font-bold mb-4">Trade</h3>

                {marketType === 'prediction' && !isResolved && (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onBuyYes}
                            disabled={disabled}
                            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-50 bg-[#1DA462]"
                        >
                            Buy Yes {yesPct.toFixed(0)}¢
                        </button>
                        <button
                            onClick={onBuyNo}
                            disabled={disabled}
                            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-50 bg-[#ef4444]"
                        >
                            Buy No {noPct.toFixed(0)}¢
                        </button>
                    </div>
                )}

                {marketType === 'fixture' && !disabled && (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onBuyHome}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
                            style={{ background: FIXTURE_HOME_COLOR }}
                        >
                            <div className="text-[10px] opacity-80 mb-0.5">
                                {truncateTeamName(homeTeam, 14)}
                            </div>
                            <div>{homePct.toFixed(0)}¢</div>
                        </button>
                        <button
                            onClick={onBuyDraw}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 bg-gray-600"
                        >
                            <div className="text-[10px] opacity-80 mb-0.5">Draw</div>
                            <div>{drawPct.toFixed(0)}¢</div>
                        </button>
                        <button
                            onClick={onBuyAway}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
                            style={{ background: FIXTURE_AWAY_COLOR }}
                        >
                            <div className="text-[10px] opacity-80 mb-0.5">
                                {truncateTeamName(awayTeam, 14)}
                            </div>
                            <div>{awayPct.toFixed(0)}¢</div>
                        </button>
                    </div>
                )}

                {marketType === 'group' && (
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Select a candidate below and use the Yes / No buttons to open the trade panel.
                    </p>
                )}

                {(isResolved || isLocked) && marketType !== 'group' && (
                    <p className="text-gray-500 text-sm">
                        {isResolved ? 'This market has been resolved.' : 'Trading is closed for this market.'}
                    </p>
                )}
            </div>

            <div className="bg-[#131e28] rounded-2xl border border-white/5 p-4 mt-4">
                <h3 className="text-gray-300 text-sm font-bold mb-3">How it works</h3>
                <div className="space-y-4">
                    {[
                        { n: 1, title: 'Buy shares', desc: 'Buy YES or NO shares based on your prediction' },
                        { n: 2, title: 'Price moves', desc: 'Prices shift as more people trade' },
                        { n: 3, title: 'Market resolves', desc: 'Correct side earns from the pool' },
                    ].map((tip) => (
                        <div key={tip.n} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#FED800]/15 border border-[#FED800]/20 flex items-center justify-center shrink-0 text-[#FED800] text-[11px] font-black">
                                {tip.n}
                            </div>
                            <div>
                                <p className="text-white text-xs font-semibold mb-0.5">{tip.title}</p>
                                <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
