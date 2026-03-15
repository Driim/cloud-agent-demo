# ClickHouse: Implementation Reference

This document contains ClickHouse-specific SQL schemas, DDL examples, and backend code patterns referenced in [system_design.md](system_design.md).

---

## 1. Ingestion Pipeline (Ingestion Worker)

A stateless **Ingestion Worker** (Python service, or [Vector](https://vector.dev/) / [Benthos](https://www.benthos.dev/) for a config-driven approach) sits between Kafka and ClickHouse. It consumes `agent.events`, validates schemas, routes malformed events to a Dead Letter Queue (`events.dlq` topic), assembles optimally-sized batches, and inserts into ClickHouse via `INSERT ... FORMAT Native`.

> **Why not Kafka Engine?** ClickHouse Kafka Engine eliminates the worker tier but introduces production risks: no DLQ for poison pills, limited batching control, and a single malformed message can stall the entire pipeline. See [system_design.md §3.3](system_design.md) for the full rationale.

### Step 1.1 — Raw Storage Tables (MergeTree)

The Ingestion Worker inserts validated events directly into this table.

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
-- Raw events: 90 days
ALTER TABLE sessions_raw
    MODIFY TTL created_at + INTERVAL 90 DAY;

-- Aggregated data: 1 year
ALTER TABLE sessions_aggregated
    MODIFY TTL maxMerge(last_updated) + INTERVAL 1 YEAR;
```

---

## 6. Pagination

Cursor-based pagination uses `has_more` (computed by fetching `limit + 1` rows). No `total` or `approx_total` field is returned by the paginated endpoint — when a count is needed (e.g., Overview page badge), it comes from a pre-aggregated materialized view via `/analytics/overview`, not from `COUNT(*)` over the raw table. See [system_design.md §2.4](system_design.md) for the rationale.

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
| `sessions_raw` | MergeTree | Raw event storage (populated by Ingestion Worker), TTL 90 days |
| `sessions_aggregated` | AggregatingMergeTree | Per-session `argMax` state + token sums, TTL 1 year |
| `mv_sessions_aggregated` | Materialized View | `sessions_raw` → `sessions_aggregated` |
