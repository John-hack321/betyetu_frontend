import { createSlice } from "@reduxjs/toolkit";
// i built this while learning redux at the same time so alot of comments might be so werid in the files 

interface UserProfileData {
    username: string;
    email: string;
    phone: string;
    account_balance: number;
}

// note : the interface and the initial state actulay define the structure of the state of the reducer
// and for each state we have to define its slice just as we have done down there for the userProfileData
const initialState : UserProfileData = {
    username : "name",
    email : "example@gmail.com",
    phone : "0000000000",
    account_balance : 0,
};

// we can then have as many slices as possible with each having its own individual pieces of state 

// we now need to define the actual reducers now 
const userDataSlice = createSlice({
    name: "userProfileData",
    initialState,
    reducers: {
        incrementAccountByOne: (state) => {
            state.account_balance += 1;
        },
        decrementAccountByOne: (state) => {
            state.account_balance -= 1;
        },
    },
})

// we will then need to have actions to trigger the reducers right and redux toolkit does the heavy lifting for us and all we have to do is : 
export const {incrementAccountByOne , decrementAccountByOne} = userDataSlice.actions;
export default userDataSlice.reducer;