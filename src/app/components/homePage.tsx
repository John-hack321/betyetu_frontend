export default function LandingHomePage(){

    const dummy_data = [
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
        {'icon' : '' , 'home' : 'Man Utd' , 'away' : 'Chelsea' , 'start_time' : '10 : 30 am EAT'},
    ]
    
    return (
        <div className = 'bg-white min-h-screen h-full'>
            {/* header sectoin : appname and other info */}
            <div className = "flex  p-2 justify-between mx-2">
                <h2 className = " font-bold text-2xl">
                    <span className ='text-green-800'>bet</span>
                    <span className = "text-red-500">yetu</span>
                </h2>
                <div className = "flex gap-3">
                    <button className = "text-black border-black border-1 rounded-full px-3 text-sm ">help</button>
                    <button className = "text-white bg-black rounded-full px-3 text-sm">login</button>
                </div>
            </div>
            {/* the hero section now goes here  */}
            <div className = "mt-10 mb-10 items-center flex  flex-col text-2xl font-extrabold">
                <h1 className = "text-black">For you</h1>
                <h1 className = "text-black"> Trusted by millions</h1>
            </div>
            {/* the gaming section now */}
            <div className = "mt-5">
                <div className ='p-1 bg-black rounded-full w-30 items-center flex justify-center ml-4 opacity-40'>
                    <h2 className = "text-white text-xs font-bold ">Featured games</h2>
                </div>
                {/* games are lilted here now */}
                <div className = "h-80 mx-2 border-t-1 border-b-1 border-gray-400 mt-4 overflow-y-scroll flex flex-col-reverse">
                {dummy_data.map((item, index) => (
                    /* game componet are here now */
                    <div key={index} className="text-black py-1 border-b border-gray-200 flex justify-between pr-4 pl-2">
                        <div>
                            <h2 className = "text-xs text-gray-400">English premier league</h2>
                            <div className = "mt-2">
                                <h2 className = "text-[12px] font-bold tracking-wider">{item.home} <br />{item.away}</h2>
                            </div>
                            
                        </div>
                        <div className = "mt-4">
                            <div>
                                <h2 className = "text-[12px] mt-1">{item.start_time}</h2>
                            </div>
                            <h2 className = "font-bold text-[12px] text-green-700">stake</h2>
                        </div>
                    </div>
                ))}
                </div>
            </div>
            {/* instructions part will go here  */}
            <div className = "mt-4">
                <h2 className = "text-black text-sm ml-2 font-bold">guide</h2>
                <div className = "text-black">
                <ol className="text-sm ml-4 list-decimal">
                    <li>Make sure you have money deposited in your mpesa</li>
                    <li>Select a game</li>
                    <li>Enter your name and mpesa number</li>
                    <li>Let your opponent enter their name and mpesa number</li>
                    <li>Deposit money</li>
                    <li>Confirm stake</li>
                    <li>Wait for match end confirmation</li>
                </ol>
                </div>
            </div>
            {/* a simple navigation at the botton to traverse the pages */}
            <div className="fixed bottom-0 left-0 right-0 bg-white text-xs flex justify-around py-2 border-t border-gray-300 pb-10">
                <h2 className="text-black">Home</h2>
                <h2 className="text-black">Games</h2>
                <h2 className="text-black">Stakes</h2>
            </div>
        </div>
    )
}