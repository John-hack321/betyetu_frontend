'use client'
import HeaderComponent from "../components/newHeader"
import DespositButton from "../components/depositButton"
import FooterComponent from "../components/footer"
import { truncateTeamName } from "../components/fixtureCard"

// redux import setup
import { AppDispatch, RootState } from "../app_state/store"
import { UseSelector } from "react-redux"
import { UseDispatch } from "react-redux"
import { useSelector } from "react-redux"
import ProtectedRoute from "../components/protectedRoute"

function Staking() {

    const quickAmountValues= [50, 100, 150, 200, 250, 300]

    // redux data setup
    const currentStakeData = useSelector((state: RootState) => state.currentStakeData)
    const matchesData = useSelector((state: RootState) => state.allFixturesData)

    const currentMatchData : {home: string; away: string} | null = null

    const handlePlaceButtonClick = () => {
        console.log('the place bet button has been clicked')
    }
    return (
        <div className = "bg-background-blue min-h-screen">
           <HeaderComponent/>
           {/* the staking main content goes here now */}
           <div className="mt-14">
                <h2 className = "text-4xl font-bold ml-4">Staking</h2>
                <div className= "ml-2 mt-4  flex mr-2">
                    <div className ="flex flex-col w-1/2 h-35 ">
                        <button 
                        className ="border border-gray-500 rounded-lg bg-lightblue-components mx-2 shadow-2xl text-xl my-2 h-1/2 ">{truncateTeamName(currentStakeData.homeTeam)}</button>
                        <button
                        className ="border border-gray-500 rounded-lg bg-lightblue-components mx-2 shadow-2xl text-xl mb-2 h-1/2 ">{truncateTeamName(currentStakeData.awayTeam)}</button>
                    </div>
                    <div className="w-1/2 ">
                        <button 
                        className="border border-gray-500 bg-lightblue-components h-30 rounded-lg w-40 shadow-2xl mx-2 my-2  text-xl">Draw</button>
                    </div>
                </div>
                {/* staking amount entrance point */}
                <div className="flex mt-3 ml-4 gap-3">
                    <h2 className = "text-xl">amount</h2>
                    <div className = "items-center justify-center flex px-2 py-1 border-1 border-gray-100 placeholder:text-black rounded-lg w-38 hover:bg-amber-200">
                        <input type="text"
                        placeholder="100"
                        className = "text-white focus:outline-none focus:ring-yellow-50 focus:border-transparent hover:font-extrabold font-bold w-38 pl-4" />
                    </div>
                    <button className = "bg-yellow-components  text-center text-black px-6 py-1 rounded-full"
                    onClick={handlePlaceButtonClick}>place bet</button>
                </div>
                {/* deposit and place bet button */}
                <div className="mt-2 flex ml-4 flex-col">
                    <h2 className= "text-sm">quick amounts</h2>
                    <div className="flex gap-4 mt-2 border-r py-2 border-r-gray-100 border-l border-l-gray-100 flex-1 overflow-x-auto w-88">
                        {quickAmountValues.map((amount) => (
                                <button
                                className= "px-3 py-1 rounded-full text-white  bg-lightblue-components">{amount}</button>
                        ))}
                    </div>
                </div>
                {/* bet invite part */}
                <div className = 'mt-4 ml-2'>
                    <h2 className = "ml-4">Invite : Scan QR code below</h2>
                    <div className = "w-65 mt-4">
                        <img src="/example_qr.png" alt="" />
                    </div>
                    <div>
                        <h2 className ="mt-2 ml-4">or copy the link below</h2>
                        <div className = "flex gap-2 pt-2">
                            <div className = "border-2 border-gray-600 w-50 rounded-lg px-2 py-1">
                                aaflafjkl
                            </div>
                            <button className="bg-gray-600 rounded-lg px-2 py-1 shadow-sm">copy</button>
                        </div>
                    </div>
                </div>
                {/* the footer at the bottom */}
                <div className="mb-0 bottom-0 fixed w-full">
                    <FooterComponent/>
                </div>
           </div>
        </div>
      
    )
}

export default function StakingPage() {
    return (
        <ProtectedRoute>
            <Staking/>
        </ProtectedRoute>
    )
}