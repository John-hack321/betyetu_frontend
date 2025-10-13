'use client'
import { User , Home , Plus , MenuSquare , LayoutDashboard} from "lucide-react"
const Icons = [
    {'iconName' : 'profile', ' icon' : <User/>},
    {'iconName' : 'home', ' icon' : <Home/>},
    {'iconName' : 'dashboard', ' icon' : <LayoutDashboard/>},
    {'iconName' : 'bets', ' icon' : <MenuSquare/>},
    {'iconName' : 'plus', ' icon' : <Plus/>},
]

export default function FooterComponent () {
    return (
        <div className = "flex gap-9 mx-1 items-center">
            <div className="flex gap-8">
                <div className = 'items-center flex flex-col'>
                    <a href=""><Home/></a>
                    <h3 className = 'text-sm text-gray-300'>home</h3>
                </div>
                <div className = "items-center flex flex-col">
                    <a href=""><MenuSquare/></a>
                    <h3 className = 'text-sm text-gray-300'>bets</h3>
                </div>
            </div>
            <div className = "bg-yellow-components  text-black rounded-full p-2 ">
                <Plus/>
            </div>
            <div className="flex gap-8 ">
                <div className = 'flex flex-col items-center'>
                    <a href=""><LayoutDashboard/></a>
                    <h3 className = 'text-sm text-gray-300'>dahsboard</h3>
                </div>
                <div className = "items-center flex flex-col">
                    <a href=""><User/></a>
                    <h3 className = 'text-sm text-gray-300'>profile</h3>
                </div>
            </div>
        </div>
    )
}