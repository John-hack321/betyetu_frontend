
export interface StakeInitiatorPayload {
    placement: string;
    stakeAmount: number;
    matchId: number;
    home: string;
    away: string;
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
    stakeOwner: StakeInviterInterface;
    stakeGuest: StakeInviteeInterface;
}

export interface invitedStakeDataApiResponse {
    stakeId: number
    home: string
    away: string
    inviterPlacement: string
    inviterStakeAmount: number
}