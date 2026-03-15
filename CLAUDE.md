# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agents Dashboard — full-stack monitoring dashboard for AI coding agents. Tracks sessions, costs, team activity, and repository stats. Backend serves mock data (database integration pending).

## Commands

### Backend (FastAPI + Poetry)

```bash
cd backend
poetry install                              # install deps
poetry run uvicorn app.main:app --reload    # dev server on :8000
poetry run pytest                           # run all tests
poetry run pytest tests/test_sessions.py    # single test file
poetry run pytest -k "test_list_sessions"   # single test by name
poetry run pytest --cov                     # with coverage
poetry run black app/ tests/               # format
poetry run isort app/ tests/               # sort imports
poetry run flake8 app/ tests/              # lint
```

### Frontend (React + Vite + npm)

```bash
cd frontend
npm install                  # install deps
npm run dev                  # dev server on :5173 (proxies /api → :8000)
npm run build                # tsc + vite build
npm run lint                 # eslint
npm test                     # vitest watch mode
npm run test:run             # vitest single run
npm run test:coverage        # vitest + coverage report
npm run test:e2e             # playwright E2E tests
npm run test:e2e:ui          # playwright with UI mode
```

### Docker

```bash
docker build -t agents-dashboard .        # multi-stage build (frontend + backend)
docker run -p 8000:8000 agents-dashboard  # serves everything on :8000
```

## Architecture

### Backend (`backend/`)

FastAPI app with modular domain structure. Each module has `router.py`, `service.py`, `schemas.py`, `mock_data.py`.

- **Entry**: `app/main.py` — mounts routers, CORS middleware
- **Config**: `app/config.py` — pydantic-settings, env-based
- **Auth**: `app/auth/` — mock bearer token auth via `dependencies.py` (`get_current_user`)
- **Modules**: `sessions/`, `analytics/`, `team/`, `repositories/` — each self-contained
- **All routes** prefixed `/api/v1`
- **Tests**: `tests/` — pytest-asyncio, AsyncClient fixture in `conftest.py`

Service layer abstracts data access — when replacing mock data with a real DB, only service files change.

### Frontend (`frontend/`)

React 18 + Vite + TypeScript (strict mode).

- **Routing**: `router.tsx` — React Router 7, routes: `/`, `/costs`, `/sessions`, `/sessions/:id`, `/team`
- **Layout**: `components/layout/` — AppLayout with fixed Sidebar (60px) + Header (56px)
- **Pages**: `pages/` — fully implemented: Overview, Sessions, SessionDetail, Costs, Team
- **API layer**: `src/api/` — typed clients per domain (sessions, analytics, team, repositories)
- **Types**: `src/types/api.ts` — shared API response types
- **Utils**: `src/utils/` — format helpers, error utilities
- **Hooks**: `src/hooks/` — useSSE (Server-Sent Events for team feed)
- **State**: TanStack Query v5 configured in `main.tsx` (staleTime: 60s, retry: 1)
- **UI stack**: Tremor (charts/KPIs), TanStack Table (data grids), Tailwind CSS 4, Headless UI, Remixicon

### Testing (`frontend/`)

- **Unit/integration**: Vitest + Testing Library, config in `vitest.config.ts`, setup in `src/test/setup.ts`
- **E2E**: Playwright, config in `playwright.config.ts`, specs in `tests/e2e/`, Page Object pattern
- **Coverage**: `frontend/coverage/` (gitignored)

### API Endpoints

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/token`, `POST /auth/refresh`, `GET /auth/me` |
| Sessions | `GET /sessions` (cursor pagination, filters: status/repo/user), `GET /sessions/{id}` |
| Analytics | `GET /analytics/overview`, `/timeseries/{metric}`, `/quotas`, `/costs`, `/errors` |
| Team | `GET /analytics/team`, `GET /analytics/team/feed` (SSE) |
| Repos | `GET /analytics/repositories` |
| Health | `GET /health` (no auth required) |

### Connectivity

Frontend Vite dev server proxies `/api` requests to backend at `localhost:8000`. No shared code between frontend and backend.
In production (Docker), frontend is built into `./static/` and served by FastAPI via `StaticFiles` mount at `/` with `html=True` for SPA routing.

## UI / Theming

### Dark Theme
- Background: `#0A0A0A`, cards: `bg-neutral-900` with glassmorphism border `border-neutral-800`
- Fonts: Inter (UI), JetBrains Mono (code/numbers) — loaded via `index.html`
- Recharts/Tremor dark overrides live in `frontend/src/index.css`

### Tremor v3 + Tailwind CSS v4 — safelist required
Tremor generates dynamic class names (`fill-blue-500`, `stroke-violet-500`, etc.) at runtime;
Tailwind v4 can't detect them during content scanning.
Fix: `frontend/src/tremor-safelist.txt` + `@source "../src/tremor-safelist.txt"` in `index.css`.
Add new classes here if charts lose color after a Tremor upgrade.

### Chart Color Semantics

- **Session/performance metrics** → `orange` (primary brand color): sessions, duration, latency, repos, tokens
- **Cost/spend metrics** → `violet` (secondary): spend trend, cost per session, cost breakdown (lead color)
- **Errors** → `red`: error breakdown
- **Success** → `emerald`: completed/merged outcomes
- Multi-series charts (TokenChart, OutcomesDonut) use combination per series meaning

### Chart Tooltips
All Tremor charts use `customTooltip={ChartTooltip}` from `src/components/shared/ChartTooltip.tsx`.
Pass `valueFormatter` prop for custom formatting. Do NOT use default Tremor tooltips — they ignore dark theme.

## Environment

Backend reads `.env` from `backend/` (optional, all settings have defaults). No required env vars — runs out of the box.

**Mock auth credentials** (for manual API testing):
- Email: `admin@acme-corp.io`, Password: `mock-password`
- Bearer token (shortcut): `Authorization: Bearer mock.access.token`

## Code Style

- **Backend linting**: flake8 (max-line-length=120, max-complexity=15), black, isort (google style)
- **Frontend linting**: ESLint with typescript-eslint, react-hooks, react-refresh plugins
- **TypeScript**: strict mode, no unused locals/parameters
- **Python**: >=3.11, type hints via pydantic models

## Gotchas

### FastAPI

- `status.HTTP_422_UNPROCESSABLE_ENTITY` is deprecated — use `HTTP_422_UNPROCESSABLE_CONTENT` instead.
- Query params named `range` shadow Python built-in — use `range_` with `Query(alias="range")`.

### Testing Library + Tremor
Tremor renders numeric values in separate `<span>` nodes. `getByText('15/15 members active')` will fail.
Use regex for text with embedded numbers: `getByText(/members active/)` + separate `getByText('15/15')`.

## Current Status

- No database integration yet (design docs in `clickhouse.md`, `system_design.md`)
- Docker deployment configured (`Dockerfile` — multi-stage: Node 20 build + Python 3.11 runtime)
- No CI/CD configuration yet
