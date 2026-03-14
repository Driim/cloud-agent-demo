"""Tests for analytics module endpoints and service layer."""

import pytest
from httpx import AsyncClient

from app.analytics import service
from app.analytics.mock_data import (
    ADOPTION_RATE,
    COSTS,
    DURATION_DISTRIBUTION,
    ERRORS,
    OVERVIEW,
    QUOTAS,
    SESSION_OUTCOMES,
    TOKENS_PER_PR,
)


class TestAnalyticsService:
    """Tests for analytics service functions."""

    def test_get_overview_returns_all_fields(self) -> None:
        result = service.get_overview()
        assert result.total_sessions == OVERVIEW["total_sessions"]
        assert result.total_tokens == OVERVIEW["total_tokens"]
        assert result.total_spend_usd == OVERVIEW["total_spend_usd"]
        assert result.total_prs_merged == OVERVIEW["total_prs_merged"]
        assert result.success_rate == OVERVIEW["success_rate"]
        assert result.avg_cost_per_pr_usd == OVERVIEW["avg_cost_per_pr_usd"]
        assert len(result.top_repos) == len(OVERVIEW["top_repos"])

    def test_get_timeseries_30d(self) -> None:
        result = service.get_timeseries(
            metric="tokens", range_="30d", granularity="day"
        )
        assert result.metric == "tokens"
        assert result.range == "30d"
        assert len(result.points) == 30

    def test_get_timeseries_7d(self) -> None:
        result = service.get_timeseries(
            metric="sessions", range_="7d", granularity="day"
        )
        assert len(result.points) == 7

    def test_get_timeseries_90d(self) -> None:
        result = service.get_timeseries(metric="spend", range_="90d", granularity="day")
        assert len(result.points) == 90

    def test_get_quotas(self) -> None:
        result = service.get_quotas()
        assert len(result) == len(QUOTAS)
        assert result[0].name == QUOTAS[0]["name"]

    def test_get_costs(self) -> None:
        result = service.get_costs()
        assert result.total_usd == COSTS["total_usd"]
        assert len(result.breakdown) == len(COSTS["breakdown"])
        assert len(result.trend) == len(COSTS["trend"])

    def test_get_errors(self) -> None:
        result = service.get_errors()
        assert result.total_errors == ERRORS["total_errors"]
        assert len(result.items) == len(ERRORS["items"])

    def test_get_token_breakdown_30d(self) -> None:
        result = service.get_token_breakdown(range_="30d", granularity="day")
        assert result.metric == "token_breakdown"
        assert result.range == "30d"
        assert len(result.points) == 30
        point = result.points[0]
        assert point.input_tokens > 0
        assert point.output_tokens > 0

    def test_get_session_outcomes(self) -> None:
        result = service.get_session_outcomes()
        assert result.total == SESSION_OUTCOMES["total"]
        assert len(result.items) == 4
        statuses = {item.status for item in result.items}
        assert statuses == {"completed", "merged", "failed", "timed_out"}

    def test_get_tokens_per_pr(self) -> None:
        result = service.get_tokens_per_pr()
        assert result.avg_tokens_per_pr == TOKENS_PER_PR["avg_tokens_per_pr"]
        assert result.delta_pct == TOKENS_PER_PR["delta_pct"]

    def test_get_duration_distribution(self) -> None:
        result = service.get_duration_distribution()
        assert len(result) == len(DURATION_DISTRIBUTION)
        total = sum(b.count for b in result)
        assert total == SESSION_OUTCOMES["total"]

    def test_get_adoption_rate(self) -> None:
        result = service.get_adoption_rate()
        assert result.rate_7d == ADOPTION_RATE["rate_7d"]
        assert result.rate_30d == ADOPTION_RATE["rate_30d"]
        assert result.total_members == ADOPTION_RATE["total_members"]


class TestAnalyticsEndpoints:
    """Tests for analytics HTTP endpoints."""

    @pytest.mark.asyncio
    async def test_overview(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/overview")
        assert resp.status_code == 200
        body = resp.json()
        assert "total_sessions" in body
        assert "top_repos" in body

    @pytest.mark.asyncio
    async def test_timeseries_tokens(self, client: AsyncClient) -> None:
        resp = await client.get(
            "/api/v1/analytics/timeseries/tokens?range=7d&granularity=day"
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["metric"] == "tokens"
        assert len(body["points"]) == 7

    @pytest.mark.asyncio
    async def test_timeseries_invalid_metric(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/timeseries/invalid")
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_timeseries_invalid_range(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/timeseries/tokens?range=999d")
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_timeseries_invalid_granularity(self, client: AsyncClient) -> None:
        resp = await client.get(
            "/api/v1/analytics/timeseries/tokens?granularity=minute"
        )
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_quotas(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/quotas")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == len(QUOTAS)

    @pytest.mark.asyncio
    async def test_costs(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/costs")
        assert resp.status_code == 200
        body = resp.json()
        assert "total_usd" in body
        assert "breakdown" in body

    @pytest.mark.asyncio
    async def test_errors(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/errors")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total_errors"] == ERRORS["total_errors"]

    @pytest.mark.asyncio
    async def test_token_breakdown(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/token-breakdown?range=30d")
        assert resp.status_code == 200
        body = resp.json()
        assert body["metric"] == "token_breakdown"
        assert len(body["points"]) == 30
        assert "input_tokens" in body["points"][0]
        assert "output_tokens" in body["points"][0]

    @pytest.mark.asyncio
    async def test_session_outcomes(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/session-outcomes")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] == SESSION_OUTCOMES["total"]
        assert len(body["items"]) == 4

    @pytest.mark.asyncio
    async def test_tokens_per_pr(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/tokens-per-pr")
        assert resp.status_code == 200
        body = resp.json()
        assert "avg_tokens_per_pr" in body
        assert "delta_pct" in body

    @pytest.mark.asyncio
    async def test_duration_distribution(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/duration-distribution")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == 4

    @pytest.mark.asyncio
    async def test_timeseries_latency_p95(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/timeseries/latency_p95?range=30d")
        assert resp.status_code == 200
        body = resp.json()
        assert body["metric"] == "latency_p95"
        assert len(body["points"]) == 30

    @pytest.mark.asyncio
    async def test_adoption_rate(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/adoption-rate")
        assert resp.status_code == 200
        body = resp.json()
        assert body["rate_7d"] == ADOPTION_RATE["rate_7d"]
        assert body["total_members"] == ADOPTION_RATE["total_members"]
