'use client'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import StakeFilterButton from "../components/stakeFilterButtons"
import StakeComponent from "../components/stakeData"

// redux imports setup
import { RootState } from "../app_state/store"
import { useSelector } from "react-redux"
import { UseDispatch } from "react-redux"
import { AppDispatch } from "../app_state/store"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function Stakes() {

    const thisPage= "bets"

    // redux data setup
    const currentPage= useSelector((state: RootState)=> state.currentPageData.page)
    const dispatch= useDispatch<AppDispatch>()

    useEffect(()=> {
        const updatePageData= (page: string)=> {
            dispatch(updateCurrentPage(page))
        };

        updatePageData(thisPage)
    },[])

    const filterButtons: string[]= ['All', 'live', 'lost', 'won']
    const stakes= [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

    const handleButtonClick= ()=> {
        console.log('a filete button ahs been cliced')
    }

    return(
        <div className= "min-h-screen bg-background-blue">
            {/* the header will go here */}
            <div className="fixed top-0 mt-0 w-full bg-background-blue">
                <HeaderComponent/>
                {/* stakes filtering buttons*/}
                <div className="border-b border-b-gray-600 flex gap-4 pb-2">
                    {filterButtons.map((item, index) => (
                        <div key={index}>
                            <StakeFilterButton
                             buttonName={item}
                             onButtonClick={()=> {handleButtonClick()}}/>
                        </div>
                    ))}
                </div>
            </div>
            {/* main page data section */}
            <div className="mx-2 mt-4">
                {/* the stakes will start from here now */}
                <div>
                    {stakes.map((item, index)=> (
                        <div key={index}>
                            <StakeComponent/>
                        </div>
                    ))}
                </div>
            </div>
            {/* the footer will go here */}
            <div className="mb-0 bottom-0 w-full fixed">
                <FooterComponent currentPage={currentPage} />
            </div>
        </div>
    )
}