# Agents Dashboard

Full-stack monitoring dashboard for AI coding agents. Tracks sessions, costs, team activity, and repository statistics.

Built with **FastAPI** (backend) and **React + Vite** (frontend). Currently runs on mock data.

## Check demo

Demo is available on [https://demo.cloud_affects.com](https://demo.cloud_affects.com)

## Tech Stack

### Backend

- **Python 3.11+** with **FastAPI**
- **Pydantic v2** for data validation and settings
- **SSE-Starlette** for Server-Sent Events (team activity feed)
- **Poetry** for dependency management
- **pytest + pytest-asyncio** for testing

### Frontend

- **React 18** + **TypeScript** (strict mode)
- **Vite** for dev server and builds
- **Tailwind CSS 4** + **Tremor v3** (charts, KPIs) + **Headless UI**
- **TanStack Query v5** for data fetching and caching
- **TanStack Table** for data grids
- **React Router 7** for routing
- **Vitest** + **Testing Library** for unit/integration tests
- **Playwright** for E2E tests

## Documentation

| Document | Description |
|----------|-------------|
| [system_design.md](system_design.md) | System design for the analytics dashboard — requirements, architecture, data flow, scaling, and trade-offs |
| [api_gateway.md](api_gateway.md) | API gateway design — TLS termination, JWT validation, rate limiting, routing, and WAF |
| [clickhouse.md](clickhouse.md) | ClickHouse implementation reference — Kafka ingestion, SQL schemas, materialized views, and query patterns |
| [STATS_BENCHMARK.md](STATS_BENCHMARK.md) | Benchmark reference for mock data generation — realistic KPI ranges, distributions, and sources |

## Getting Started

### Prerequisites

- Python >= 3.11
- Node.js >= 18
- [Poetry](https://python-poetry.org/docs/#installation)

### Backend

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

The API server starts on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on `http://localhost:5173` and proxies `/api` requests to the backend.

### Run Both

Open two terminals and start each server. The frontend proxies all API calls automatically — no extra configuration needed.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/` | KPI cards, session trends, cost summaries, recent activity |
| Sessions | `/sessions` | Filterable session list with cursor pagination |
| Session Detail | `/sessions/:id` | Individual session timeline, metrics, and logs |
| Costs | `/costs` | Spend trends, cost breakdowns, quota usage |
| Team | `/team` | Team members, activity stats, live SSE feed |

## API Endpoints

All routes are prefixed with `/api/v1`.

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/token`, `POST /auth/refresh`, `GET /auth/me` |
| Sessions | `GET /sessions`, `GET /sessions/{id}` |
| Analytics | `GET /analytics/overview`, `/timeseries/{metric}`, `/quotas`, `/costs`, `/errors` |
| Team | `GET /analytics/team`, `GET /analytics/team/feed` (SSE) |
| Repositories | `GET /analytics/repositories` |

**Mock credentials** (for development):
- Bearer token: `Authorization: Bearer mock.access.token`
- Email: `admin@acme-corp.io` / Password: `mock-password`

## Project Structure

```
agents-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, routers, CORS
│   │   ├── config.py            # Pydantic-settings config
│   │   ├── auth/                # Authentication module
│   │   ├── sessions/            # Sessions CRUD
│   │   ├── analytics/           # Analytics & metrics
│   │   ├── team/                # Team activity
│   │   └── repositories/        # Repository stats
│   ├── tests/                   # pytest-asyncio tests
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── api/                 # Typed API clients
│   │   ├── components/          # Layout, shared, domain components
│   │   ├── hooks/               # Custom hooks (useSSE, etc.)
│   │   ├── pages/               # Page components
│   │   ├── types/               # Shared TypeScript types
│   │   └── utils/               # Formatting & error helpers
│   ├── tests/e2e/               # Playwright E2E specs
│   └── package.json
└── CLAUDE.md                    # AI assistant context
```

Each backend module follows the pattern: `router.py`, `service.py`, `schemas.py`, `mock_data.py`. The service layer abstracts data access, so switching from mock data to a real database only requires changing service files.

## Testing

### Backend

```bash
cd backend
poetry run pytest               # run all tests
poetry run pytest --cov         # with coverage report
```

### Frontend — Unit / Integration

```bash
cd frontend
npm run test:run                # single run
npm run test:coverage           # with coverage report
```

### Frontend — E2E

```bash
cd frontend
npm run test:e2e                # headless
npm run test:e2e:ui             # interactive UI mode
```

## Linting & Formatting

### Backend

```bash
cd backend
poetry run black app/ tests/
poetry run isort app/ tests/
poetry run flake8 app/ tests/
```

### Frontend

```bash
cd frontend
npm run lint
```

## Environment

The backend reads `.env` from `backend/` (optional). All settings have sensible defaults — no env vars are required to run the project.

## License

MIT
