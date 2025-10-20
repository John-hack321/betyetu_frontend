
export interface CurrentStakeData {
    placement: string; // placement as in where are you placing your money
    amount: number;
    matchId: number;
    homeTeam: string;
    awayTeam: string;
}

/**
 * we add the hometeam and awayteam  to make it easir for vewing the data on the stakePage
 */
export interface MatchIdAndPlacement {
    matchId : number;
    placement : string;
    homeTeam: string;
    awayTeam: string;
}