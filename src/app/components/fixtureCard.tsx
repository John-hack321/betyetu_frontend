
interface FixtureCardProps {
    keyId: number;
    clickedFixtureId : number;
    league: string;
    matchTime: string;
    homeTeam: string;
    awayTeam: string;
    onClickHomeButton: () => void;
    onClickAwayButton: () => void;
    onClickDrawButton: () => void;
    homeButtonClicked: boolean;
    awayButtonClicked: boolean;
    drawButtonClicked: boolean;
}

export default function FixtureCard(
    {keyId, clickedFixtureId , league, matchTime, homeTeam, awayTeam, onClickHomeButton, onClickAwayButton, onClickDrawButton, homeButtonClicked, awayButtonClicked, drawButtonClicked} : FixtureCardProps) {
    return (
        <div className ='px-2  flex flex-col pb-2 gap-2'>
            <div className = 'flex items-center justify-between px'>
                <h2 className = "text-xs text-gray-500">{league}</h2>
                <h2 className = 'text-xs'>{matchTime}</h2>
            </div>
            <div className="items-center flex gap-20">
                <div>
                    <h2 className = "text-gray-300 font-bold text-sm">{homeTeam} <br /> {awayTeam}</h2>
                </div>
                <div className = "flex gap-4">
                    <button className = 'text-black bg-green-components rounded-lg px-2 py ml-10 '>stake</button>
                    <div className = "flex gap-4">
                        {/* home button */}
                        {homeButtonClicked && (keyId === clickedFixtureId)? (
                            <button
                            onClick={() => {onClickHomeButton()}}
                             className = 'bg-yellow-components text-black w-10 px-3 py items-center text-center rounded-full'>1</button>
                        ) : (
                            <button
                            onClick={() => {onClickHomeButton()}}
                             className = 'bg-bg-lightblue-components w-10 px-3 py items-center text-center rounded-full'>1</button>
                        )}

                        {/* draw button */}
                       {drawButtonClicked ? (
                         <button
                         onClick={() => {onClickDrawButton()}}
                         className="bg-yellow-components text-black w-10 px-3 py items-center text-center rounded-full">x</button>
                       ) : (
                         <button
                         onClick={() => {onClickDrawButton()}}
                         className="bg-bg-lightblue-components w-10 px-3 py items-center text-center rounded-full">x</button>
                       )}

                       {/* away button  */}
                        {awayButtonClicked ? (
                            <button
                            onClick={() => {onClickAwayButton()}}
                             className = "bg-yellow-components text-black w-10 px-3 py items-center text-center rounded-full">2</button>
                        ) : (
                            <button
                            onClick={() => {onClickAwayButton()}}
                             className = "bg-bg-lightblue-components w-10 px-3 py items-center text-center rounded-full">2</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}