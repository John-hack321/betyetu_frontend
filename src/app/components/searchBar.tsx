'use client'
import { Search } from "lucide-react"

export interface SearchBarProps {
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>)=> void
}

export function SearchBar({handleOnChange}: SearchBarProps) {
    return (
        <div className="rounded-full border border-custom-white-text-color  mx-2 flex flex-row gap-4 py-2 px-2">
            <div>
                <Search/>
            </div>
            <input type="text"
                onChange={handleOnChange}
                placeholder="search for markets"                            
                className="w-3/4 rounded-full placeholder:text-center text-custom-white-text-color px-2 py-1 border-transparent focus:ring-transparent focus:outline-none"

            />
        </div>
    )
}