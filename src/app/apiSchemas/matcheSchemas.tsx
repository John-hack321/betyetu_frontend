import { fetchInternalImage } from "next/dist/server/image-optimizer";

// for now we will use snake case for the sake of the backend which sends the data in snake case format
export interface Fixture {
    match_id : number;
    match_date : string;
    league_id : number;
    league_name : string;
    league_logo_url : string;
    home_team_id : number;
    home_team : string;
    away_team_id : number;
    away_team : string;
    is_match_live?: boolean;
    score_string?: string;
}

export interface AllFixturesApiResponse {
    no_of_public_stakes: number; // we have fixed this here on the fixtures data so as to avoid doing too many request to the backend even for simple data
    page : number;
    limit : number;
    total : number;
    total_page : number;
    has_next_page : boolean;
    data : Fixture[];
}

export interface AllFixturesReduxStoreInterface {
    no_of_public_stakes: number;
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    data: Fixture[];
    isLoading: boolean;
    hasReachedEnd: boolean;
}
