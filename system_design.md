# AgentCloud: Organization Analytics Dashboard — System Design Interview

> **Task:** Design a customer-facing analytics dashboard for a platform where engineering teams run AI coding agents in the cloud. Agents perform tasks (bug fixes, refactoring, scaffolding) in isolated sandboxes and generate Pull Requests. The dashboard serves as the control plane for managers and platform teams: monitoring sessions, costs, team productivity, and system health.

---

## Step 1: Understanding the Problem and Gathering Requirements

### 1.1 Clarifying Questions

| Question | Answer / Assumption |
|---|---|
| Who are the primary dashboard users? | Engineering managers, platform teams, individual developers |
| Is multi-tenancy required? | Yes — the dashboard serves multiple organizations with strictly isolated data |
| Should the dashboard display real-time data? | Partially: activity feed and session statuses are real-time (SSE/WebSocket), analytics are near real-time (latency < 60 seconds) |
| Is a role-based access model needed? | Yes — `org_admin`, `member`, `viewer` with different data access granularity |
| What are the key metrics? | Sessions, tokens, costs (USD), PRs, errors, quotas, team activity |
| Integration with external IdPs? | Yes — GitHub and Google OAuth2/OIDC |

### 1.2 Functional Requirements

- **Overview dashboard**: KPI cards (sessions, costs, PRs), trend charts (tokens, outcomes), top repositories
- **Usage & Costs**: spending trend, breakdown by category (input/output tokens, compute, storage), cost per session, quotas with progress bars, budget alerts (75/90/100%)
- **Agent Sessions**: session table with filters (status, repository, user) and cursor pagination, detailed session page with timeline
- **Team Activity**: per-member activity, leaderboard, live activity feed (SSE), adoption rate
- **Authentication**: OAuth2/OIDC (GitHub, Google), JWT (access + refresh), instant invalidation via denylist
- **RBAC**: three roles with different data access levels

### 1.3 Non-Functional Requirements

| Requirement | Target Value |
|---|---|
| **Availability** | 99.9% (acceptable ~8.7 hours downtime/year) |
| **Latency** (API P95) | < 500 ms |
| **Data freshness** (event → dashboard) | < 60 seconds |
| **Auth token validation** | < 50 ms |
| **Session start success rate** | > 99.5% |

### 1.4 Load Estimation (Back-of-the-Envelope)

**Assumptions:**
- 500 organizations, ~50 developers per organization on average = **25,000 users**
- Each developer launches ~5 agent sessions per day
- Each session generates ~12 LLM calls, ~10 tool calls, 1 PR

**Calculations:**

| Metric | Value |
|---|---|
| Sessions per day | 25,000 × 5 = **125,000** |
| Events per day | 125,000 × ~25 events/session = **~3.1M** |
| RPS (events) | 3,100,000 / 86,400 ≈ **~36 RPS** (peak ×3 = ~108 RPS) |
| RPS (dashboard API) | ~500 concurrent users × 1 req/10s = **~50 RPS** |
| Storage (raw events, 1 year) | 3.1M × 365 × ~500 bytes ≈ **~565 GB** |
| Storage (aggregated, 1 year) | ~125K sessions/day × 365 × ~200 bytes ≈ **~9 GB** |

> The load is moderate — no extreme sharding required at launch, but the architecture should accommodate horizontal scaling.

---

