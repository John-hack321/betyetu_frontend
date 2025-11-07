'use client'
import { useEffect, useMemo, useState } from "react"
import LogOutButton from "../components/logoutButton"
import DespositButton from "../components/depositButton"
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import ProtectedRoute from "../components/protectedRoute"

// redux store setup
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../app_state/store"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { AppDispatch } from "../app_state/store"
import { BluetoothConnectedIcon } from "lucide-react"
import { setStakesData, StakeInterface } from "../app_state/slices/stakesData"
import { getUserStakesData } from "../api/stakes"

type FilterType = 'all' | 'live' | 'won' | 'lost' | 'pending';

interface FilterState {
    type: FilterType;
}

function StakesPage() {

  const [isLoading, setIsLoading]= useState(false)
  const [isMenuClicked, setIsMenuClicked]= useState(false)

  // redux data and utilities setup
  const dispatch= useDispatch<AppDispatch>()
  const currentPage= useSelector((state: RootState)=> state.currentPageData)
  const stakeListData= useSelector((state: RootState)=> state.stakesData.stakesList)
  const thisPage= "bets"


  // stake filtering logic

   const [filterState, setFilterState] = useState<FilterState>({
          type: 'all',
      });

  const filterTabs: { id: FilterType; name: string }[] = [
    { id: 'all', name: "All" },
    { id: 'live', name: "Live" },
    { id: 'won', name: "Won" },
    { id: 'pending', name: "pending" },
    { id: 'lost', name: "Lost"}]

  const handleTabClick= (tabId: FilterType)=> {
    setFilterState({
      type: tabId
    })
  }

  const filteredStakes= useMemo(()=> {
    if (!stakeListData || stakeListData.length === 0 ) return []; // for redux store for stakes data is empty we return an empty list

    let filtered= [...stakeListData]
    switch (filterState.type) {
      case 'all' :
        return filtered

      case 'live':
        return filtered.filter((stake)=> stake.stakeStatus === filterState.type)

      case 'lost':
        return filtered.filter((stake)=> stake.stakeResult === filterState.type)

      case 'pending':
        return filtered.filter((stake)=> stake.stakeStatus === filterState.type)
      
      case 'won':
        return filtered.filter((stake)=> stake.stakeResult === filterState.type)

      default:
        return filtered
    }

  }, [stakeListData, filterState])
  
  useEffect(()=> {

    const loadUserStakeData= async ()=> {
      try {
        const stakeData: StakeInterface[] | null= await getUserStakesData()
      
        if (!stakeData) { // null check to ensure we are handling the right data
          throw new Error(`data returned from api is not defined`)
        }

        dispatch(setStakesData(stakeData))

      } catch (err) {
        console.log(`an error occured: stake data receinved from backend is not that defined`)
      }
    }

    setIsLoading(true)
    dispatch(updateCurrentPage(thisPage))
    loadUserStakeData()
    setIsLoading(false)
  }, [])

  if (isMenuClicked) {
    return (
      <div className="bg-background-blue min-h-screen items-center justify-center flex ">
        <div className="bg-lightblue-components px-2 w-full mx-2 h-100 flex items-center gap-4 flex-col rounded-lg">
          <h2 className="text-2xl font-bold mt-2">menu</h2>
          <DespositButton/>
          <LogOutButton/>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-lightblue-components min-h-screen">
        <h2>loading...</h2>
      </div>
    )
  }


  return(
    <div className="bg-background-blue min-h-screen flex flex-col justify-between">
      {/* the header part goes here */}
      <div className="flex-none  border-b-2 pb-4">
        <HeaderComponent/>
        <div className="px-2">
          <h2 className="text-xl text-custom-white-text-color">my bets</h2>
          <div>
            {filterTabs.map((tab)=> (
              <button 
              onClick={()=> {handleTabClick(tab.id)}}
              key={tab.id}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                filterState.type === tab.id
                    ? 'text-[#FED800]'
                    : 'text-gray-400 hover:text-gray-200'
            }`}>
                {tab.name}
                {filterState.type === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]"></div>
                            )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* main component */}
      <div className="flex-1 overflow-y-auto-">
        {/* the stkae components mapping will now go from here */}
        {filteredStakes.map((stake)=> (
          <div>{stake.home}</div>
        ))}
      </div>

      {/* the footer will go to the bottom here */}
      <div>
        <FooterComponent currentPage={thisPage}/>
      </div>
    </div>
  )
}

export default function ActualStakePage() {
  return (
    <ProtectedRoute>
      <StakesPage/>
    </ProtectedRoute>
  )
}