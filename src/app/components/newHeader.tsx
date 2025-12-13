'use client'

import { Menu } from "lucide-react"
import DespositButton from "./depositButton"
import SearchIcon from "./searchIcon"

export default function HeaderComponent () {
    return (
        <div className = "p-2 flex items-center pt-4 justify-between">
            <div className = "flex items-center">
                <div>
                    <Menu/>
                </div>
                <h2 className = "text-2xl font-bold">
                    <span className = "text-yellow-components">Peer</span>
                    <span className = "text-gray-100">Stake</span>
                </h2>
            </div>
            <div className="flex px-2 items-center gap-2">
                <DespositButton/>
                <SearchIcon/>
            </div>
        </div>
    )
}
