
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
}

export interface AllFixturesApiResponse {
    page : number;
    limit : number;
    total : number;
    total_page : number;
    has_next_page : boolean
    data : Fixture[]
}
