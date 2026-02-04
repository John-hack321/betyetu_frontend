import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// the stake data here is defined for the stake data only okay

export interface StakeInterface {
    stakeId: number;
    home: string;
    away: string;
    stakeAmount: number; // this is the owner stake amount
    stakeStatus: string;
    stakeResult: string;
    date: string;
    possibleWin: string | number;
    inviteCode: string | null;
    placement: string; // this is the owner placement
    public: boolean;
    matchId: number;

}

export interface StakesListDataInterface {
    stakesList: StakeInterface[]
}

const initialState: StakesListDataInterface= {
    stakesList: [] // initial state is an empty list
}

const stakesDataSlice= createSlice({
    name: "stakesData",
    initialState,
    reducers: {
        setStakesData: (state, action: PayloadAction<StakeInterface[]>)=> {
            state.stakesList= action.payload
        },
    },
    extraReducers: (builder)=> {}
})

export default stakesDataSlice.reducer;
export const {setStakesData}= stakesDataSlice.actions;