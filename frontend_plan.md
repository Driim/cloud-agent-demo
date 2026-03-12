# Frontend Implementation Plan: React + Vite + Tremor

## Context

Реализуем frontend для AgentCloud Analytics Dashboard — React SPA на Vite, с Tremor для чартов/KPI и TanStack Table для таблицы сессий. Backend API описан в [backend_plan.md](../../code/agents-dashboard/backend_plan.md). Все 4 страницы дашборда из system_design: Overview, Usage & Costs, Agent Sessions, Team Activity.

## Стек

| Concern | Library |
|---------|---------|
| Build | Vite 6 + React 19 + TypeScript |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Charts & KPI | @tremor/react (Card, Metric, BadgeDelta, AreaChart, BarChart, LineChart, DonutChart, ProgressBar, Callout, SparkAreaChart) |
| Data table | @tanstack/react-table v8 (headless) |
| Styling | Tailwind CSS v3 |
| SSE | EventSource API (native) |

## Структура проекта

```
frontend/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx                      # React root + QueryClientProvider + RouterProvider
│   ├── router.tsx                    # React Router config (4 routes)
│   ├── api/
│   │   ├── client.ts                 # fetch wrapper с baseURL, error handling
│   │   ├── analytics.ts              # useOverview, useTimeseries, useQuotas, useCosts, useErrors
│   │   ├── sessions.ts              # useSessions (paginated), useSession
│   │   ├── team.ts                   # useTeamStats, useActivityFeed (SSE hook)
│   │   └── repositories.ts          # useRepositories
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Sidebar + header + main content
│   │   │   ├── Sidebar.tsx           # Навигация по 4 страницам
│   │   │   └── Header.tsx            # Org name, user avatar, role badge
│   │   │
│   │   ├── shared/
│   │   │   ├── KPICard.tsx           # Переиспользуемый Card + Metric + BadgeDelta
│   │   │   ├── TimeRangeSelector.tsx # 7d | 30d | 90d toggle
│   │   │   ├── StatusBadge.tsx       # completed/merged/failed/timed_out badges
│   │   │   ├── LoadingSkeleton.tsx   # Skeleton для loading state
│   │   │   └── ErrorState.tsx        # Error boundary UI
│   │   │
│   │   ├── overview/
│   │   │   ├── OverviewKPIs.tsx      # 4 KPI карточки (sessions, tokens, spend, PRs)
│   │   │   ├── TokenChart.tsx        # AreaChart (stacked) — input + output tokens
│   │   │   ├── OutcomesDonut.tsx     # DonutChart — session outcomes
│   │   │   ├── TopReposBar.tsx       # BarChart (horizontal) — top repos
│   │   │   └── CostPerPRCard.tsx     # Card + BadgeDelta — cost per merged PR
│   │   │
│   │   ├── costs/
│   │   │   ├── SpendTrend.tsx        # LineChart — daily spend
│   │   │   ├── CostBreakdownDonut.tsx# DonutChart — cost split
│   │   │   ├── CostPerSession.tsx    # LineChart — cost per session trend
│   │   │   ├── TokensPerPR.tsx       # Card + BadgeDelta
│   │   │   ├── QuotasList.tsx        # ProgressBar list
│   │   │   └── BudgetAlerts.tsx      # Callout components
│   │   │
│   │   ├── sessions/
│   │   │   ├── SessionsTable.tsx     # TanStack Table + server-side pagination
│   │   │   ├── SessionDetail.tsx     # Detail view with timeline
│   │   │   ├── DurationDistribution.tsx # BarChart (categorical)
│   │   │   ├── LatencyTrend.tsx      # LineChart — P95
│   │   │   ├── ErrorBreakdown.tsx    # BarChart (stacked)
│   │   │   └── ConcurrentSessions.tsx# ProgressBar + Card
│   │   │
│   │   └── team/
│   │       ├── SessionsPerMember.tsx # BarChart
│   │       ├── TeamLeaderboard.tsx   # TanStack Table
│   │       ├── ActivityFeed.tsx      # SSE-powered live feed
│   │       └── AdoptionRate.tsx      # Card + BadgeDelta
│   │
│   ├── pages/
│   │   ├── OverviewPage.tsx          # Компонует overview/* компоненты
│   │   ├── CostsPage.tsx             # Компонует costs/* компоненты
│   │   ├── SessionsPage.tsx          # Компонует sessions/* компоненты
│   │   └── TeamPage.tsx              # Компонует team/* компоненты
│   │
│   ├── hooks/
│   │   └── useSSE.ts                 # Generic SSE hook (EventSource + reconnection)
│   │
│   └── types/
│       └── api.ts                    # TypeScript типы, соответствующие backend schemas
```

## Страницы и компоненты

### 1. Overview Page (`/`)
```
┌──────────────────────────────────────────────────────┐
│  [Sessions ▲12%] [Tokens ▲8%] [Spend $2.4k] [PRs 47]│  ← 4x KPICard
├───────────────────────┬──────────────────────────────┤
│  Token Consumption    │  Session Outcomes             │  ← AreaChart + DonutChart
│  (stacked area)       │  (donut)                      │
├───────────────────────┴──────────────────────────────┤
│  Top Repositories (horizontal bar)                    │  ← BarChart
├──────────────────────────────────────────────────────┤
│  Cost per Merged PR   [$12.40 ▼5%]                   │  ← KPICard
└──────────────────────────────────────────────────────┘
```

