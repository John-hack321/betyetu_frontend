import { useSelector } from "react-redux"
import { RootState } from "./app/app_state/store"

const userData= useSelector((state: RootState)=> state.userData)

const getUserProfileData= ()=> {
    const accessToken= localStorage.get
}

// functions that are needed and important to different parts of the program.
// but this would not make any kind of sense in the first place right ?.