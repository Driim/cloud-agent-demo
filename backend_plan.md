# Backend Implementation Plan: FastAPI + Mock Data

## Context

Реализуем backend для AgentCloud Analytics Dashboard на основе [system_design.md](system_design.md). Вместо реального data layer (ClickHouse, PostgreSQL, Redis, Kafka) все данные замоканы статичными фикстурами. Это позволит параллельно разрабатывать frontend и backend, а позже подключить реальные хранилища через замену mock-репозиториев.

## Структура проекта

```
backend/
├── pyproject.toml                    # dependencies: fastapi, uvicorn, pydantic, sse-starlette
├── app/
│   ├── main.py                       # FastAPI app, CORS, router includes
│   ├── config.py                     # Settings via pydantic-settings
│   │
│   ├── auth/
│   │   ├── router.py                 # POST /auth/token, POST /auth/refresh, GET /auth/me
│   │   ├── schemas.py                # TokenRequest, TokenResponse, UserProfile
│   │   ├── dependencies.py           # get_current_user, get_current_org (mock JWT extraction)
│   │   └── mock_data.py              # Фикстуры пользователей и организаций
│   │
│   ├── analytics/
│   │   ├── router.py                 # overview, timeseries/{metric}, quotas, costs, errors
│   │   ├── schemas.py                # OverviewResponse, TimeSeriesPoint, QuotaResponse, etc.
│   │   ├── service.py                # Бизнес-логика (фильтрация/агрегация mock data)
│   │   └── mock_data.py              # KPI, time-series ряды, квоты, costs, errors
│   │
│   ├── sessions/
│   │   ├── router.py                 # GET /sessions, GET /sessions/{id}
│   │   ├── schemas.py                # SessionSummary, SessionDetail, PaginatedResponse
│   │   ├── service.py                # Фильтрация, cursor-based пагинация
│   │   └── mock_data.py              # ~50 сессий с разными статусами
│   │
│   ├── team/
│   │   ├── router.py                 # GET /team, GET /team/feed (SSE)
│   │   ├── schemas.py                # TeamMemberStats, ActivityEvent
│   │   ├── service.py                # Агрегация по участникам
│   │   └── mock_data.py              # Участники команды, активности
│   │
│   └── repositories/
│       ├── router.py                 # GET /repositories
│       ├── schemas.py                # RepositoryStats
│       └── mock_data.py              # Статистика по репозиториям
```

## Endpoints (все под `/api/v1/`)

### Auth
| Method | Path | Response |
|--------|------|----------|
| POST | `/auth/token` | `{ access_token, refresh_token, token_type }` |
| POST | `/auth/refresh` | `{ access_token, refresh_token, token_type }` |
| GET | `/auth/me` | `{ user_id, email, org_id, role, plan }` |

### Analytics
| Method | Path | Query Params | Response |
|--------|------|-------------|----------|
| GET | `/analytics/overview` | — | KPI cards: sessions, tokens, spend, PRs, outcomes, top repos, cost/PR |
| GET | `/analytics/timeseries/{metric}` | `range=7d\|30d\|90d`, `granularity=hour\|day` | `[{ timestamp, value }]` |
| GET | `/analytics/quotas` | — | `[{ name, used, limit, unit }]` |
| GET | `/analytics/costs` | — | Cost breakdown + trends |
| GET | `/analytics/errors` | — | Error type distribution |

### Sessions
| Method | Path | Query Params | Response |
|--------|------|-------------|----------|
| GET | `/sessions` | `status`, `repo`, `user`, `cursor`, `limit` | Paginated list с cursor |
| GET | `/sessions/{id}` | — | Session detail + timeline |

### Team
| Method | Path | Response |
|--------|------|----------|
| GET | `/analytics/team` | Per-member stats |
| GET | `/analytics/team/feed` | SSE stream (sse-starlette) |

### Repositories
| Method | Path | Response |
|--------|------|----------|
| GET | `/analytics/repositories` | Per-repo stats |

## Ключевые решения

### 1. Mock Auth
- `get_current_user` dependency всегда возвращает фиксированного пользователя (`org_admin` роль)
- Токены генерируются, но не валидируются — позже заменится на реальный JWT
- Структура JWT payload соответствует system_design (sub, org_id, role, plan)

### 2. Mock Data — статичные фикстуры
- Каждый модуль имеет `mock_data.py` с предопределёнными данными
- Time-series данные: 30 дней с правдоподобными значениями (seed-based, не random)
- Сессии: ~50 записей с разными статусами (completed, merged, failed, timed_out)
- Все данные привязаны к одной org `org_abc123`

### 3. Cursor-based пагинация (sessions)
- Cursor = `session_id` последнего элемента
- Фильтрация по `status`, `repo`, `user` на mock данных
- Response формат из system_design: `{ data, pagination: { next_cursor, prev_cursor, has_more, limit, approx_total } }`

### 4. SSE для team feed
- `sse-starlette` для `/analytics/team/feed`
- Mock: отдаёт предзаписанные события с интервалом 3 сек
- Event types: `session_started`, `session_completed`, `pr_merged`, `session_failed`

### 5. Repository Pattern (подготовка к реальному data layer)
- `service.py` в каждом модуле — абстракция над данными
- Сейчас читает из `mock_data.py`, позже заменится на вызовы ClickHouse/PostgreSQL
- Никакой прямой зависимости роутеров от mock данных

## Dependencies

```toml
[project]
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.34",
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
    "sse-starlette>=2.0",
]
```

## Порядок реализации

1. **Scaffold**: `pyproject.toml`, `app/main.py`, `app/config.py`
2. **Auth**: mock dependencies, роутер, схемы
3. **Analytics**: overview, timeseries, quotas, costs, errors
4. **Sessions**: list с cursor pagination, detail
5. **Team**: stats, SSE feed
6. **Repositories**: stats
7. **Smoke test**: запуск uvicorn, проверка всех эндпоинтов

## Verification

```bash
cd backend && uvicorn app.main:app --reload --port 8000
# Проверить:
# GET  http://localhost:8000/api/v1/auth/me
# GET  http://localhost:8000/api/v1/analytics/overview
# GET  http://localhost:8000/api/v1/analytics/timeseries/tokens?range=7d&granularity=day
# GET  http://localhost:8000/api/v1/sessions?limit=10
# GET  http://localhost:8000/api/v1/sessions/sess_001
# GET  http://localhost:8000/api/v1/analytics/team
# GET  http://localhost:8000/api/v1/analytics/repositories
# curl http://localhost:8000/api/v1/analytics/team/feed  (SSE stream)
# GET  http://localhost:8000/docs  (Swagger UI)
```
