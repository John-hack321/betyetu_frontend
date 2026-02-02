'use client'
import { User, Plus, Trophy, Target, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, LogOut, Edit, Home as HomeIcon, LayoutDashboard, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FooterComponent from '../components/footer';

// Redux setup imports
import { AppDispatch, RootState } from '../app_state/store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateCurrentPage } from '../app_state/slices/pageTracking';



export default function AnonymousStakingPage () {

    // redux data setup here
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page)
    const dispatch= useDispatch<AppDispatch>()

    const router= useRouter()

    const handleUseInviteLinkButtonClick = () => {
        router.push('/stakeLinking')
    }

    useEffect(()=> {
        const updatePageData= (page: string)=> {
            dispatch(updateCurrentPage('anonymous-staking'))
        }

        updatePageData('anonymous-staking')
    },[])

    return (
        <div className="flex flex-col h-screen bg-other-blue-main-background-color">
            {/* Header */}
            {/* this header part plays the same role for both the big and the smaller screens the only dirrent is the spacing in between and around the component based on the screen size */}
            <div className="flex-none bg-[#1a2633] px-4 py-4 md:shadow-none shadow-lg md:px-6 z-20 border-b md:border-none border-gray-800">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden">
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
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Search className="text-gray-300" size={20} />
                    </button>
                </div>
                </div>
            </div>

            {/* main content area */}
            <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-4 lg:px-6 lg:pt-6 lg:max-w-[1400px] lg:mx-auto lg:w-full">

                {/* Left Sidebar (hidden on mobile/tablet, visible on large desktop, sticky) */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
                    <div className="flex flex-col gap-2">
                        <button onClick={()=> router.push('/main')} className="flex items-center gap-3 p-3 rounded-lg bg-[#FED800] text-black font-semibold transition-colors">
                            <HomeIcon size={20} />
                            <span className="xl:inline">Home</span>
                        </button>
                        <button onClick={()=> router.push('/stakes')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <Trophy size={20} />
                            <span className="xl:inline">My Bets</span>
                        </button>
                        <button onClick={()=> router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <LayoutDashboard size={20} />
                            <span className="xl:inline">Dashboard</span>
                        </button>
                        <button onClick={()=> router.push('/profile')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
                            <User size={20} />
                            <span className="xl:inline">Profile</span>
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

                {/* centrall content column */}
                {/* stake contenet part: the listing of the public stakes occurs from here now */}
                <div className='overflow-y-auto pb-24 lg:pb-4 custom-scrollbar lg:pr-4'>

                    <div>
                        {/* small heading cont , only availabe to mobile users */}
                        <div className='w-full lg:hidden relative'>
                            {/* Text content above the image */}
                            <div className='relative z-20 px-6 pt-8 pb-12'>
                                <h2 className='text-4xl font-extrabold text-white drop-shadow-lg'>
                                    <span className='text-[#FED800]'>Stake</span> against millions <br/> of people <span className='text-[#FED800]'>anonymously</span>
                                </h2>
                                <p className='text-gray-200 mt-3 text-lg'>Join the action and test your predictions against the world</p>
                            </div>
                            
                            {/* Image as background */}
                            <div className='absolute inset-0 -z-0'>
                                <div className='absolute inset-0 bg-black/50 z-10'></div>
                                <img 
                                    src="/laliga.png" 
                                    alt="Football stadium with crowd" 
                                    className='w-full h-full object-cover brightness-75'
                                />
                            </div>
                        </div>

                        {/* the actual list of stakes will go here now */}
                        <div className='mx-2 mt-2 bg-lightblue-components rounded-lg '>
                            <div className="flex flex-row px-2 justify-between pt-2 pb-3">
                                <div>
                                    <p>12th Februaru 2026</p>
                                    <p>Englis premier league</p>
                                </div>
                                <div>
                                    <p>username</p>
                                    <p>amount: 300</p> {/*most of the data here will come from the backedn these are just placeholders for the desing first */}
                                </div>
                            </div>
                            <div className='flex flex-row items-center justify-between px-2'>
                                <div>
                                    <p>home team</p>
                                    <p>away team</p>
                                </div>
                                <div className='flex flex-row gap-2'>
                                    <div>1</div>
                                    <div>x</div>
                                    <div>2</div>
                                </div>
                            </div>
                            <div>
                                <p>possible win :  amount </p>
                            </div>
                        </div>

                    </div>


                </div>

                {/* right sidebar, this is only visible on the desktop screen only */}
                <div className="hidden lg:block bg-[#1a2633] rounded-lg p-4 self-start sticky top-6 h-fit">
                    <h3 className="text-gray-200 text-lg font-semibold mb-4">Bet Slip</h3>
                    <div className="text-gray-400 text-sm">
                        Your bet slip is empty. Select a bet to begin.
                    </div>
                </div>


            </div>

            {/* the bottom navbar goes here : I think I belive i did a mistake by calling a footer , well its no a footer it is just the bottom bar for naviagting differnet page  */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
                <FooterComponent currentPage={currentPage} />
            </div>
            
        </div>
    )
}