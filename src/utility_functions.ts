import { useSelector } from "react-redux"
import { RootState } from "./app/app_state/store"

const userData= useSelector((state: RootState)=> state.userData)

const getUserProfileData= ()=> {
    const accessToken= localStorage.get
}