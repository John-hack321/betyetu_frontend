'use client'

export interface MenuOverlayProps {
    onXButtonClick: ()=> void
    onLogoutButtonClick: ()=> void
}

export default function MenuOverlay ({onXButtonClick, onLogoutButtonClick}: MenuOverlayProps) {
    return (
        <div className="bg-other-blue-main-background-color min-h-screen">
            {/* meny header part */}
            <div className="p-2 w-full">
                <button 
                onClick={onXButtonClick}
                className="font-bold text-3xl m-2">x</button> {/*find a better icon for the x rather than using the x key*/}
            </div>

            {/* and now the body of the menu */}
            <div className="mt-2 flex flex-col items-center justify-center">
                {/* any other item we wanna add to the menu we will add it here */}
                <button 
                onClick={onLogoutButtonClick}
                className="text-red-600 border-red-600  border rounded-full px-3 py-2">logout</button>
            </div>
        </div>
    )
}