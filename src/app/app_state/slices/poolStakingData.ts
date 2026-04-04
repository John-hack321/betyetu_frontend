import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PoolStakingData {
    poolStakeId: number;
    matchId: number;
    homeTeam: string;
    awayTeam: string;
    userStakeAmount: number;
    userStakeChoice: string;
}

const initialState: PoolStakingData = {
    poolStakeId: 0,
    matchId: 0,
    homeTeam: "",
    awayTeam: "",
    userStakeAmount: 0, // we set the initial value to zero
    userStakeChoice: "",
}

const poolStakingSlice = createSlice({
    name: "poolStakingData",
    initialState,
    reducers: {
        setInitialPoolStakingData: (state, action: PayloadAction<PoolStakingData>) => {
            state.poolStakeId = action.payload.poolStakeId;
            state.matchId = action.payload.matchId;
            state.homeTeam = action.payload.homeTeam;
            state.awayTeam = action.payload.awayTeam;
            state.userStakeChoice = action.payload.userStakeChoice;
        },
        UpdateUserAmountToPoolStakingData: (state, action: PayloadAction<number>) => { // this is for when the user has confirmed that they are going with the stake
            state.userStakeAmount = action.payload;
        },
    },
});

export const { setInitialPoolStakingData, UpdateUserAmountToPoolStakingData } = poolStakingSlice.actions;
export default poolStakingSlice.reducer;