## Step 2: High-Level Design
### 2.1 Core Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                 │
│  React SPA · Tremor (charts/KPI) · TanStack Table · Tailwind CSS       │
│  Auth tokens in httpOnly cookies · TanStack Query (client-side cache)   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTPS (TLS 1.3)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                                    │
│  Load Balancer · Rate Limiter (per org/tier) · JWT Validation           │
│  WAF (OWASP) · TLS Termination · API Versioning (/api/v1/)             │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│   AUTH SERVICE   │ │ ANALYTICS SVC   │ │  SESSION SVC     │
│  OAuth2/OIDC     │ │ KPI aggregation │ │ Session CRUD     │
│  JWT issue/verify│ │ Time-series API │ │ Status tracking  │
│  RBAC enforcement│ │ Quota checks    │ │ Filtering/search │
│  Refresh rotation│ │ Cost compute    │ │ Cursor pagination│
└────────┬─────────┘ └────────┬────────┘ └────────┬─────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────┐  ┌───────────────────┐  │
│  │ ClickHouse   │  │ PostgreSQL   │  │ Redis │  │ Kafka             │  │
│  │ Metrics &    │  │ Users, Orgs  │  │ Cache │  │ Agent telemetry   │  │
│  │ time-series  │  │ Sessions     │  │ (TTL) │  │ events            │  │
│  │ Aggregation  │  │ Repos, PRs   │  │       │  │                   │  │
│  └──────────────┘  └──────────────┘  └───────┘  └───────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Centrifugo (real-time gateway)                                   │   │
│  │ WebSocket + SSE · JWT auth · Redis-backed scaling                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AGENT INFRASTRUCTURE                               │
│  Sandboxed containers (Firecracker/gVisor) · GitHub proxy               │
│  Isolated execution per session · Telemetry emitter (→ Kafka)           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 API Design

All endpoints require `Authorization: Bearer <jwt>`, data is scoped by `org_id` from the token.

```
Authentication:
  POST   /api/v1/auth/token          OAuth2 password flow → JWT
  POST   /api/v1/auth/refresh         Refresh token rotation
  GET    /api/v1/auth/me              Current user profile + org

Analytics:
  GET    /api/v1/analytics/overview   Organization KPI summary
  GET    /api/v1/analytics/timeseries/{metric}
         ?range=7d|30d|90d&granularity=hour|day
  GET    /api/v1/analytics/quotas     Quota progress vs plan limits
  GET    /api/v1/analytics/costs      Cost breakdown
  GET    /api/v1/analytics/errors     Error distribution

Sessions:
  GET    /api/v1/sessions             Cursor pagination + filters
         ?status=completed|failed&repo=&user=&cursor=&limit=50
  GET    /api/v1/sessions/{id}        Session details with timeline

Team:
  GET    /api/v1/analytics/team       Per-member statistics
  GET    /api/v1/analytics/team/feed  SSE — live activity feed

Repositories:
  GET    /api/v1/analytics/repositories  Per-repository statistics
```

### 2.3 Data Model

**PostgreSQL** — transactional data:

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│ organizations│       │    users     │       │ repositories │
├─────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)     │◄──┐   │ id (PK)      │       │ id (PK)      │
│ name        │   ├───│ org_id (FK)  │   ┌──│ org_id (FK)  │
│ plan        │   │   │ email        │   │   │ name         │
│ quota_limits│   │   │ role (RBAC)  │   │   │ url          │
└─────────────┘   │   └──────────────┘   │   └──────────────┘
                  │                       │
                  └───────────────────────┘
