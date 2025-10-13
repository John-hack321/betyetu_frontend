'use client'
import { hambagerMenu } from "@/constants"
import { Menu } from "lucide-react"
import HeaderComponent from "../components/newHeader"
import DespositButton from "../components/depositButton"
import FooterComponent from "../components/footer"

export default function stakingPage() {

    const handlePlaceButtonClick = () => {
        console.log('the place bet button has been clicked')
    }
    return (
        <div className = "bg-background-blue min-h-screen">
           <HeaderComponent/>
           {/* the staking main content goes here now */}
           <div className="mt-14">
                <h2 className = "text-4xl font-bold ml-10">Staking</h2>
                <h2 className = "text-2xl mt-4 flex gap-3 ml-10">
                    <span>Man U</span>
                    <span>vs</span>
                    <span>Liver</span>
                </h2>
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