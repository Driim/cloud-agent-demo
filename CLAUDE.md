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
- **Coverage**: `frontend/coverage/` (gitignored in prod, currently committed — consider adding to .gitignore)

### API Endpoints

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/token`, `POST /auth/refresh`, `GET /auth/me` |
| Sessions | `GET /sessions` (cursor pagination, filters: status/repo/user), `GET /sessions/{id}` |
| Analytics | `GET /analytics/overview`, `/timeseries/{metric}`, `/quotas`, `/costs`, `/errors` |
| Team | `GET /analytics/team`, `GET /analytics/team/feed` (SSE) |
| Repos | `GET /analytics/repositories` |

### Connectivity

Frontend Vite dev server proxies `/api` requests to backend at `localhost:8000`. No shared code between frontend and backend.

## Code Style

- **Backend linting**: flake8 (max-line-length=120, max-complexity=15), black, isort (google style)
- **Frontend linting**: ESLint with typescript-eslint, react-hooks, react-refresh plugins
- **TypeScript**: strict mode, no unused locals/parameters
- **Python**: >=3.11, type hints via pydantic models

## Current Status

- Backend: all 5 modules implemented with mock data and tests (~80% coverage)
- Frontend: fully implemented — pages, API layer, components, unit + E2E tests
- No database integration yet (design docs in `clickhouse.md`, `system_design.md`)
- No Docker or CI/CD configuration