```

**ClickHouse** — analytics and time-series:

```
┌──────────────────┐      MV       ┌────────────────────────┐
│  sessions_raw    │ ───────────▶  │  sessions_aggregated   │
├──────────────────┤               ├────────────────────────┤
│ org_id           │               │ org_id                 │
│ session_id       │               │ session_id             │
│ event_id         │               │ latest_status (argMax) │
│ status           │               │ total_tokens (sum)     │
│ tokens           │               │ final_cost (argMax)    │
│ cost             │               │ last_updated (max)     │
│ created_at       │               └────────────────────────┘
│ ORDER BY (org_id,│
│  session_id,     │
│  created_at)     │
└──────────────────┘
```

### 2.4 API Response Format (Pagination)

Cursor-based pagination — stable under concurrent writes:

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

---

## Step 3: Deep Dive

### 3.1 Data Ingestion Pipeline

Key architectural decision — **ClickHouse Kafka Engine** for direct event consumption without intermediate workers:

```
Agent Sandbox                Kafka                     ClickHouse
┌─────────────┐   emit   ┌──────────────┐  Kafka     ┌────────────────────┐
│ Code exec   │────────▶ │ agent.events │──Engine──▶ │ sessions_raw       │
│ Token usage │          │ agent.tokens │            │     │               │
│ PR creation │          │ agent.status │            │     ▼ (Materialized │
│ Errors      │          └──────────────┘            │       View)        │
└─────────────┘                 │                    │ sessions_aggregated│
                                │                    │ (AggregatingMT)    │
                       ┌────────┴────────┐           │ argMax dedup       │
                       ▼                 ▼           └────────────────────┘
               ┌──────────────┐  ┌──────────────┐
               │billing-meter │  │alert-evaluator│
               │ (cost calc)  │  │ budget 75/90/ │
               │              │  │ 100% thresholds│
               └──────────────┘  └──────┬───────┘
                                        │ publish
                                        ▼
                                   Centrifugo ──▶ React Dashboard
                                   (SSE/WS)
```

**Why Kafka Engine over Python workers:**
- Eliminates an entire infrastructure tier (metrics-writer consumer)
- ClickHouse acts as a Kafka consumer itself, writing to raw MergeTree tables
- Materialized Views maintain aggregated state incrementally

**Deduplication via `argMax`:**
- `AggregatingMergeTree` with `argMaxState` resolves duplicates by keeping the latest value per `(org_id, session_id)` key based on `created_at`
- No heavy locking or `FINAL` modifier required
- For billing idempotency, `billing-meter` separately records `event_id` to prevent double charges

### 3.2 Technology Choices and Rationale

| Component | Choice | Why | Alternatives |
|---|---|---|---|
| **OLAP storage** | ClickHouse | Columnar storage, 10-20x compression, sub-second analytical queries, Kafka Engine for direct ingestion, built-in TTL policies | TimescaleDB (row-oriented for time-series, simpler but slower on aggregations), Druid (more complex ops) |
| **OLTP storage** | PostgreSQL | Transactions, RLS, mature ecosystem, ideal for users/orgs/metadata | MySQL (less powerful types), CockroachDB (overhead for this scale) |
| **Message queue** | Kafka | Durability, replay, multiple consumers (analytics + billing + alerts), Kafka Engine integration with ClickHouse | RabbitMQ (no replay), Pulsar (less mature ecosystem) |
| **Cache** | Redis | TTL-based cache, JWT denylist (<1ms lookup), Pub/Sub for Centrifugo scaling | Memcached (no persistence, no TTL denylist pattern) |
| **Real-time gateway** | Centrifugo | Connection management, reconnection, message recovery, horizontal scaling — all out of the box. Backend simply POSTs events | Custom SSE (sse-starlette) — for simple cases, doesn't scale |
| **Auth** | fastapi-users + fastapi-sso | Saves ~500 lines of boilerplate: JWT, refresh rotation, password reset, OAuth2 | SuperTokens, Keycloak — full-fledged IdPs, but more operational overhead |
| **Frontend charts** | Tremor | 35+ analytics components (KPI cards, charts, dark mode), built on Recharts + Radix UI | Recharts directly (more custom code), Highcharts (license) |
| **Data table** | TanStack Table | Headless, server-side sorting/filtering, cursor pagination, 100k+ rows | AG Grid (heavier, commercial license) |

### 3.3 Authentication and Authorization

**JWT Flow:**

```
User → Browser → API Gateway → Auth Service → IdP (GitHub/Google)
                                    │
                                    ▼
                            JWT (access 1h + refresh 7d)
                            Storage: httpOnly, Secure, SameSite=Strict
                            Signing: RS256