### 2. Usage & Costs Page (`/costs`)
```
┌──────────────────────────────────────────────────────┐
│  Daily Spend Trend (line chart)                       │
├───────────────────────┬──────────────────────────────┤
│  Cost Breakdown       │  Cost per Session             │
│  (donut)              │  (line chart)                 │
├───────────────────────┴──────────────────────────────┤
│  Tokens per PR [$0.34 ▼2%]                           │  ← KPICard
├──────────────────────────────────────────────────────┤
│  Usage Quotas                                         │  ← ProgressBar list
│  Sessions: ████████░░ 78%   Tokens: ██████░░░░ 62%  │
├──────────────────────────────────────────────────────┤
│  ⚠ Budget Alert: 90% of monthly budget consumed       │  ← Callout
└──────────────────────────────────────────────────────┘
```

### 3. Agent Sessions Page (`/sessions`)
```
┌──────────────────────────────────────────────────────┐
│  Concurrent: 12/25  Duration Dist.  P95 Latency      │  ← ProgressBar + BarChart + LineChart
├──────────────────────────────────────────────────────┤
│  Error Breakdown (stacked bar)                        │
├──────────────────────────────────────────────────────┤
│  [Filter: status ▾] [repo ▾] [user ▾]  [Search]      │
│  ┌────────────────────────────────────────────────┐  │
│  │ ID    User    Repo    Task    Status  Dur Cost │  │  ← TanStack Table
│  │ ...   ...     ...     ...     ...     ... ...  │  │
│  │           ◀ 1 2 3 ... 50 ▶   Total: 1,234     │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 4. Team Activity Page (`/team`)
```
┌──────────────────────────────────────────────────────┐
│  Adoption Rate [87% ▲5%]                              │  ← KPICard
├───────────────────────┬──────────────────────────────┤
│  Sessions per Member  │  Activity Feed (live SSE)     │
│  (bar chart)          │  ● alice started session...   │
│                       │  ● bob PR #142 merged...      │
├───────────────────────┴──────────────────────────────┤
│  Team Leaderboard                                     │  ← TanStack Table
│  Name  Sessions  PRs  Success%  Avg Cost              │
└──────────────────────────────────────────────────────┘
```

## Ключевые решения

### 1. API Layer (TanStack Query)
- Каждый endpoint = свой query hook в `api/*.ts`
- `staleTime: 60_000` для analytics (данные не меняются каждую секунду)
- `staleTime: 30_000` для sessions (чаще обновляются)
- Query keys: `["analytics", "overview"]`, `["analytics", "timeseries", metric, range, granularity]`
- Error/loading states обрабатываются единообразно через `LoadingSkeleton` и `ErrorState`

### 2. SSE Hook (`useSSE`)
- Обёртка над `EventSource` с автореконнектом (экспоненциальный backoff)
- Парсит SSE `event` + `data` поля
- Используется в `ActivityFeed.tsx` для `/analytics/team/feed`
- Graceful disconnect при размонтировании компонента

### 3. Routing
4 маршрута в React Router:
- `/` → OverviewPage
- `/costs` → CostsPage
- `/sessions` → SessionsPage (+ `/sessions/:id` → SessionDetail)
- `/team` → TeamPage

### 4. Layout
- Sidebar с навигацией (фиксированная, 240px)
- Header: org name ("Acme Corp"), user email, role badge
- Main content area с responsive grid (Tailwind)

### 5. Shared компоненты
- `KPICard` — унифицированный Card + Metric + BadgeDelta + optional SparkAreaChart
- `TimeRangeSelector` — переиспользуется на Overview и Costs страницах
- `StatusBadge` — цветные бейджи для статусов сессий

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "@tremor/react": "^3.18.0",
    "@headlessui/react": "^2.2.0",
    "@tailwindcss/forms": "^0.5.9",
    "remix-icon": "^4.5.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

## Порядок реализации

1. **Scaffold**: Vite + React + TS, Tailwind config, Tremor setup
2. **Layout**: AppLayout, Sidebar, Header, Router config
3. **API layer**: fetch client, TanStack Query hooks для всех endpoints
4. **Types**: `api.ts` — все типы из backend schemas
5. **Shared**: KPICard, TimeRangeSelector, StatusBadge, LoadingSkeleton, ErrorState
6. **Overview page**: KPIs, TokenChart, OutcomesDonut, TopReposBar, CostPerPRCard
7. **Costs page**: SpendTrend, CostBreakdown, CostPerSession, Quotas, BudgetAlerts
8. **Sessions page**: SessionsTable (TanStack Table + pagination), detail view, charts
9. **Team page**: SessionsPerMember, Leaderboard, ActivityFeed (SSE), AdoptionRate
10. **Smoke test**: dev server, все страницы, SSE подключение

## Verification

```bash
cd frontend && npm run dev
# Открыть http://localhost:5173
# Проверить:
# - Sidebar навигация между 4 страницами
# - Overview: KPI карточки, чарты загружены
# - Costs: тренды, квоты, budget alerts
# - Sessions: таблица с пагинацией, фильтры, клик → detail
# - Team: bar chart, leaderboard, live activity feed (SSE)
# - Loading states (throttle network в DevTools)
# - Error states (остановить backend)
```

## Proxy configuration (Vite → FastAPI)

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```
