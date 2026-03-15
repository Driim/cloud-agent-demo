# AgentCloud: Organization Analytics Dashboard

## 1. Product Context

AgentCloud is a platform that lets engineering teams run AI coding agents in the cloud — similar to [Claude Code on the web](https://www.anthropic.com/news/claude-code-on-the-web). Engineers submit coding tasks (bug fixes, refactors, feature scaffolding), and sandboxed agents execute them autonomously, producing pull requests as output.

This document defines the system design and a production-ready implementation of a **customer-facing organizational analytics dashboard** — the control plane where engineering managers and platform teams monitor agent usage, costs, team productivity, and system health.

---

## 2. System Architecture

### 2.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                 │
│  React SPA · Tremor (charts/KPI) · TanStack Table · Tailwind CSS       │
│  Auth tokens in httpOnly cookies  ·  SWR/React Query for data fetching │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTPS (TLS 1.3)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                              │
│  Load Balancer  ·  Rate Limiter (per org/tier)    │
│  JWT Validation  ·  Request Routing  ·  TLS Termination                │
│  WAF (OWASP rules)  ·  API Versioning (/api/v1/, /api/v2/)            │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│   AUTH SERVICE   │ │ ANALYTICS SVC   │ │  SESSION SVC     │
│  (fastapi-users  │ │                 │ │                  │
│  + fastapi-sso)  │ │ KPI aggregation │ │ Session CRUD     │
│                  │ │ Time-series API │ │ Status tracking  │
│ OAuth2/OIDC IdP  │ │ Quota checks    │ │ Duration/cost    │
│ JWT issue/verify │ │ Cost compute    │ │ Filtering/search │
│ RBAC enforcement │ │ (OpenMeter opt) │ │                  │
│ Refresh rotation │ │                 │ │                  │
└────────┬─────────┘ └────────┬────────┘ └────────┬─────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────┐  ┌───────────────────┐  │
│  │ ClickHouse    │  │ PostgreSQL   │  │ Redis │  │ Kafka             │  │
│  │               │  │              │  │       │  │                   │  │
│  │ Metrics &     │  │ Users, Orgs  │  │ Cache │  │ Agent telemetry   │  │
│  │ time-series   │  │ Sessions     │  │ (TTL) │  │ events (direct    │  │
│  │ Kafka Engine  │  │ Repos, PRs   │  │       │  │ ClickHouse        │  │
│  │ AggregatingMT │  │              │  │       │  │ Kafka Engine      │  │
│  │ argMax dedup  │  │              │  │       │  │ ingestion)        │  │
│  └──────────────┘  └──────────────┘  └───────┘  │ · billing-meter   │  │
│                                                   │ · alert-evaluator │  │
│                                                   └───────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Centrifugo (real-time gateway)                                   │   │
│  │ WebSocket + SSE · JWT auth · Redis-backed scaling                │   │
│  │ Server-side publish API · Auto-reconnection · Message recovery   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Grafana Alerting (infra/SRE alerts)                              │   │
│  │ ClickHouse data source · Visual rule editor · Notification       │   │
│  │ routing (Slack, PagerDuty, email) · Alert silencing              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AGENT INFRASTRUCTURE                               │
│  Sandboxed containers (Firecracker/gVisor)  ·  GitHub proxy             │
│  Isolated execution per session  ·  Telemetry emitter (→ Kafka)         │
│  Resource limits (CPU, memory, network, time)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Layers

| Layer | Components | Key Libraries | Responsibility |
|---|---|---|---|
| **Client** | React SPA, Tailwind CSS | Tremor (charts/KPI), TanStack Table, SWR/React Query | Renders dashboard with pre-built analytics components, client-side caching |
| **Auth** | OAuth2/OIDC IdP, JWT, RBAC | fastapi-users, fastapi-sso (GitHub/Google) | User management, JWT issue/verify (RS256), refresh rotation, RBAC |
| **API Gateway** | Rate Limiter, WAF | (per org/tier rate limiting) | Single entry point for all client traffic: TLS termination, JWT validation, per-org rate limiting, WAF, and API versioning. Decouples security and routing concerns from backend services. See [api_gateway.md](api_gateway.md) for the full design. |
| **Backend** | FastAPI microservices | sse-starlette, pydantic, clickhouse-connect | Analytics aggregation, session management, billing metering, quota enforcement |
| **Data** | ClickHouse, PostgreSQL, Redis, Kafka | clickhouse-connect (or asynch), asyncpg | Kafka Engine direct ingestion, AggregatingMergeTree with argMax deduplication, application-level multi-tenancy, event streaming |
| **Real-time** | Centrifugo | centrifugo (Apache 2.0) | WebSocket + SSE gateway with JWT auth, Redis-backed scaling, server-side publish API |
| **Alerting** | Two-track alerting | Grafana Alerting + custom evaluator | Business alerts (budget thresholds) via custom consumer; infra/SRE alerts via Grafana |
| **Metering** | Usage metering | OpenMeter (optional) or custom | Token consumption tracking, quota enforcement, cost computation |
| **Agent Infra** | Sandboxed containers, GitHub proxy | — | Isolated execution environments, telemetry emission to Kafka |

> **API Gateway**: The gateway is the single entry point for all client traffic — it handles TLS termination, JWT validation, rate limiting, WAF, and request routing before any backend service is reached. For the chosen solution, configuration details, and alternative options (Kong, KrakenD, Apigee, AWS API Gateway), see [api_gateway.md](api_gateway.md).

### 2.3 Data Aggregation Pipeline

Raw agent telemetry flows through a fully asynchronous pipeline before reaching the dashboard:

```
Agent Sandbox                    Kafka                     ClickHouse
┌─────────────┐    emit     ┌──────────────┐   Kafka     ┌────────────────────┐
│ Code exec   │───────────▶ │ agent.events │────Engine──▶│ sessions_raw       │
│ Token usage │             │ agent.tokens │             │     │               │
│ PR creation │             │ agent.status │             │     ▼ (Materialized │
│ Errors      │             └──────────────┘             │       View)        │
└─────────────┘                    │                     │ sessions_aggregated│
                                   │                     │ (AggregatingMT)    │
                          ┌────────┴────────┐            │ argMax dedup       │
                          ▼                 ▼            └────────────────────┘
                  ┌──────────────┐  ┌──────────────┐
                  │billing-meter │  │alert-evaluator│          ┌──────────┐
                  │ (cost calc)  │  │              │           │ Grafana  │
                  │              │  │ Business:     │           │ Alerting │
                  │ OpenMeter    │  │  budget 75/90 │           │          │
                  │ (optional)   │  │  /100%        │           │ Infra:   │
                  └──────────────┘  └──────────────┘           │  P95 lat │
                                                               │  lag     │
                                          ┌───publish────▶     │  errors  │
                                          │                    └──────────┘
                                    Centrifugo
                                    (real-time)
                                          │
                                     SSE / WebSocket
                                          │
                                          ▼
                                    React Dashboard
```

**ClickHouse Kafka Engine** consumes Kafka topics directly — no Python worker processes are required for ingestion. ClickHouse pulls messages, writes them to raw `MergeTree` tables, and Materialized Views continuously maintain aggregated state. This eliminates an entire tier of infrastructure (the `metrics-writer` consumer).

**Deduplication via `argMax`**: ClickHouse's `AggregatingMergeTree` with `argMaxState` resolves duplicate events by keeping the latest value for each `(org_id, session_id)` key, based on `created_at`. This avoids heavy locking or `FINAL` modifiers. For billing idempotency, the `billing-meter` consumer still records `event_id` to prevent double charges on restarts — this remains a Kafka at-least-once concern separate from analytics deduplication.

> **Open decision — OpenMeter vs. custom billing-meter**: An alternative is to delegate metering to [OpenMeter](https://openmeter.io/), which supports idempotent aggregation natively. The trade-off is an external dependency vs. full control. Finalize before the billing pipeline enters development.

**Aggregation**: `AggregatingMergeTree` with `argMax` replaces TimescaleDB Continuous Aggregates. Per-session state (latest status, total tokens, final cost) is maintained incrementally via Materialized Views as data arrives. No scheduled refresh jobs or refresh gaps to manage. For detailed DDL, see [clickhouse.md](clickhouse.md).

**Multi-tenancy**: PostgreSQL RLS is not available in ClickHouse. Tenant isolation is enforced at the application layer — every FastAPI endpoint extracts `org_id` from the verified JWT and injects it as a parameterized query parameter. SQL injection is prevented by using ClickHouse's native `{param:Type}` syntax exclusively.

**Two-track alerting**: business alerts (budget thresholds at 75%, 90%, 100%) via custom `alert-evaluator` consumer. Infrastructure/SRE alerts (API latency P95, pipeline lag, error rates) via **Grafana Alerting** with the ClickHouse data source plugin — visual rule editor, notification routing (Slack, PagerDuty, email), alert silencing. Query syntax uses ClickHouse functions (`quantile`, `countIf`); see [clickhouse.md](clickhouse.md) for examples.

**Retention policy**: raw events 7 days, aggregated data 1 year — enforced via ClickHouse TTL on `MergeTree` tables. No separate policy jobs required.

---

## 3. Authentication & Authorization

Authentication is built on two battle-tested libraries that eliminate ~500 lines of custom boilerplate:

- **[fastapi-users](https://fastapi-users.github.io/fastapi-users/)** — user registration, login, JWT (access + refresh), password reset, email verification, SQLAlchemy async support
- **[fastapi-sso](https://github.com/tomasvotava/fastapi-sso)** — one-line setup for GitHub and Google OAuth2/OIDC via `httpx-oauth`

### 3.1 Authentication Flow

```
User                Browser              API Gateway          Auth Service         IdP (GitHub/Google)
 │                    │                      │                     │                      │
 │  Login click       │                      │                     │                      │
 │──────────────────▶│  POST /auth/token    │                     │                      │
 │                    │─────────────────────▶│  Validate JWT sig   │                      │
 │                    │                      │─────────────────── ▶│                      │
 │                    │                      │                     │  (if SSO) OIDC flow  │
 │                    │                      │                     │─────────────────────▶│
 │                    │                      │                     │◀─────────────────────│
 │                    │                      │                     │  Issue JWT            │
 │                    │                      │◀────────────────────│  (access + refresh)  │
 │                    │◀─────────────────────│                     │                      │
 │                    │  Set httpOnly cookie  │                     │                      │
 │◀───────────────── │                      │                     │                      │
 │                    │                      │                     │                      │
 │  Dashboard load    │  GET /analytics/*    │                     │                      │
 │──────────────────▶│─────────────────────▶│  Verify token       │                      │
 │                    │                      │  Extract org_id     │                      │
 │                    │                      │  Check RBAC role    │                      │
 │                    │                      │─────────────────── ▶│  (backend call)      │
 │                    │◀─────────────────────│  Org-scoped data    │                      │
 │◀───────────────── │                      │                     │                      │
```

### 3.2 JWT Token Structure

```json
{
  "jti": "tok_a1b2c3d4e5f6",
  "sub": "user@acme-corp.io",
  "org_id": "org_abc123",
  "role": "org_admin",
  "plan": "enterprise",
  "iat": 1710000000,
  "exp": 1710003600
}
```

- **Access token**: 1 hour TTL, RS256 signed
- **Refresh token**: 7 days TTL, single-use with rotation
- Storage: httpOnly, Secure, SameSite=Strict cookies (never localStorage)

### 3.3 Instant Session Invalidation (JWT Denylist)

Stateless JWT tokens create a vulnerability window: after a user is removed or their access is revoked, their token remains valid until expiry (up to 1 hour). To close this gap, the architecture uses a Redis-based denylist:

1. **On access revocation**: the token's `jti` (JWT ID) claim is written to Redis with a TTL equal to the token's remaining lifetime
2. **On every request**: the FastAPI authorization middleware checks Redis for the `jti` before granting access
3. **Automatic cleanup**: Redis TTL eviction ensures the denylist does not grow unboundedly

```python
# Revocation (called on user deletion, role change, or manual revoke)
await redis.setex(f"jwt:deny:{jti}", ttl=remaining_seconds, value="revoked")

# Middleware check (runs before every protected endpoint)
if await redis.exists(f"jwt:deny:{jti}"):
    raise HTTPException(status_code=401, detail="Token revoked")
```

This hybrid approach preserves the scalability of stateless JWTs (no session store lookup on the happy path for most requests) while providing near-instant revocation when needed. The Redis check adds < 1ms latency per request.

### 3.4 Role-Based Access Control (RBAC)

| Role | Dashboard Access | Session Details | Cost Data | Team Activity | Admin Settings |
|---|---|---|---|---|---|
| `org_admin` | Full | Full | Full | Full | Full |
| `member` | Full | Own + team | Aggregated only | View only | None |
| `viewer` | Read-only | Summary only | None | None | None |

### 3.5 Multi-Tenancy Isolation

All ClickHouse queries are scoped by `org_id` at the application layer:

1. Every request handler extracts `org_id` from the verified JWT via `Depends(get_current_org)`
2. `org_id` is passed to every ClickHouse query as a named parameter using the `{org_id:String}` syntax
3. String concatenation for `org_id` is strictly prohibited — parameterized queries are the only permitted pattern

PostgreSQL (users, orgs, metadata) retains RLS for its own tables. The ClickHouse analytics layer relies on application-level enforcement as the primary isolation mechanism. See [clickhouse.md](clickhouse.md) for the FastAPI endpoint pattern.

> **Auth alternatives**: For teams preferring a dedicated identity platform over `fastapi-users` + `fastapi-sso`, two open-source options cover the full auth stack: **[SuperTokens](https://supertokens.com/)** (self-hosted or managed, drop-in session management, MFA, social login, Apache 2.0) and **[Keycloak](https://www.keycloak.org/)** (mature enterprise-grade IdP, OIDC/SAML, fine-grained authorization, RBAC/ABAC, Apache 2.0). Both integrate with FastAPI via OIDC — the backend validates tokens from the external IdP rather than issuing them itself. The trade-off is operational overhead of running a separate service vs. the flexibility of a battle-tested identity system.

---

## 4. Dashboard Metrics Design

Metrics are organized into four pages, balancing operational visibility with cost governance and team productivity.

**UI component library**: [Tremor](https://www.tremor.so/) (Apache 2.0, 16.5k stars, acquired by Vercel) provides 35+ copy-paste React components purpose-built for analytics dashboards — KPI cards with delta indicators, AreaChart, LineChart, BarChart, DonutChart, progress bars, and dark mode theming. Built on Recharts + Radix UI + Tailwind CSS.

**Data table**: [TanStack Table](https://tanstack.com/table/latest) (headless, 26k stars) for the session table — server-side sorting, filtering, cursor-based pagination, handles 100k+ rows.

### 4.1 Overview Page

| Metric | Tremor Component | Description |
|---|---|---|
| Total Agent Sessions | `Card` + `SparkAreaChart` | Count of all coding sessions initiated, with trend |
| Token Consumption | `AreaChart` (stacked) | Input + output tokens daily — the core usage unit |
| Total Spend | `Card` + `BadgeDelta` | Dollar cost computed from token pricing tiers |
| PRs Created | `Card` + `BadgeDelta` | Measures agent productivity output with merge success rate |
| Session Outcomes | `DonutChart` | Distribution: completed / merged / failed / timed-out |
| Top Repositories | `BarChart` (horizontal) | Repos ranked by agent session volume |
| Cost per Merged PR | `Card` + `BadgeDelta` | Business value metric — cost efficiency of agent output |

### 4.2 Usage & Costs Page

| Metric | Tremor Component | Description |
|---|---|---|
| Daily Spend Trend | `LineChart` | Dollar costs day-over-day with moving average |
| Cost Breakdown | `DonutChart` | Split: input tokens, output tokens, compute (sandbox), storage |
| Cost per Session | `LineChart` | Unit economics — is efficiency improving over time? |
| Tokens per PR | `Card` + `BadgeDelta` | Ties token consumption directly to business value output |
| Usage Quotas | `ProgressBar` | Sessions, token budget, concurrent sessions, API calls vs. plan limits |
| Budget Alerts | `Callout` (status) | Threshold warnings at 75%, 90%, 100% of budget |

### 4.3 Agent Sessions Page

| Metric | Tremor / TanStack Component | Description |
|---|---|---|
| Session Table | TanStack Table (server-side) | Session ID, user, repo, task, status (badge), duration, tokens, cost |
| Duration Distribution | `BarChart` (categorical) | Session length categories (< 1min, 1-5min, 5-15min, 15min+) |
| P95 Latency Trend | `LineChart` | Execution plan latency — key SRE metric |
| Error Breakdown | `BarChart` (stacked) | Timeout vs. sandbox crash vs. rate limit vs. context overflow |
| Concurrent Sessions | `ProgressBar` + `Card` | Current active sessions vs. org plan maximum |

### 4.4 Team Activity Page

| Metric | Tremor Component | Description |
|---|---|---|
| Sessions per Member | `BarChart` | Individual usage comparison across the team |
| Team Leaderboard | TanStack Table | Sessions, PRs created, success rate, avg cost per developer |
| Activity Feed | SSE via Centrifugo | Live stream of session starts, completions, failures, PR merges |
| Adoption Rate | `Card` + `BadgeDelta` | % of team members who used agents in the last 7/30 days |

---

## 5. API Design

### 5.1 REST Endpoints

All endpoints require `Authorization: Bearer <jwt>` and are scoped to the caller's `org_id`.

```
Authentication:
  POST   /api/v1/auth/token          OAuth2 password flow → JWT
  POST   /api/v1/auth/refresh         Rotate refresh token
  GET    /api/v1/auth/me              Current user profile + org

Analytics:
  GET    /api/v1/analytics/overview   Org KPI summary (cards data)
  GET    /api/v1/analytics/timeseries/{metric}
         ?range=7d|30d|90d&granularity=hour|day
                                      Time-series for sessions, tokens, spend, latency
  GET    /api/v1/analytics/quotas     Usage quota progress vs. plan limits
  GET    /api/v1/analytics/costs      Cost breakdown and trends
  GET    /api/v1/analytics/errors     Error type distribution over time

Sessions:
  GET    /api/v1/sessions             Paginated list (cursor-based)
         ?status=completed|failed&repo=&user=&cursor=&limit=50
  GET    /api/v1/sessions/{id}        Single session detail with timeline

Team:
  GET    /api/v1/analytics/team       Per-member statistics
  GET    /api/v1/analytics/team/feed  SSE endpoint for real-time activity

Repositories:
  GET    /api/v1/analytics/repositories  Per-repo statistics
```

### 5.2 Pagination Strategy

Session listing uses **hybrid cursor-based pagination** — cursor navigation for consistency under concurrent writes, combined with an approximate total count for UI context:

```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "sess_2024031015301234",
    "prev_cursor": "sess_2024031015290042",
    "has_more": true,
    "limit": 50,
    "approx_total": 12450
  }
}
```

**Total count**: ClickHouse executes `SELECT count() FROM sessions_raw WHERE org_id = ...` in milliseconds due to sparse primary key indexing — no approximation function is needed. The TanStack Table UI renders Forward/Back navigation buttons alongside the exact count. See [clickhouse.md](clickhouse.md) for the count query pattern.

### 5.3 Real-Time Data: Centrifugo Gateway

The real-time layer is handled by **[Centrifugo](https://centrifugal.dev/)** (Apache 2.0, 9k+ stars, used by VK, Grafana, Badoo) rather than a custom SSE/WebSocket implementation:

```
Backend (Kafka consumers)                    Centrifugo                     React Client
┌──────────────────────┐  HTTP publish API  ┌──────────────┐  SSE/WebSocket ┌──────────┐
│ alert-evaluator      │──────────────────▶ │ Channel:     │───────────────▶│ Activity │
│ session status change│                    │ org:{org_id} │               │ Feed     │
│ PR merge event       │                    │              │               │ Alerts   │
└──────────────────────┘                    │ JWT auth     │               │ Status   │
                                            │ Redis-backed │               └──────────┘
                                            │ Auto-reconnect│
                                            └──────────────┘
```

**Why Centrifugo over custom SSE**: connection management, reconnection, message recovery, and horizontal scaling are hard to build correctly. Centrifugo handles all of this with a single binary. The backend just POSTs events to Centrifugo's server API — no connection state to manage.

**Channel structure**:

- `org:{org_id}:feed` — activity feed (session starts, completions, PR merges)
- `org:{org_id}:alerts` — budget warnings, error spikes
- `org:{org_id}:sessions` — live session status updates

**Fallback for simple SSE**: for endpoints that don't need Centrifugo's scaling (e.g., streaming a single session log), use **[sse-starlette](https://github.com/sysid/sse-starlette)** directly in FastAPI:

```python
from sse_starlette import EventSourceResponse

@app.get("/api/v1/analytics/team/feed")
async def team_feed(request: Request, user: User = Depends(get_current_user)):
    return EventSourceResponse(generate_org_events(user.org_id))
```

Event format remains SSE-compliant:

```
event: session_started
data: {"user": "alice@acme.io", "repo": "frontend", "task": "Fix header layout", "ts": "..."}

event: pr_merged
data: {"user": "bob@acme.io", "repo": "api-service", "pr": "#142", "ts": "..."}
```

---

## 6. Observability

### 6.1 Distributed Tracing (OpenTelemetry)

Each agent session generates a trace spanning its full lifecycle:

```
Trace: session_abc123
├─ Span: auth.validate_token          (2ms)
├─ Span: session.create               (15ms)
├─ Span: sandbox.provision            (1200ms)  ← most latency here
│  ├─ Span: container.pull_image      (800ms)
│  └─ Span: container.start           (400ms)
├─ Span: agent.execute                (45000ms)
│  ├─ Span: llm.completion (x12)      (token counts as attributes)
│  ├─ Span: tool.file_write (x8)
│  └─ Span: tool.git_commit (x2)
├─ Span: pr.create                    (3000ms)
└─ Span: session.cleanup              (500ms)
```

### 6.2 Key SLIs/SLOs

| SLI | SLO | Measurement |
|---|---|---|
| Dashboard API latency (p95) | < 500ms | OpenTelemetry histogram |
| Session start success rate | > 99.5% | Kafka event counting |
| Data freshness (event → dashboard) | < 60s | Pipeline lag monitoring |
| Auth token validation latency | < 50ms | Gateway metrics |

### 6.3 Alerting Strategy

Alerts are split into two tracks to avoid building a custom notification system:

**Business alerts** (custom `alert-evaluator` Kafka consumer):

- Budget threshold warnings at 75%, 90%, 100% of spend limit
- Quota exhaustion (sessions, tokens, concurrent slots)
- Logic is simple (compare running totals against plan limits), tightly coupled to billing domain

**Infrastructure/SRE alerts** (Grafana Alerting with ClickHouse data source):

- Dashboard API latency P95 > 500ms
- Pipeline lag > 60s (event-to-dashboard freshness)
- Error rate spikes (sandbox crashes, rate limit exhaustion)
- Notification routing to Slack, PagerDuty, email via Grafana's built-in contact points
- Visual rule editor eliminates custom alert definition code

---

## 7. Sources

### Key Libraries & Tools

- [Tremor — React UI components for dashboards and charts](https://www.tremor.so/)
- [TanStack Table — Headless data table for React](https://tanstack.com/table/latest)
- [fastapi-users — User management and JWT auth for FastAPI](https://fastapi-users.github.io/fastapi-users/)
- [fastapi-sso — SSO plugin for FastAPI (GitHub, Google, etc.)](https://github.com/tomasvotava/fastapi-sso)
- [sse-starlette — Server-Sent Events for Starlette/FastAPI](https://github.com/sysid/sse-starlette)
- [slowapi — Rate limiting for FastAPI](https://github.com/laurentS/slowapi)
- [clickhouse-connect — ClickHouse Python client (async)](https://github.com/ClickHouse/clickhouse-connect)
- [Centrifugo — Scalable real-time messaging server](https://centrifugal.dev/)
- [OpenMeter — Open-source usage metering](https://openmeter.io/)
- [Lago — Open-source metering and billing](https://getlago.com/)
- [Full Stack FastAPI Template](https://fastapi.tiangolo.com/project-generation/)
- [Best Open Source Billing for AI Startups — Flexprice](https://flexprice.io/blog/best-open-source-usage-based-billing-platform-for-an-ai-startup-(2025-guide))