```

**Token structure:**

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

**Instant Session Invalidation (JWT Denylist):**

Problem: after revocation, the token remains valid until TTL expiry (up to 1 hour).
Solution: Redis-based denylist by `jti`:

```python
# Revocation
await redis.setex(f"jwt:deny:{jti}", ttl=remaining_seconds, value="revoked")

# Middleware check (every request)
if await redis.exists(f"jwt:deny:{jti}"):
    raise HTTPException(status_code=401, detail="Token revoked")
```

- Happy path: stateless JWT, no Redis call
- Redis check: <1ms latency per request
- TTL automatically cleans up the denylist

**RBAC:**

| Role | Dashboard | Session Details | Cost Data | Team Activity | Admin |
|---|---|---|---|---|---|
| `org_admin` | Full | Full | Full | Full | Full |
| `member` | Full | Own + team | Aggregated | View only | None |
| `viewer` | Read-only | Summary | None | None | None |

### 3.4 Multi-Tenancy

**ClickHouse** — no RLS, isolation at the application level:

1. Every endpoint extracts `org_id` from the verified JWT via `Depends(get_current_org)`
2. `org_id` is passed as a parameter using `{org_id:String}` syntax (parameterized queries)
3. String concatenation for `org_id` is strictly prohibited

```python
async def get_current_org(token: str = Depends(oauth2_scheme)) -> str:
    payload = verify_jwt(token)
    return payload["org_id"]  # always from verified token
```

**PostgreSQL** — RLS for its own tables (users, orgs, metadata).

### 3.5 Real-Time Layer (Centrifugo)

```
Backend (Kafka consumers)          Centrifugo              React Client
┌──────────────────────┐  HTTP   ┌──────────────┐  SSE/WS ┌──────────┐
│ alert-evaluator      │──────▶  │ Channel:     │───────▶ │ Activity │
│ session status       │ publish │ org:{org_id} │         │ Feed     │
│ PR merge event       │   API  │              │         │ Alerts   │
└──────────────────────┘         │ JWT auth     │         │ Status   │
                                 │ Redis-backed │         └──────────┘
                                 └──────────────┘
```

**Channels:**
- `org:{org_id}:feed` — activity feed (sessions, PR merges)
- `org:{org_id}:alerts` — budget warnings, error spikes
- `org:{org_id}:sessions` — live session statuses

**Fallback:** for simple SSE endpoints (single session log streaming) — `sse-starlette` directly in FastAPI.

### 3.6 ClickHouse: Schema and Queries

**Kafka Engine → Raw → Aggregated:**

```sql
-- 1. Kafka consumer table
CREATE TABLE kafka_agent_events (
    org_id String, session_id String, event_id String,
    status String, tokens UInt32, cost Float64, created_at DateTime
) ENGINE = Kafka
SETTINGS kafka_broker_list = 'broker:9092',
         kafka_topic_list   = 'agent.events',
         kafka_group_name   = 'clickhouse_ingestion',
         kafka_format       = 'JSONEachRow';

-- 2. Raw storage
CREATE TABLE sessions_raw (
    org_id String, session_id String, event_id String,
    status String, tokens UInt32, cost Float64, created_at DateTime
) ENGINE = MergeTree()
ORDER BY (org_id, session_id, created_at);

-- 3. Materialized View: Kafka → Raw
CREATE MATERIALIZED VIEW mv_kafka_to_raw TO sessions_raw AS
SELECT * FROM kafka_agent_events;

-- 4. Aggregated state (AggregatingMergeTree)
CREATE TABLE sessions_aggregated (
    org_id String, session_id String,
    latest_status  AggregateFunction(argMax, String, DateTime),
    total_tokens   AggregateFunction(sum, UInt32),
    final_cost     AggregateFunction(argMax, Float64, DateTime),
    last_updated   AggregateFunction(max, DateTime)
) ENGINE = AggregatingMergeTree()
ORDER BY (org_id, session_id);

