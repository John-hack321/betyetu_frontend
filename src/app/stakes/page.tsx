'use client'
import { useEffect, useState } from "react"
import LogOutButton from "../components/logoutButton"
import DespositButton from "../components/depositButton"
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"

// redux store setup
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../app_state/store"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { AppDispatch } from "../app_state/store"

export default function StakesPage() {

  const [isLoading, setIsLoading]= useState(false)
  const [isMenuClicked, setIsMenuClicked]= useState(false)

  // redux data and utilities setup
  const dispatch= useDispatch<AppDispatch>()
  const currentPage= useSelector((state: RootState)=> state.currentPageData)
  const thisPage= "bets"
  
  useEffect(()=> {
    setIsLoading(true)
    dispatch(updateCurrentPage(thisPage))
    setIsLoading(false)
  })

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
      <div className="fixed mt-0 top-0 flex-none bg-background-blue">
        <HeaderComponent/>
      </div>

      {/* main component */}

      {/* the footer will go to the bottom here */}
      <div>
        <FooterComponent currentPage={thisPage}/>
      </div>
    </div>
  )
}