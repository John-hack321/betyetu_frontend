export interface PoolStakesInterface{
    id: number;
    match_id: number;
    league_id: number;
    stake_status: string;
    locks_at: string;
    resolution_date: string;
    outcome: string; // we wil find a way to do matching of these directly from the backend so that the frnotend has an easy time
    pool_amount: number;
    home_pool: number;
    away_pool: number;
    draw_pool: number;
    home_pool_count: number;
    away_pool_count: number;
    draw_pool_count: number;
    home_team: string;
    away_team: string;
}


export interface FetchPoolStakesApiResponseInterface {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    isLoading?: boolean; // we need this here for the sake of frontend purposes though it is not coming from the backend that why it has been kept to be optional 
    data: PoolStakesInterface[];
}