# Backend prompt — copy/paste into your backend Cursor chat

Use this prompt when you open the **backend repo** to generate a self-loading Faker seed script.

---

## Prompt (copy everything below this line)

```
I need a Python showcase seed script for this FastAPI backend that GENERATES and LOADS dummy data directly into the database in one run — no manual JSON import step.

## Goal
Populate the database with a large, realistic demo dataset so the frontend showcase (Vercel) looks alive when pointed at this API (Render). The script must be runnable as:

    pip install -r scripts/requirements-seed.txt
    python scripts/seed_showcase_data.py

Optional flags:
    --reset          # truncate/clear showcase tables before seeding (with confirmation or --yes)
    --users 50       # number of demo users
    --predictions 40
    --groups 15
    --fixtures 60
    --matches 80
    --trades-per-market 15   # synthetic price history via fake trades

Use **Faker** (`faker`, locale `en_KE` where useful) for names, text, dates, etc.

## What to seed

### 1. Leagues (if not already present)
- Kenya Premier League, Premier League, Bundesliga, La Liga, UCL, AFCON
- Ensure `league_id` FK works for matches

### 2. Match fixtures (home page / pool staking)
~80 records with:
- `home_team`, `away_team` (realistic football names — mix Kenyan teams + European clubs)
- `league_id`, `match_date` (future dates), `status` (mostly `scheduled`, some `live`)
- `home_pool_count`, `away_pool_count`, `draw_pool_count` (random 0–500)
- Enough volume that filters (Live, Top) return results

### 3. Prediction markets (`market_type = prediction`)
~40 binary YES/NO markets:
- Kenyan politics questions (elections, scandals, fuel prices, CBK rates, county governors)
- Categories: `politics`, `general`, `kenya`
- `question`, `description`, `resolution_criteria`, `resolution_source`
- `locks_at`, `resolution_date` (future)
- LMSR / your pricing fields: `q_yes`, `q_no`, `p_yes`, `yes_price`, `no_price`
- `total_collected` (KES 0 – 250,000), `featured` (~8% true)
- `market_status = active`

### 4. Group markets (`market_type = group`)
~15 parent markets with 3–5 sub-markets each:
- e.g. "Who will win the 2027 presidential election?" with candidates (Ruto, Gachagua, Raila, etc.)
- Each sub-market: `option`, `yes_price`/`no_price`, `category = politics`
- Parent: `question`, `locks_at`, `featured` on some

### 5. Fixture prediction markets (`market_type = fixture`)
~60 markets linked to matches or standalone:
- `home_team`, `away_team`, `fixture_id` (if applicable)
- `home_price`, `draw_price`, `away_price` (sum ≈ 1)
- `category = sports` or `football`
- `total_collected`, `locks_at`

### 6. Price history & trades (CRITICAL for charts)
For each prediction and fixture market, insert **10–30 synthetic trades** spread over the last 7–30 days so:
- `GET /prediction_markets/{id}/price_history` returns enough points for Recharts
- `GET /prediction_markets/{id}?market_type=...` includes `price_history` in detail response
- Fields: `created_at`, `yes_price_at_trade` (and for fixtures: `home_price_at_trade`, `draw_price_at_trade`, `away_price_at_trade`), `trade_type`, `side`, `kes_amount`, `shares`

Use a random walk around the current price so charts look realistic.

### 7. Demo users & positions (optional but nice)
- 5–10 demo users with known passwords (document in script README: `demo@peerstake.com` / `Showcase123!`)
- A few open positions across markets for `/prediction_markets/my_positions` or equivalent

### 8. Peer stakes (optional)
- ~20 public stakes (`public = true`) for the anonymous staking page badge count
- ~30 private stakes between demo users

## Implementation requirements

1. **Inspect this codebase first** — use existing SQLAlchemy models, Pydantic schemas, and service functions. Do NOT duplicate business logic; call existing create/market/trade services where possible.

2. **Single entry script** at `scripts/seed_showcase_data.py` that:
   - Reads `DATABASE_URL` from env (same as the app)
   - Opens a DB session
   - Generates data with Faker
   - Inserts via ORM/services in correct FK order (leagues → matches → markets → trades → stakes)
   - Prints summary counts at the end

3. **`scripts/requirements-seed.txt`** with `faker`, and whatever else is needed (likely already in main requirements).

4. **Idempotency**: `--reset` should only clear seed/demo data, not production. Prefer deleting rows tagged `is_demo=True` or in a `showcase` seed namespace if you add a flag; otherwise document which tables are truncated.

5. **No external JSON file required** — the script generates everything in memory and commits.

6. Add a short `scripts/README.md` explaining:
   - How to run locally against dev DB
   - How to run on Render (one-off job or shell: `python scripts/seed_showcase_data.py --yes`)
   - Demo login credentials if created

## API endpoints the frontend calls (must work after seeding)

- `GET /prediction_markets/all_markets` — paginated list, mixed market types
- `GET /prediction_markets/{id}?market_type=prediction|group|fixture`
- `GET /prediction_markets/{id}/price_history`
- `GET /matches` or equivalent fixtures endpoint (home page)
- `GET /prediction_markets/my_positions` (if user logged in)
- Auth: `POST /auth/login` with demo user

## Data volume targets (defaults)
| Entity | Count |
|--------|-------|
| Prediction markets | 40 |
| Group markets | 15 |
| Fixture markets | 60 |
| Match fixtures | 80 |
| Trades (total) | ~800+ |
| Public stakes | 20 |
| Demo users | 10 |

## Style
- Kenyan context (KES, local politics, Gor Mahia, etc.)
- Realistic volumes (some markets at Ksh 0, some at Ksh 13.2K+)
- Mix of market types so the frontend grid shows all card variants

Please implement the script now, wire it to the real models, and verify it runs without errors against the local database.
```

---

## After the backend agent finishes

1. Run the seed on Render (shell or release command)
2. Set Vercel env: `NEXT_PUBLIC_BACKEND_BASE_URL=https://your-api.onrender.com`
3. Log in with demo credentials from `scripts/README.md`
4. Open `/markets` — trending card + grid should be full of data with real charts
