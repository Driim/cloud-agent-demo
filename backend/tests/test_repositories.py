"""Tests for repositories module endpoint."""

import pytest
from httpx import AsyncClient

from app.repositories.mock_data import REPOSITORIES


class TestRepositoriesEndpoint:
    """Tests for GET /api/v1/analytics/repositories."""

    @pytest.mark.asyncio
    async def test_returns_all_repos(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/repositories")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == len(REPOSITORIES)

    @pytest.mark.asyncio
    async def test_repo_fields(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/repositories")
        first = resp.json()[0]
        assert first["repo"] == REPOSITORIES[0]["repo"]
        assert first["sessions"] == REPOSITORIES[0]["sessions"]
        assert first["tokens_used"] == REPOSITORIES[0]["tokens_used"]
        assert first["prs_merged"] == REPOSITORIES[0]["prs_merged"]
        assert first["success_rate"] == REPOSITORIES[0]["success_rate"]
        assert first["total_cost_usd"] == REPOSITORIES[0]["total_cost_usd"]
        assert first["top_contributor"] == REPOSITORIES[0]["top_contributor"]
        assert first["last_session_at"] is not None

    @pytest.mark.asyncio
    async def test_all_repos_present(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/repositories")
        repos = {r["repo"] for r in resp.json()}
        expected = {r["repo"] for r in REPOSITORIES}
        assert repos == expected
