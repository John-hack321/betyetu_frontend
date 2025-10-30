'use client'
import FooterComponent from "../components/footer"
import HeaderComponent from "../components/newHeader"
import DespositButton from "../components/depositButton"
import { useEffect } from "react"

// redux setup imports
import { RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { AppDispatch } from "../app_state/store"
import { updateCurrentPage } from "../app_state/slices/pageTracking"

export default function() {

    const thisPage= "dashboard"

    // redux data setup and utility functions
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page )
    const matchData= useSelector((state: RootState)=> state.allFixturesData)

    const dispatch= useDispatch<AppDispatch>()

    useEffect(()=> {
        const updatePageData= (page: string)=> {
            dispatch(updateCurrentPage(page))
        };

        updatePageData(thisPage);
    }, [])

    return (
        <div className= "h-screen bg-background-blue">
            {/* the header goes here */}
            <div>
                <HeaderComponent/>
            </div>

            {/* main app content will go here */}
            <div className="ml-2 mr-2">
                <div className="mt-4 border-b border-b-gray-600 pb-4">
                    <h2 className="text-xl">hi John</h2>
                </div>
                {/* balance showcase part */}
                <div className= "flex mt-8 gap-4">
                    <h2 className="text-xl">
                        <span className="text-custom-white-text-color">available balance</span>
                        <span className='text-custom-white-text-color'>ksh 70</span>
                    </h2>
                    <DespositButton/>
                </div>
                {/* palce bet section */}
                <div className="flex mt-4 w-full gap-2">
                    <button className="w-1/3 rounded-lg p-6 text-xl text-black bg-green-components">Place <br /> Bet</button>
                    <button
                     className="rounded-lg border-custom-white-text-color w-2/3 bg-lightblue-components " >Discover more about betyety</button>
                </div>
                {/* populare games sections */}
                <div className="mt-10">
                    <h2 className="text-xl text-custom-white-text-color">Popular games</h2>
                    <div className= "w-full border-t border-b border-t-gray-600 border-b-gray-600 h-90">
                    {matchData.data.map((match) => (
                        /* game componet are here now */
                        <div key={match.match_id} className="text-black py-1 border-b border-gray-200 flex justify-between pr-4 pl-2">
                            <div>
                                <h2 className = "text-xs text-gray-400">English premier league</h2>
                                <div className = "mt-2">
                                    <h2 className = "text-[12px] font-bold tracking-wider">{match.home_team} <br />{match.away_team}</h2>
                                </div>
                                
                            </div>
                            <div className = "mt-4">
                                <div>
                                    <h2 className = "text-[12px] mt-1">{match.match_date}</h2>
                                </div>
                                <h2 className = "font-bold text-[12px] text-green-700">stake</h2>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
                {/* histpry button part */}
                <button className="rounded-full text-xl bg-green-components px-6 py-2 text-black mt-6">history</button>
            </div>

            {/* the navigation bar will go here */}
            <div className="mb-0 bottom-0 fixed w-full">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}