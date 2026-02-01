import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StakeInterface {
    stakeId: number;
    home: string;
    away: string;
    stakeAmount: number;
    stakeStatus: string;
    stakeResult: string;
    date: string;
    possibleWin: string | number;
    inviteCode: string | null;
    placement: string;
    public: boolean;
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