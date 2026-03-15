# AgentCloud: Organization Analytics Dashboard — System Design Interview

> **Задача:** Спроектировать customer-facing аналитический дашборд для платформы, на которой инженерные команды запускают AI coding-агентов в облаке. Агенты выполняют задачи (баг-фиксы, рефакторинг, скаффолдинг) в изолированных sandbox-ах и генерируют Pull Request-ы. Дашборд — это control plane для менеджеров и платформенных команд: мониторинг сессий, расходов, продуктивности команды и состояния системы.

---

## Шаг 1: Понимание задачи и сбор требований

### 1.1 Уточняющие вопросы

| Вопрос | Ответ / Допущение |
|---|---|
| Кто основные пользователи дашборда? | Engineering managers, platform teams, отдельные разработчики |
| Нужна ли multi-tenancy? | Да — дашборд обслуживает несколько организаций, данные строго изолированы |
| Должен ли дашборд отображать данные в реальном времени? | Частично: activity feed и статусы сессий — real-time (SSE/WebSocket), аналитика — near real-time (задержка < 60 секунд) |
| Нужна ли ролевая модель доступа? | Да — `org_admin`, `member`, `viewer` с разной гранулярностью доступа к данным |
| Какие ключевые метрики? | Сессии, токены, расходы (USD), PR-ы, ошибки, квоты, активность команды |
| Интеграция с внешними IdP? | Да — GitHub и Google OAuth2/OIDC |

### 1.2 Функциональные требования

- **Overview-дашборд**: KPI-карточки (сессии, расходы, PR-ы), графики трендов (токены, outcomes), топ репозиториев
- **Usage & Costs**: тренд расходов, breakdown по категориям (input/output tokens, compute, storage), cost per session, квоты с прогресс-барами, бюджетные алерты (75/90/100%)
- **Agent Sessions**: таблица сессий с фильтрами (статус, репозиторий, пользователь) и cursor-пагинацией, детальная страница сессии с timeline
- **Team Activity**: активность по участникам, leaderboard, live activity feed (SSE), adoption rate
- **Аутентификация**: OAuth2/OIDC (GitHub, Google), JWT (access + refresh), мгновенная инвалидация через denylist
- **RBAC**: три роли с разным уровнем доступа к данным

### 1.3 Нефункциональные требования

| Требование | Целевое значение |
|---|---|
| **Availability** | 99.9% (допустимо ~8.7 часов downtime/год) |
| **Latency** (API P95) | < 500 мс |
| **Data freshness** (event → dashboard) | < 60 секунд |
| **Auth token validation** | < 50 мс |
| **Session start success rate** | > 99.5% |

### 1.4 Оценка нагрузки (Back-of-the-Envelope)

**Допущения:**
- 500 организаций, ~50 разработчиков в среднем на организацию = **25 000 пользователей**
- Каждый разработчик запускает ~5 agent-сессий в день
- Каждая сессия генерирует ~12 LLM-вызовов, ~10 tool-вызовов, 1 PR

**Расчёты:**

| Метрика | Значение |
|---|---|
| Сессий в день | 25 000 × 5 = **125 000** |
| Событий в день | 125 000 × ~25 событий/сессия = **~3.1 млн** |
| RPS (events) | 3 100 000 / 86 400 ≈ **~36 RPS** (пик ×3 = ~108 RPS) |
| RPS (dashboard API) | ~500 concurrent users × 1 req/10s = **~50 RPS** |
| Хранилище (raw events, 1 год) | 3.1M × 365 × ~500 bytes ≈ **~565 ГБ** |
| Хранилище (aggregated, 1 год) | ~125K sessions/day × 365 × ~200 bytes ≈ **~9 ГБ** |

> Нагрузка умеренная — не требует экстремального шардирования на старте, но архитектура должна предусматривать горизонтальное масштабирование.

---

## Шаг 2: Высокоуровневый дизайн
### 2.1 Базовая архитектура

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                 │
│  React SPA · Tremor (charts/KPI) · TanStack Table · Tailwind CSS       │
│  Auth tokens в httpOnly cookies · TanStack Query (client-side cache)    │
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

### 2.2 Дизайн API

Все эндпоинты требуют `Authorization: Bearer <jwt>`, данные скоупятся по `org_id` из токена.

