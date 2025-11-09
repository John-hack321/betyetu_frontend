// payloads
export interface StakeJoiningPayload {
    stakeId: number;
    stakeAmount: number;
    placement: string;
}

export interface FetchStakeDataPayload {
    inviteCode: string;
}

export interface StakeInitiatorPayload {
    placement: string;
    stakeAmount: number;
    matchId: number;
    home: string;
    away: string;
}

// api responses
export interface invitedStakeDataApiResponse {
    stakeId: number
    home: string
    away: string
    inviterPlacement: string
    inviterStakeAmount: number
}



interface StakeInviterInterface {
    stakeAmount: number;
    stakePlacement: string;
}

interface StakeInviteeInterface {
    stakeAmount: number;
    stakePlacement: string;
}

export interface CurrentStakeData {
    matchId: number;
    stakeId: number;
    homeTeam: string;
    awayTeam: string;
    ownerStakeAmount: number;
    ownerStakeplacement: string;
    guestStakeAmount: number;
    guestStakePlacement: string;
}

