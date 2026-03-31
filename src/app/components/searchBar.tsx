'use client'
import { Search, X } from "lucide-react"
import { useState } from "react"

export interface SearchBarProps {
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClose?: () => void          // called when the bar should be hidden entirely
    placeholder?: string          // optional custom placeholder
    autoFocus?: boolean           // focus input on mount
}

export function SearchBar({
    handleOnChange,
    onClose,
    placeholder = "Search for markets...",
    autoFocus = true,
}: SearchBarProps) {
    const [value, setValue] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        handleOnChange(e)           // bubble up to parent
    }

    const handleXClick = () => {
        if (value.length > 0) {
            // First duty: clear the input
            setValue("")
            // Synthesise a change event so the parent search state also clears
            const syntheticEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>
            handleOnChange(syntheticEvent)
        } else {
            // Second duty: close/hide the search bars
            onClose?.()
        }
    }

    return (
        <div className="flex items-center gap-2 mx-2 mt-2 mb-1 px-3 py-2 rounded-xl bg-[#23313D] border border-gray-600 focus-within:border-[#FED800] focus-within:ring-1 focus-within:ring-[#FED800]/30 transition-all duration-200">
            {/* Search icon — left */}
            <Search
                size={16}
                className="text-gray-400 flex-shrink-0"
            />

            {/* Input */}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm focus:outline-none"
            />

            {/* X button — always visible once search bar is shown */}
            <button
                onClick={handleXClick}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label={value.length > 0 ? "Clear search" : "Close search"}
            >
                <X
                    size={15}
                    className={`transition-colors ${value.length > 0 ? "text-[#FED800]" : "text-gray-500"}`}
                />
            </button>
        </div>
    )
}