-- 5. Materialized View: Raw → Aggregated
CREATE MATERIALIZED VIEW mv_sessions_aggregated TO sessions_aggregated AS
SELECT org_id, session_id,
    argMaxState(status, created_at)  AS latest_status,
    sumState(tokens)                 AS total_tokens,
    argMaxState(cost, created_at)    AS final_cost,
    maxState(created_at)             AS last_updated
FROM sessions_raw
GROUP BY org_id, session_id;
```

**Querying aggregated data:**

```sql
SELECT session_id,
    argMaxMerge(latest_status) AS status,
    sumMerge(total_tokens)     AS tokens,
    argMaxMerge(final_cost)    AS cost
FROM sessions_aggregated
WHERE org_id = {org_id:String}
GROUP BY session_id
ORDER BY maxMerge(last_updated) DESC
LIMIT 50;
```

**Retention (TTL):** raw events 7 days, aggregated data 1 year — via ClickHouse TTL on MergeTree tables.

---

## Step 4: Identifying Bottlenecks and Scaling

### 4.1 Single Points of Failure (SPOF) and Mitigation

| Component | Risk | Mitigation |
|---|---|---|
| **API Gateway** | Single point of entry | Multi-AZ deployment, health checks, auto-scaling group |
| **ClickHouse** | Single OLAP node | ClickHouse Keeper + ReplicatedMergeTree, read replicas for dashboard queries |
| **Kafka** | Event loss | Replication factor ≥ 3, `acks=all` from producers, ISR (In-Sync Replicas) |
| **Redis** | JWT denylist loss | Redis Sentinel or Cluster mode; on total loss — tokens live until expiry (max 1 hour, acceptable) |
| **Centrifugo** | Real-time feed disruption | Redis-backed Pub/Sub for horizontal scaling, auto-reconnection on client, message recovery |
| **PostgreSQL** | Transactional data loss | Streaming replication, automated failover (Patroni), point-in-time recovery |

### 4.2 Performance Optimization

**Caching (Redis):**
- Overview KPI cards: TTL 60 seconds (event-based invalidation)
- Quotas: TTL 30 seconds (freshness-sensitive)
- Repository list: TTL 5 minutes (rarely changes)
- JWT denylist: TTL = remaining token lifetime

**ClickHouse optimizations:**
- `ORDER BY (org_id, ...)` — all queries start with org_id, ensuring optimal data skipping
- `AggregatingMergeTree` instead of `GROUP BY` at query time — pre-computed aggregates
- Columnar compression: 10-20x on typical analytical data
- `count()` on primary key — near-instant thanks to sparse index

**CDN and static assets:**
- React SPA bundle, fonts (Inter, JetBrains Mono) — via CDN
- API responses with KPIs are not cached on CDN (org-scoped)

**Client-side optimization:**
- TanStack Query: `staleTime: 60s`, `retry: 1` — minimizes redundant requests
- Cursor-based pagination: stable under concurrent inserts (unlike offset)

### 4.3 Scaling at 10x Growth

At 5,000 organizations / 250,000 users:

| Layer | Current | At 10x | Actions |
|---|---|---|---|
| **API** | 2-3 instances | 10-15 instances | Horizontal scaling behind Load Balancer, stateless services |
| **ClickHouse** | Single node | Cluster (3+ shards) | Sharding by `org_id` (consistent hashing), ReplicatedMergeTree |
| **Kafka** | 3 brokers | 6-9 brokers | Increase partitions per topic, partition by `org_id` |
| **PostgreSQL** | Single primary + replica | Primary + 2 replicas | Read replicas for auth-heavy queries; sharding by org_id if needed |
| **Redis** | Standalone | Cluster (3 masters) | Sharding denylist and cache |
| **Centrifugo** | 1-2 nodes | 3-5 nodes | Redis-backed scaling already built into the architecture |

### 4.4 Alerting Strategy

Two-tier approach to avoid building a custom notification system:

**Business alerts** — custom `alert-evaluator` Kafka consumer:
- Budget thresholds: 75%, 90%, 100% of spending limit
- Quota exhaustion: sessions, tokens, concurrent slots
- Published to Centrifugo → real-time notifications in UI

**Infrastructure/SRE alerts** — Grafana Alerting + ClickHouse data source:
- API latency P95 > 500ms
- Pipeline lag > 60s
- Error rate spikes (sandbox crashes, rate limits)
- Routing: Slack, PagerDuty, email via Grafana contact points

```sql
-- Example: P95 latency alert in Grafana
SELECT quantile(0.95)(latency_ms) AS p95_latency
FROM api_requests
WHERE org_id = {org_id:String}
  AND created_at >= now() - INTERVAL 5 MINUTE;

