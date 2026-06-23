# PeerStake / Betyetu — Frontend (Showcase Branch)

> **This repository is a showcase / vetting build.** It demonstrates UI, prediction-market flows, and peer-to-peer staking UX. It is **not** production-ready. Deploy on Vercel (frontend) + Render (backend) for demos only.

## What is this?

PeerStake (branded **betyetu** in some screens) is a Kenyan-focused platform combining:

- **Peer-to-peer match staking** — friends stake on football outcomes in private or public pools
- **Prediction markets** — Polymarket-style YES/NO shares on politics, sports, and events
- **Fixture markets** — three-way Home / Draw / Away prediction markets on real matches
- **Group markets** — multi-candidate elections and multi-outcome events

This frontend is built with **Next.js 15**, **React 19**, **Redux Toolkit**, **Tailwind CSS 4**, and **Recharts**.

---

## Showcase demo URLs (configure before deploy)

| Service  | Platform | Env variable |
|----------|----------|--------------|
| Frontend | Vercel   | `NEXT_PUBLIC_BACKEND_BASE_URL` → your Render API URL |
| Backend  | Render   | (separate repo) |

```bash
cp .env.example .env.local   # if present
# Set NEXT_PUBLIC_BACKEND_BASE_URL=https://your-api.onrender.com

npm install
npm run dev                  # http://localhost:3000
npm run build
```

---

## What's implemented (showcase-ready)

### Core flows
- [x] Auth — login, signup, forgot/reset password
- [x] Home — match fixtures list with league filters and infinite scroll
- [x] **Markets list** — prediction, group, and fixture market cards
- [x] **Market detail** — price charts (Recharts), buy/sell trade sheets, rules & context
- [x] **Positions** — portfolio summary and open/settled positions
- [x] Peer staking — create stakes, invite links, QR codes, anonymous/public stakes
- [x] Dashboard, profile, bet history (stakes page)
- [x] Mobile-first bottom navigation
- [x] **Desktop responsive markets** — Polymarket-style grid, featured trending card, side navigation

### Market types
| Type | Description |
|------|-------------|
| `prediction` | Binary YES/NO question with probability gauge |
| `group` | Parent market with multiple sub-options (e.g. election candidates) |
| `fixture` | Home / Draw / Away on a football match |

### Desktop layout (markets)
- Left sidebar navigation (lg+)
- Featured **trending** market banner at top of grid
- 2-column grid (lg) → 3-column grid (xl)
- Right sidebar with category quick-filters
- Mobile layout unchanged — same card design as before

### Desktop layout (market detail)
- Chart + content in center column
- Sticky **Trade** panel on the right (Buy Yes/No or Home/Draw/Away)
- Mobile keeps bottom buy bar + trade bottom sheet

---

## What's NOT done yet

These are intentionally incomplete or stubbed — do not expect them in the showcase:

| Feature | Status | Notes |
|---------|--------|-------|
| **Redis** | Not integrated | Caching, rate limiting, session store planned for backend |
| **WebSockets / Socket.IO** | Stub only | `src/app/sockets_logic/socket_service.ts` points to `localhost:8001`; real-time price/trade updates not wired |
| **Live market prices** | Polling / on-load only | No push updates when others trade |
| **Deposit / payments** | UI button only | No M-Pesa or card integration in frontend |
| **Market resolution admin** | Backend concern | Frontend displays resolved state when API returns it |
| **Pool staking toggle** | Commented out | Pool markets UI exists but is disabled on home page |
| **Full filter tabs** | Partial | Kenya, Premier League, UCL, Live, Closing soon filters need backend league/live data |
| **PWA offline** | Partial | `next-pwa` configured but not fully tested |
| **E2E tests** | Minimal | Jest unit setup only |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js App (Vercel)                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Pages/Routes│  │ Redux Store  │  │ API clients   │ │
│  │ /markets    │  │ userData     │  │ axios + JWT   │ │
│  │ /main       │  │ matchData    │  │ in localStorage│ │
│  │ /stakes     │  │ marketData   │  └───────┬───────┘ │
│  └─────────────┘  └──────────────┘          │         │
└──────────────────────────────────────────────│─────────┘
                                               │ HTTPS
┌──────────────────────────────────────────────▼─────────┐
│  FastAPI Backend (Render) — separate repo              │
│  REST API · JWT auth · PostgreSQL · (Redis TBD)        │
│  LMSR / pool pricing · market CRUD · trade execution   │
└────────────────────────────────────────────────────────┘
```

### Key frontend paths

| Path | Purpose |
|------|---------|
| `src/app/markets/page.tsx` | Markets grid (mobile + desktop) |
| `src/app/markets/[id]/page.tsx` | Market detail, charts, trade sheets |
| `src/app/markets/posititions/page.tsx` | User positions |
| `src/app/main/page.tsx` | Home / fixtures |
| `src/app/api/predictionMarket.ts` | Markets API client |
| `src/app/components/marketsDesktopSidebar.tsx` | Desktop nav for market flows |
| `src/app/components/desktopTradePanel.tsx` | Desktop buy panel |

### State management
Redux slices per domain: `userData`, `matchData`, `predictionMarketData`, `stakingData`, `poolMarketData`, etc. Persisted via `redux-persist` (auth token in `localStorage`).

---

## Dummy / showcase data

A Python script is included for generating large volumes of demo data (markets, matches, politics questions, football fixtures):

```bash
pip install -r scripts/requirements.txt
python scripts/generate_showcase_data.py --output showcase_data.json
```

Default batch: **40** prediction markets, **15** group markets, **60** fixture markets, **80** match fixtures.

Wire the output into your **backend** seed layer (this script is reference — the API ingestion lives in the backend repo).

---

## Deployment checklist

### Vercel (frontend)
1. Connect this repo / showcase branch
2. Set `NEXT_PUBLIC_BACKEND_BASE_URL` to Render API URL
3. Build command: `npm run build`
4. Output: Next.js default

### Render (backend — separate repo)
1. Deploy API service
2. Run DB migrations
3. Run seed script with `scripts/generate_showcase_data.py` output
4. Set CORS to allow your Vercel domain

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Charts | Recharts |
| State | Redux Toolkit, redux-persist |
| Forms | react-hook-form + Zod |
| HTTP | Axios |
| Real-time | Socket.IO client (not connected) |
| PWA | next-pwa |

---

## Screenshots / reference

Reference UI mocks are in `public/`:
- `markets_page.jpg` — mobile markets list
- `market_detail_page.jpg` — mobile market detail with chart
- `Selection_439.png` — home / fixtures mobile view

---

## Branch note

This work lives on a **showcase branch** derived from `main`/`master`. For vetting, reviewers should use the deployed demo URLs rather than local-only setup when possible.

---

## License / contact

Private project — showcase for capability review. Not licensed for redistribution.
