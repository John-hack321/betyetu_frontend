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
    public: boolean;
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

export interface PublicStakesInterface{
    stakeId: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    ownerPlacement: string;
    ownerStakeAmount: number;
    potentialWin: number;
    guestPlacement: string;
    league: number;
    ownerDisplayName: string;
}

// for the sake of the backend some data here will just have to be snake_cased : im a fullstack dev so just bare with it
export interface FetchPublicStakesApiResponseInterface {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    isLoading?: boolean; // we need this here for the sake of frontend purposes though it is not coming from the backend that why it has been kept to be optional 
    data: PublicStakesInterface[];
}