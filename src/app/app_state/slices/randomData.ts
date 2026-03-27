import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface RandomData {
    isMenuButtonClicked: boolean
}

const initialState : RandomData = {
    isMenuButtonClicked: false,
}

const randomDataSlice = createSlice({
    name: "randomData",
    initialState,
    reducers: {
        // define the reducers for all the different data types here
        setMenuButtonToclicked: (state)=> { // no need for payload
            state.isMenuButtonClicked = true
        },
        resetMenuButtonClicked: (state)=> {
            state.isMenuButtonClicked= false
        }
    },
    extraReducers: (builder)=> {}
})

export default randomDataSlice.reducer;
export const {
    setMenuButtonToclicked,
    resetMenuButtonClicked
} = randomDataSlice.actions;



// this is just for any other random data that follows no structure at all in the code eg. the meny button clicked value holder 
// it one thing that we need system wide to know when the meny is clicked but it follows no structure so just in case we 
// encounter another one like this we will have to create a new slice but with this approach we will not have to create a new 
// slice and overload our code with many files , now what we do is just to add on the current random data slice and grow it 
// as we add more and more data that we need to to cover in the codebase and is not structure