#!/usr/bin/env python3
"""
Generate dummy showcase data for PeerStake / Betyetu backend.

Run against your local or deployed API after seed endpoints exist, or adapt
the payload builders to insert directly into your database layer.

Usage:
  pip install -r scripts/requirements.txt
  python scripts/generate_showcase_data.py --api-url http://localhost:8001 --token YOUR_JWT

This script is intended for the BACKEND repo. It lives here as reference for
the showcase branch while the API seeding layer is being wired up.
"""

from __future__ import annotations

import argparse
import random
from datetime import datetime, timedelta, timezone

from faker import Faker

fake = Faker("en_KE")

# ─── Kenyan / sports themed pools ───────────────────────────────────────────

POLITICS_QUESTIONS = [
    "Will the government arrest the oil scandal suspects before {date}?",
    "Will the opposition file an impeachment motion before {date}?",
    "Will fuel prices drop below KES 150 before {date}?",
    "Will the CBK cut interest rates before {date}?",
    "Will a new county governor be elected in {county} before {date}?",
    "Will Parliament pass the Finance Bill amendments before {date}?",
]

ELECTION_OPTIONS = [
    ["William Ruto", "Rigathi Gachagua", "Raila Odinga", "Kalonzo Musyoka"],
    ["Jubilee", "UDA", "ODM", "Wiper"],
]

FOOTBALL_TEAMS = [
    ("Gor Mahia", "AFC Leopards"),
    ("Tusker FC", "Bandari FC"),
    ("Kakamega Homeboyz", "Kariobangi Sharks"),
    ("Bayern München", "VfB Stuttgart"),
    ("Arsenal", "Chelsea"),
    ("Real Madrid", "Barcelona"),
    ("Manchester City", "Liverpool"),
    ("PSG", "Marseille"),
]

LEAGUES = ["Kenya Premier League", "Premier League", "Bundesliga", "La Liga", "UCL", "AFCON"]

CATEGORIES = ["politics", "sports", "football", "kenya", "general"]


def random_future(days_min: int = 3, days_max: int = 90) -> str:
    dt = datetime.now(timezone.utc) + timedelta(days=random.randint(days_min, days_max))
    return dt.isoformat()


def build_prediction_market() -> dict:
    date = fake.date_between(start_date="+7d", end_date="+60d").strftime("%d %B %Y")
    template = random.choice(POLITICS_QUESTIONS)
    question = template.format(date=date, county=random.choice(["Nairobi", "Mombasa", "Kisumu"]))
    yes = round(random.uniform(0.15, 0.85), 2)
    return {
        "market_type": "prediction",
        "question": question,
        "description": fake.paragraph(nb_sentences=3),
        "category": random.choice(["politics", "general", "kenya"]),
        "locks_at": random_future(),
        "resolution_date": random_future(60, 120),
        "resolution_source": fake.url(),
        "yes_price": yes,
        "no_price": round(1 - yes, 2),
        "total_collected": random.randint(0, 250_000),
        "featured": random.random() < 0.08,
    }


def build_group_market() -> dict:
    options = random.choice(ELECTION_OPTIONS)
    sub_markets = []
    remaining = 1.0
    for i, option in enumerate(options):
        if i == len(options) - 1:
            yes = round(remaining, 2)
        else:
            yes = round(random.uniform(0.1, remaining - 0.1 * (len(options) - i - 1)), 2)
            remaining -= yes
        sub_markets.append({
            "option": option,
            "category": "politics",
            "yes_price": yes,
            "no_price": round(1 - yes, 2),
            "total_collected": random.randint(0, 80_000),
        })
    return {
        "market_type": "group",
        "question": random.choice([
            "Who will win the 2027 presidential election?",
            "Which party will win the most seats in 2027?",
            "Who will be the next Nairobi governor?",
        ]),
        "description": fake.paragraph(nb_sentences=2),
        "category": "politics",
        "locks_at": random_future(30, 365),
        "resolution_date": random_future(400, 500),
        "sub_markets": sub_markets,
        "featured": random.random() < 0.05,
    }


def build_fixture_market() -> dict:
    home, away = random.choice(FOOTBALL_TEAMS)
    home_p = round(random.uniform(0.2, 0.55), 2)
    away_p = round(random.uniform(0.15, 0.45), 2)
    draw_p = round(max(0.05, 1 - home_p - away_p), 2)
    total = home_p + draw_p + away_p
    return {
        "market_type": "fixture",
        "question": f"{home} vs {away}",
        "home_team": home,
        "away_team": away,
        "category": random.choice(["sports", "football"]),
        "league": random.choice(LEAGUES),
        "locks_at": random_future(1, 14),
        "resolution_date": random_future(14, 21),
        "home_price": round(home_p / total, 2),
        "draw_price": round(draw_p / total, 2),
        "away_price": round(away_p / total, 2),
        "total_collected": random.randint(500, 500_000),
        "featured": random.random() < 0.1,
    }


def build_match_fixture() -> dict:
    """Peer-to-peer match fixture (home page pool staking)."""
    home, away = random.choice(FOOTBALL_TEAMS)
    return {
        "home_team": home,
        "away_team": away,
        "league_id": random.randint(1, 12),
        "match_date": random_future(1, 21),
        "status": random.choice(["scheduled", "scheduled", "scheduled", "live"]),
        "home_pool_count": random.randint(0, 500),
        "away_pool_count": random.randint(0, 500),
        "draw_pool_count": random.randint(0, 200),
    }


def generate_batch(
    n_predictions: int = 40,
    n_groups: int = 15,
    n_fixtures: int = 60,
    n_matches: int = 80,
) -> dict:
    return {
        "prediction_markets": [build_prediction_market() for _ in range(n_predictions)],
        "group_markets": [build_group_market() for _ in range(n_groups)],
        "fixture_markets": [build_fixture_market() for _ in range(n_fixtures)],
        "matches": [build_match_fixture() for _ in range(n_matches)],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "predictions": n_predictions,
            "groups": n_groups,
            "fixtures": n_fixtures,
            "matches": n_matches,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate PeerStake showcase dummy data")
    parser.add_argument("--api-url", default="http://localhost:8001", help="Backend base URL")
    parser.add_argument("--token", default="", help="Admin JWT (optional)")
    parser.add_argument("--output", default="showcase_data.json", help="Write JSON to file")
    parser.add_argument("--predictions", type=int, default=40)
    parser.add_argument("--groups", type=int, default=15)
    parser.add_argument("--fixtures", type=int, default=60)
    parser.add_argument("--matches", type=int, default=80)
    args = parser.parse_args()

    data = generate_batch(args.predictions, args.groups, args.fixtures, args.matches)

    import json
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Wrote {args.output}")
    print(f"  prediction markets: {args.predictions}")
    print(f"  group markets:      {args.groups}")
    print(f"  fixture markets:    {args.fixtures}")
    print(f"  match fixtures:     {args.matches}")
    print()
    print("Next: wire this payload into your backend seed script or POST to admin seed endpoints.")

    if args.token:
        try:
            import requests
            headers = {"Authorization": f"Bearer {args.token}"}
            r = requests.post(f"{args.api_url}/admin/seed", json=data, headers=headers, timeout=30)
            print(f"API seed response: {r.status_code}")
        except Exception as e:
            print(f"API seed skipped/failed: {e}")


if __name__ == "__main__":
    main()