```
Аутентификация:
  POST   /api/v1/auth/token          OAuth2 password flow → JWT
  POST   /api/v1/auth/refresh         Ротация refresh-токена
  GET    /api/v1/auth/me              Профиль текущего пользователя + org

Аналитика:
  GET    /api/v1/analytics/overview   Сводка KPI организации
  GET    /api/v1/analytics/timeseries/{metric}
         ?range=7d|30d|90d&granularity=hour|day
  GET    /api/v1/analytics/quotas     Прогресс квот vs лимиты плана
  GET    /api/v1/analytics/costs      Breakdown расходов
  GET    /api/v1/analytics/errors     Распределение ошибок

Сессии:
  GET    /api/v1/sessions             Cursor-пагинация + фильтры
         ?status=completed|failed&repo=&user=&cursor=&limit=50
  GET    /api/v1/sessions/{id}        Детали сессии с timeline

Команда:
  GET    /api/v1/analytics/team       Статистика по участникам
  GET    /api/v1/analytics/team/feed  SSE — live activity feed

Репозитории:
  GET    /api/v1/analytics/repositories  Статистика по репозиториям
```

### 2.3 Модель данных

**PostgreSQL** — транзакционные данные:

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

**ClickHouse** — аналитика и time-series:

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

### 2.4 Формат ответа API (пагинация)

Cursor-based пагинация — стабильна при concurrent writes:

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

## Шаг 3: Глубокое погружение

### 3.1 Data Ingestion Pipeline

Ключевое архитектурное решение — **ClickHouse Kafka Engine** для прямого потребления событий без промежуточных worker-ов:

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

**Почему Kafka Engine, а не Python workers:**
- Устраняется целый tier инфраструктуры (metrics-writer consumer)
- ClickHouse сам выступает Kafka-consumer, пишет в raw MergeTree-таблицы
- Materialized Views поддерживают агрегированное состояние инкрементально

**Деduplication через `argMax`:**
- `AggregatingMergeTree` с `argMaxState` разрешает дубликаты, сохраняя последнее значение по `(org_id, session_id)` ключу на основе `created_at`
- Нет тяжёлого locking или модификатора `FINAL`
- Для billing-идемпотентности `billing-meter` отдельно записывает `event_id` для предотвращения двойных начислений

### 3.2 Выбор технологий и обоснование

| Компонент | Выбор | Почему | Альтернативы |
|---|---|---|---|
| **OLAP-хранилище** | ClickHouse | Колоночное хранение, сжатие 10-20x, sub-second аналитические запросы, Kafka Engine для direct ingestion, TTL-политики из коробки | TimescaleDB (row-oriented для time-series, проще но медленнее на aggregations), Druid (сложнее в ops) |
| **OLTP-хранилище** | PostgreSQL | Транзакции, RLS, зрелая экосистема, идеальна для users/orgs/metadata | MySQL (менее мощные types), CockroachDB (overhead для данного масштаба) |
| **Очередь** | Kafka | Durability, replay, multiple consumers (analytics + billing + alerts), Kafka Engine integration с ClickHouse | RabbitMQ (нет replay), Pulsar (менее зрелая экосистема) |
| **Кэш** | Redis | TTL-based cache, JWT denylist (<1ms lookup), Pub/Sub для Centrifugo scaling | Memcached (нет persistence, нет TTL denylist pattern) |
| **Real-time gateway** | Centrifugo | Connection management, reconnection, message recovery, horizontal scaling — всё из коробки. Backend просто POST-ит события | Custom SSE (sse-starlette) — для простых кейсов, не масштабируется |
| **Auth** | fastapi-users + fastapi-sso | Экономит ~500 строк boilerplate: JWT, refresh rotation, password reset, OAuth2 | SuperTokens, Keycloak — полноценные IdP, но operational overhead |
| **Frontend charts** | Tremor | 35+ компонентов для аналитики (KPI cards, charts, dark mode), built on Recharts + Radix UI | Recharts напрямую (больше custom кода), Highcharts (лицензия) |
| **Data table** | TanStack Table | Headless, server-side sorting/filtering, cursor pagination, 100k+ строк | AG Grid (тяжелее, коммерческая лицензия) |

### 3.3 Аутентификация и авторизация

**JWT Flow:**

```
User → Browser → API Gateway → Auth Service → IdP (GitHub/Google)
                                    │
                                    ▼
                            JWT (access 1h + refresh 7d)
                            Хранение: httpOnly, Secure, SameSite=Strict
                            Подпись: RS256
```

**Структура токена:**

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

