# ClickHouse: Implementation Reference

This document contains ClickHouse-specific SQL schemas, DDL examples, and backend code patterns referenced in [system_design.md](system_design.md).

---

## 1. Ingestion Pipeline (Kafka Engine)

### Step 1.1 — Kafka Engine Consumer Tables

For each Kafka topic, create a table using the `Kafka` engine. ClickHouse acts as a consumer directly — no Python workers needed for ingestion.

```sql
CREATE TABLE kafka_agent_events (
    org_id     String,
    session_id String,
    event_id   String,
    status     String,
    tokens     UInt32,
    cost       Float64,
    created_at DateTime
) ENGINE = Kafka
SETTINGS kafka_broker_list = 'broker:9092',
         kafka_topic_list   = 'agent.events',
         kafka_group_name   = 'clickhouse_ingestion',
         kafka_format       = 'JSONEachRow';
```

### Step 1.2 — Raw Storage Tables (MergeTree)

```sql
CREATE TABLE sessions_raw (
    org_id     String,
    session_id String,
    event_id   String,
    status     String,
    tokens     UInt32,
    cost       Float64,
    created_at DateTime
) ENGINE = MergeTree()
ORDER BY (org_id, session_id, created_at);
```

### Step 1.3 — Materialized View: Kafka → Raw

```sql
CREATE MATERIALIZED VIEW mv_kafka_to_raw TO sessions_raw AS
SELECT * FROM kafka_agent_events;
```

---

## 2. Deduplication & Aggregation (AggregatingMergeTree)

Replaces TimescaleDB Continuous Aggregates. Uses `argMax` for last-write-wins state resolution and `sum` for counters.

### Step 2.1 — Aggregated State Table

```sql
CREATE TABLE sessions_aggregated (
    org_id         String,
    session_id     String,
    latest_status  AggregateFunction(argMax, String, DateTime),
    total_tokens   AggregateFunction(sum, UInt32),
    final_cost     AggregateFunction(argMax, Float64, DateTime),
    last_updated   AggregateFunction(max, DateTime)
) ENGINE = AggregatingMergeTree()
ORDER BY (org_id, session_id);
```

### Step 2.2 — Materialized View: Raw → Aggregated

```sql
CREATE MATERIALIZED VIEW mv_sessions_aggregated TO sessions_aggregated AS
SELECT
    org_id,
    session_id,
    argMaxState(status, created_at)  AS latest_status,
    sumState(tokens)                 AS total_tokens,
    argMaxState(cost, created_at)    AS final_cost,
    maxState(created_at)             AS last_updated
FROM sessions_raw
GROUP BY org_id, session_id;
```

---

## 3. Querying Aggregated Data

Use `*Merge` combinators to finalize aggregate states at query time.

```sql
SELECT
    session_id,
    argMaxMerge(latest_status) AS status,
    sumMerge(total_tokens)     AS tokens,
    argMaxMerge(final_cost)    AS cost
FROM sessions_aggregated
WHERE org_id = {org_id:String}
GROUP BY session_id
ORDER BY maxMerge(last_updated) DESC
LIMIT 50
```

> `{org_id:String}` uses ClickHouse's parameterized query syntax — never interpolate `org_id` via string concatenation.

---

## 4. FastAPI Backend Integration

### Driver

Replace `asyncpg` + SQLAlchemy with `clickhouse-connect` (recommended) or `asynch`:

```
pip install clickhouse-connect
# or
pip install asynch
```

### Endpoint Example

```python
import clickhouse_connect
from fastapi import Depends

client = clickhouse_connect.get_async_client(host="clickhouse", port=8123)

@app.get("/api/v1/sessions")
async def get_sessions(org_id: str = Depends(get_current_org)):
    query = """
        SELECT
            session_id,
            argMaxMerge(latest_status) AS status,
            sumMerge(total_tokens)     AS tokens,
            argMaxMerge(final_cost)    AS cost
        FROM sessions_aggregated
        WHERE org_id = {org_id:String}
        GROUP BY session_id
        ORDER BY maxMerge(last_updated) DESC
        LIMIT 50
    """
    result = await client.query(query, parameters={"org_id": org_id})
    return result.result_rows
```

### Multi-Tenancy Pattern

`org_id` is extracted from the JWT in every request via `Depends(get_current_org)` and injected as a parameter into every query. No RLS at the database level — isolation is enforced at the application layer.

```python
async def get_current_org(token: str = Depends(oauth2_scheme)) -> str:
    payload = verify_jwt(token)
    return payload["org_id"]  # always sourced from the verified token
```

---

## 5. Data Retention (TTL)

ClickHouse TTL replaces TimescaleDB retention policies.

```sql
-- Raw events: 7 days
ALTER TABLE sessions_raw
    MODIFY TTL created_at + INTERVAL 7 DAY;

-- Aggregated data: 1 year
ALTER TABLE sessions_aggregated
    MODIFY TTL maxMerge(last_updated) + INTERVAL 1 YEAR;
```

---

## 6. Pagination: Count Queries

Unlike TimescaleDB's `approximate_row_count()`, ClickHouse `COUNT()` with an `org_id` filter is near-instant due to sparse index scans on the primary key:

```sql
SELECT count()
FROM sessions_raw
WHERE org_id = {org_id:String};
```

No special approximation function is needed.

---

## 7. Grafana Alerting (ClickHouse Data Source)

Replace the PostgreSQL data source with the [ClickHouse Grafana plugin](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/). Rewrite alert queries using ClickHouse syntax:

```sql
-- P95 API latency alert
SELECT quantile(0.95)(latency_ms) AS p95_latency
FROM api_requests
WHERE org_id = {org_id:String}
  AND created_at >= now() - INTERVAL 5 MINUTE;

-- Error rate alert
SELECT countIf(status = 'error') / count() AS error_rate
FROM sessions_raw
WHERE org_id = {org_id:String}
  AND created_at >= now() - INTERVAL 5 MINUTE;
```

---

## 8. Table Topology Summary

| Table | Engine | Role |
|---|---|---|
| `kafka_agent_events` | Kafka | Consumes `agent.events` topic directly |
| `sessions_raw` | MergeTree | Structured raw event storage with TTL |
| `sessions_aggregated` | AggregatingMergeTree | Per-session `argMax` state + token sums |
| `mv_kafka_to_raw` | Materialized View | Kafka Engine → `sessions_raw` |
| `mv_sessions_aggregated` | Materialized View | `sessions_raw` → `sessions_aggregated` |
