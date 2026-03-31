'use client'   // this page will be the holder of the unique stakes functionality
import MenuOverlay from "../components/menuOverlay"
import { useAuth } from "../context/authContext"
import { SearchBar } from "../components/searchBar"
import FooterComponent from "../components/footer"

import { Menu, Search, HomeIcon, LayoutDashboard, User , Trophy} from "lucide-react"
import { useEffect, useEffectEvent, useState } from "react"
import { useRouter } from "next/navigation"

// redux imports
import { RootState, AppDispatch } from "../app_state/store"
import { useSelector, useDispatch } from "react-redux"
import { updateCurrentPage } from "../app_state/slices/pageTracking"


export default function Dashboard () {

    // redux data setup
    const dispatch= useDispatch<AppDispatch>()
    const userData= useSelector((state: RootState)=> state.userData)
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page)

    const [initialLoading, setInitialLoading]= useState(true)
    const [menuOpen, setMenuOpen]= useState(false)
    const {logout} = useAuth()
    const [search, setSearch]= useState("")
    const [searchButtonClicked, setSearchButtonClicked]= useState(false)

    const router= useRouter()


    const handleUseInviteLinkButtonClick = () => {
        router.push('/stakeLinking')
    }

    useEffect(()=> {
        dispatch(updateCurrentPage("dashboard"))
    })

    //we will define the functionality for loading the inital loading of unique stake data here once it's well defined in our backend
    useEffect(()=> {
        const loadUniqueStakes = () => {
            // we will define the functionality for loading the stakes later on
            // for now all we will do is just reset initialLoading to false to signify successful loading of stakes
            setInitialLoading(false)
        }

        // running the functions
        loadUniqueStakes()
    },[])

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a2633]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
                    <p className="text-gray-400 text-sm">Loading stakes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="lex flex-col h-screen bg-other-blue-main-background-color">

            {/* Mobile Menu Overlay */}
            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* header this is for both the mobile and desktop interface */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 md:shadow-none shadow-lg md:px-6 z-20 border-b md:border-none border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                        onClick={()=> {setMenuOpen(true)}}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden">
                            <Menu className="text-gray-300" size={24} />
                        </button>
                        <h1 className="text-2xl font-bold md:text-3xl">
                            <span className="text-[#FED800]">bet</span>
                            <span className="text-gray-100">yetu</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all md:text-base">
                            Deposit
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            onClick={() => {
                                if (searchButtonClicked ) {
                                    setSearch("")
                                }
                                setSearchButtonClicked(!searchButtonClicked)
                            }}>
                                <Search className="text-gray-300" size={20} />
                        </button>
                    </div>
                </div>
                { searchButtonClicked && (
                    <SearchBar
                    onClose={()=> {
                        setSearch("")
                        setSearchButtonClicked(false)
                    }}
                    handleOnChange={e => setSearch(e.target.value)}
                    />
                )}
            </div>

            {/* the main content area */}
            {/* Desktop: 3-col grid that grows/shrinks with viewport  */}
            {/* Mobile:  single scrollable column with sticky hero    */}
            <div className="flex-1 flex flex-col overflow-hidden lg:grid lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[350px_1fr_350px] lg:gap-6 lg:overflow-hidden lg:px-6 lg:pt-6">

                 {/* ── Left Sidebar (desktop only, sticky) ─────────── */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => router.push('/main')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <HomeIcon size={20} />
                            <span>Home</span>
                        </button>
                        <button onClick={() => router.push('/stakes')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <Trophy size={20} />
                            <span>My Bets</span>
                        </button>
                        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>
                        <button onClick={() => router.push('/profile')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <User size={20} />
                            <span>Profile</span>
                        </button>
                    </div>

                    <h3 className="text-gray-200 text-lg font-semibold my-4">Quick Links</h3>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleUseInviteLinkButtonClick}
                            className="bg-[#2c3a47] text-gray-200 font-medium px-4 py-2 rounded-lg text-sm shadow-md hover:bg-[#344452] transition-all text-left">
                            🔗 Use Invite Link
                        </button>
                        <button
                            onClick={handleUseInviteLinkButtonClick}
                            className="bg-[#2c3a47] text-gray-200 font-medium px-4 py-2 rounded-lg text-sm shadow-md hover:bg-[#344452] transition-all text-left">
                            📱 Scan QR Code
                        </button>
                    </div>
                </div>

                {/* in between here we will have the actual listing of the unique stakes */}


                {/* Right Sidebar (desktop only, sticky) */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Bet Slip</h3>
                    <div className="text-gray-400 text-sm">
                        Your bet slip is empty. Select a bet to begin.
                    </div>
                </div>


            </div>

             {/* Bottom navbar (mobile only) */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>


        </div>
    )
}