Проблема: после revoke токен действует до истечения TTL (до 1 часа).
Решение: Redis-based denylist по `jti`:

```python
# Revocation
await redis.setex(f"jwt:deny:{jti}", ttl=remaining_seconds, value="revoked")

# Middleware check (каждый запрос)
if await redis.exists(f"jwt:deny:{jti}"):
    raise HTTPException(status_code=401, detail="Token revoked")
```

- Happy path: stateless JWT, без обращения к Redis
- Redis check: <1ms latency per request
- TTL автоматически чистит denylist

**RBAC:**

| Роль | Dashboard | Session Details | Cost Data | Team Activity | Admin |
|---|---|---|---|---|---|
| `org_admin` | Full | Full | Full | Full | Full |
| `member` | Full | Own + team | Aggregated | View only | None |
| `viewer` | Read-only | Summary | None | None | None |

### 3.4 Multi-Tenancy

**ClickHouse** — без RLS, изоляция на уровне приложения:

1. Каждый endpoint извлекает `org_id` из верифицированного JWT через `Depends(get_current_org)`
2. `org_id` передаётся как параметр через `{org_id:String}` синтаксис (parameterized queries)
3. String concatenation для `org_id` строго запрещена

```python
async def get_current_org(token: str = Depends(oauth2_scheme)) -> str:
    payload = verify_jwt(token)
    return payload["org_id"]  # всегда из верифицированного токена
```

**PostgreSQL** — RLS для своих таблиц (users, orgs, metadata).

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

**Каналы:**
- `org:{org_id}:feed` — activity feed (сессии, PR merges)
- `org:{org_id}:alerts` — бюджетные предупреждения, спайки ошибок
- `org:{org_id}:sessions` — live статусы сессий

**Fallback:** для простых SSE-эндпоинтов (стриминг логов одной сессии) — `sse-starlette` напрямую в FastAPI.

### 3.6 ClickHouse: схема и запросы

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

**Запрос агрегированных данных:**

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

**Retention (TTL):** raw events 7 дней, aggregated data 1 год — через ClickHouse TTL на MergeTree-таблицах.

---

## Шаг 4: Выявление узких мест и масштабирование

### 4.1 Точки отказа (SPOF) и mitigation

| Компонент | Риск | Митигация |
|---|---|---|
| **API Gateway** | Single point of entry | Multi-AZ deployment, health checks, auto-scaling group |
| **ClickHouse** | Единственный OLAP-узел | ClickHouse Keeper + ReplicatedMergeTree, read replicas для dashboard queries |
| **Kafka** | Потеря событий | Replication factor ≥ 3, `acks=all` от producers, ISR (In-Sync Replicas) |
| **Redis** | Потеря JWT denylist | Redis Sentinel или Cluster mode; при полной потере — токены живут до expiry (max 1 час, acceptable) |
| **Centrifugo** | Обрыв real-time feeds | Redis-backed Pub/Sub для horizontal scaling, auto-reconnection на клиенте, message recovery |
| **PostgreSQL** | Потеря транзакционных данных | Streaming replication, automated failover (Patroni), point-in-time recovery |

### 4.2 Оптимизация производительности

**Кэширование (Redis):**
- KPI-карточки overview: TTL 60 секунд (инвалидация по event)
- Квоты: TTL 30 секунд (чувствительны к актуальности)
- Список репозиториев: TTL 5 минут (редко меняется)
- JWT denylist: TTL = оставшееся время жизни токена

**ClickHouse оптимизации:**
- `ORDER BY (org_id, ...)` — все запросы начинаются с org_id, что обеспечивает optimal data skipping
- `AggregatingMergeTree` вместо `GROUP BY` at query time — предвычисленные агрегаты
- Колоночное сжатие: 10-20x на типичных аналитических данных
- `count()` по primary key — near-instant благодаря sparse index

**CDN и статика:**
- React SPA bundle, шрифты (Inter, JetBrains Mono) — через CDN
- API-ответы с KPI не кэшируются на CDN (org-scoped)

**Клиентская оптимизация:**
- TanStack Query: `staleTime: 60s`, `retry: 1` — минимизация redundant requests
- Cursor-based пагинация: стабильна при concurrent inserts (в отличие от offset)

### 4.3 Масштабирование при 10x росте

При росте до 5 000 организаций / 250 000 пользователей:

