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
                <h2 className = "text-4xl font-bold ml-10">Staking</h2>
                <div className= "ml-10 mt-4 bg-blue-700 flex">
                    <div className ="flex flex-col w-1/2 h-40 bg-red-600">
                        <button 
                        className ="rounded-lg bg-green-800 mx-2 my-2 h-1/2 ">{truncateTeamName(currentStakeData.homeTeam)}</button>
                        <button
                        className ="rounded-lg bg-green-800 mx-2 my-2 h-1/2 ">{truncateTeamName(currentStakeData.awayTeam)}</button>
                    </div>
                    <div className="w-1/2 bg-yellow-500">
                        <button 
                        className="bg-green-700 h-36 rounded-lg w-40 mx-2 my-2">Draw</button>
                    </div>
                </div>
                {/* staking amount entrance point */}
                <div className="flex mt-3 ml-10 gap-8">
                    <h2 className = "text-xl">staking amount</h2>
                    <div className = "items-center justify-center flex px-2 py-1 border-1 border-gray-100 placeholder:text-black rounded-lg w-20 hover:bg-amber-200">
                        <input type="text"
                        placeholder="100"
                        className = "text-black hover:font-extrabold font-bold w-18 pl-4" />
                    </div>
                </div>
                {/* deposit and place bet button */}
                <div className="mt-4 flex ml-10 gap-6">
                    <DespositButton/>
                    <button className = "bg-yellow-components  text-center text-black px-6 py-1 rounded-full"
                    onClick={handlePlaceButtonClick}>place bet</button>
                </div>
                {/* bet invite part */}
                <div className = 'mt-10 ml-10'>
                    <h2 className = "ml-4">Invite : Scan QR code below</h2>
                    <div className = "w-65 mt-4">
                        <img src="/example_qr.png" alt="" />
                    </div>
                    <div>
                        <h2 className ="mt-2 ml-4">or copy the link below</h2>
                        <div className = "flex gap-2 pt-2">
                            <div className = "border-2 border-gray-600 w-50 rounded-lg px-2 py-1">
                                aaflafjklajflkjalkdfjlajflaflaf
                            </div>
                            <button className="bg-gray-600 rounded-lg px-2 py-1 shadow-sm">copy</button>
                        </div>
                    </div>
                </div>
                {/* the footer at the bottom */}
                <div className="mb-0 bottom-0 fixed p-2">
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