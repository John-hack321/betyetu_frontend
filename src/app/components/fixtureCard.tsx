interface FixtureCardProps {
    league: string;
    matchTime : string;
    homeTeam : string;
    awayTeam : string;

}

export default function FixtureCard({league , matchTime ,homeTeam , awayTeam} : FixtureCardProps) {
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
                        <button className = 'bg-bg-lightblue-components w-10 px-3 py items-center text-center rounded-full'>1</button>
                        <h3>x</h3>
                        <button className = "bg-bg-lightblue-components w-10 px-3 py items-center text-center rounded-full">2</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