| Слой | Текущий | При 10x | Действия |
|---|---|---|---|
| **API** | 2-3 инстанса | 10-15 инстансов | Horizontal scaling за Load Balancer, stateless сервисы |
| **ClickHouse** | Single node | Cluster (3+ shards) | Шардирование по `org_id` (consistent hashing), ReplicatedMergeTree |
| **Kafka** | 3 брокера | 6-9 брокеров | Увеличение partitions per topic, партиционирование по `org_id` |
| **PostgreSQL** | Single primary + replica | Primary + 2 replicas | Read replicas для auth-тяжёлых запросов; при необходимости — шардирование по org_id |
| **Redis** | Standalone | Cluster (3 masters) | Шардирование denylist и кэша |
| **Centrifugo** | 1-2 ноды | 3-5 нод | Redis-backed scaling уже заложен в архитектуру |

### 4.4 Alerting Strategy

Двухуровневый подход, чтобы не строить custom notification system:

**Business alerts** — custom `alert-evaluator` Kafka consumer:
- Budget thresholds: 75%, 90%, 100% лимита расходов
- Quota exhaustion: сессии, токены, concurrent slots
- Публикация в Centrifugo → real-time уведомления в UI

**Infrastructure/SRE alerts** — Grafana Alerting + ClickHouse data source:
- API latency P95 > 500ms
- Pipeline lag > 60s
- Error rate spikes (sandbox crashes, rate limits)
- Routing: Slack, PagerDuty, email через Grafana contact points

```sql
-- Пример: P95 latency alert в Grafana
SELECT quantile(0.95)(latency_ms) AS p95_latency
FROM api_requests
WHERE org_id = {org_id:String}
  AND created_at >= now() - INTERVAL 5 MINUTE;

-- Пример: Error rate alert
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
├─ Span: sandbox.provision            (1200ms)  ← основная латентность
│  ├─ Span: container.pull_image      (800ms)
│  └─ Span: container.start           (400ms)
├─ Span: agent.execute                (45000ms)
│  ├─ Span: llm.completion (x12)      (token counts как attributes)
│  ├─ Span: tool.file_write (x8)
│  └─ Span: tool.git_commit (x2)
├─ Span: pr.create                    (3000ms)
└─ Span: session.cleanup              (500ms)
```

---

## Шаг 5: Подведение итогов

### 5.1 Покрытие требований

| Требование | Как покрыто |
|---|---|
| Multi-tenant dashboard | `org_id` в JWT → parameterized queries (ClickHouse), RLS (PostgreSQL) |
| Real-time updates | Centrifugo (SSE/WebSocket) с JWT auth и Redis scaling |
| Sub-500ms API latency | ClickHouse pre-aggregated views + Redis cache |
| < 60s data freshness | Kafka → ClickHouse Kafka Engine (direct ingestion, no workers) |
| RBAC (3 роли) | JWT claims + middleware enforcement |
| Secure auth | OAuth2/OIDC, RS256, httpOnly cookies, instant revocation via denylist |
| Budget alerts | Two-track: custom consumer (business) + Grafana Alerting (infra) |
| Cursor pagination | Стабильна при concurrent writes, exact count через ClickHouse sparse index |

### 5.2 Ключевые trade-offs

| Решение | Плюсы | Минусы |
|---|---|---|
| **ClickHouse over TimescaleDB** | 10-20x сжатие, Kafka Engine, sub-second aggregations | Нет RLS (app-level isolation), eventual consistency при мержах |
| **Centrifugo over custom SSE** | Production-ready scaling, reconnection, recovery | Дополнительный сервис в инфраструктуре |
| **Kafka Engine over Python workers** | Нет отдельного tier инфраструктуры | Меньше контроля над transformation logic |
| **JWT + Redis denylist over sessions** | Stateless scaling, <1ms revocation check | Дополнительная зависимость от Redis для security-critical path |
| **fastapi-users over Keycloak** | Проще деплой, меньше ops overhead | Менее зрелая MFA, audit trail, enterprise features |

### 5.3 Что бы улучшил при большем времени

- **Аномалии и ML**: автоматическое обнаружение аномальных расходов или паттернов ошибок
- **Multi-region**: geo-distributed ClickHouse кластер для глобальных команд
- **Audit log**: immutable log всех admin-действий для compliance
- **A/B тестирование агентов**: сравнение производительности разных моделей/конфигураций
- **Self-service quotas**: UI для org_admin-ов для настройки лимитов и алертов без обращения в support
- **Export и интеграции**: API для экспорта данных в BI-системы (Looker, Metabase), webhooks для внешних алертов
