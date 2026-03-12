"""Tests for health check and app configuration."""

import pytest
from httpx import AsyncClient


class TestHealthCheck:
    """Tests for GET /api/v1/health."""

    @pytest.mark.asyncio
    async def test_health_returns_ok(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}
