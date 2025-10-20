
export interface CurrentStakeData {
    placement: string; // placement as in where are you placing your money
    amount: number;
    userId: number;
    matchId: number;
}

export interface MatchIdAndPlacement {
    matchId : number;
    placement : string;
}