-- Example: Error rate alert
SELECT countIf(status = 'error') / count() AS error_rate
FROM sessions_raw
WHERE org_id = {org_id:String}
  AND created_at >= now() - INTERVAL 5 MINUTE;
```

### 4.5 Observability

OpenTelemetry distributed tracing — trace per session:

```
Trace: session_abc123
├─ Span: auth.validate_token          (2ms)
├─ Span: session.create               (15ms)
├─ Span: sandbox.provision            (1200ms)  ← main latency
│  ├─ Span: container.pull_image      (800ms)
│  └─ Span: container.start           (400ms)
├─ Span: agent.execute                (45000ms)
│  ├─ Span: llm.completion (x12)      (token counts as attributes)
│  ├─ Span: tool.file_write (x8)
│  └─ Span: tool.git_commit (x2)
├─ Span: pr.create                    (3000ms)
└─ Span: session.cleanup              (500ms)
```

---

## Step 5: Summary

### 5.1 Requirements Coverage

| Requirement | How It's Covered |
|---|---|
| Multi-tenant dashboard | `org_id` in JWT → parameterized queries (ClickHouse), RLS (PostgreSQL) |
| Real-time updates | Centrifugo (SSE/WebSocket) with JWT auth and Redis scaling |
| Sub-500ms API latency | ClickHouse pre-aggregated views + Redis cache |
| < 60s data freshness | Kafka → ClickHouse Kafka Engine (direct ingestion, no workers) |
| RBAC (3 roles) | JWT claims + middleware enforcement |
| Secure auth | OAuth2/OIDC, RS256, httpOnly cookies, instant revocation via denylist |
| Budget alerts | Two-track: custom consumer (business) + Grafana Alerting (infra) |
| Cursor pagination | Stable under concurrent writes, exact count via ClickHouse sparse index |

### 5.2 Key Trade-offs

| Decision | Pros | Cons |
|---|---|---|
| **ClickHouse over TimescaleDB** | 10-20x compression, Kafka Engine, sub-second aggregations | No RLS (app-level isolation), eventual consistency during merges |
| **Centrifugo over custom SSE** | Production-ready scaling, reconnection, recovery | Additional service in the infrastructure |
| **Kafka Engine over Python workers** | Eliminates a separate infrastructure tier | Less control over transformation logic |
| **JWT + Redis denylist over sessions** | Stateless scaling, <1ms revocation check | Additional Redis dependency for security-critical path |
| **fastapi-users over Keycloak** | Simpler deployment, less ops overhead | Less mature MFA, audit trail, enterprise features |

### 5.3 Future Improvements Given More Time

- **Anomaly detection and ML**: automatic detection of abnormal spending or error patterns
- **Multi-region**: geo-distributed ClickHouse cluster for global teams
- **Audit log**: immutable log of all admin actions for compliance
- **Agent A/B testing**: comparing performance across different models/configurations
- **Self-service quotas**: UI for org_admins to configure limits and alerts without contacting support
- **Export and integrations**: API for data export to BI systems (Looker, Metabase), webhooks for external alerts
