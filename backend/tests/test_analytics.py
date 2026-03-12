"""Tests for analytics module endpoints and service layer."""

import pytest
from httpx import AsyncClient

from app.analytics import service
from app.analytics.mock_data import COSTS, ERRORS, OVERVIEW, QUOTAS


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
