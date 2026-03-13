"""Tests for sessions module endpoints and service layer."""

import pytest
from httpx import AsyncClient

from app.sessions import service
from app.sessions.mock_data import SESSIONS


class TestSessionsService:
    """Tests for sessions service functions."""

    def test_list_sessions_default(self) -> None:
        result = service.list_sessions()
        assert len(result.data) == 20
        assert result.pagination.has_more is True
        assert result.pagination.approx_total == len(SESSIONS)
        assert result.pagination.limit == 20

    def test_list_sessions_custom_limit(self) -> None:
        result = service.list_sessions(limit=5)
        assert len(result.data) == 5
        assert result.pagination.has_more is True

    def test_list_sessions_filter_by_status(self) -> None:
        result = service.list_sessions(status="failed")
        for s in result.data:
            assert s.status == "failed"

    def test_list_sessions_filter_by_repo(self) -> None:
        result = service.list_sessions(repo="acme-corp/backend-api")
        for s in result.data:
            assert s.repo == "acme-corp/backend-api"

    def test_list_sessions_filter_by_user(self) -> None:
        result = service.list_sessions(user="alice@acme-corp.io")
        for s in result.data:
            assert s.user == "alice@acme-corp.io"

    def test_list_sessions_cursor_pagination(self) -> None:
        first_page = service.list_sessions(limit=3)
        assert first_page.pagination.next_cursor is not None

        second_page = service.list_sessions(
            cursor=first_page.pagination.next_cursor,
            limit=3,
        )
        first_ids = {s.session_id for s in first_page.data}
        second_ids = {s.session_id for s in second_page.data}
        assert first_ids.isdisjoint(second_ids)

    def test_list_sessions_invalid_cursor_raises(self) -> None:
        with pytest.raises(ValueError, match="Invalid cursor"):
            service.list_sessions(cursor="nonexistent", limit=3)

    def test_list_sessions_combined_filters(self) -> None:
        result = service.list_sessions(status="merged", repo="acme-corp/frontend-app")
        for s in result.data:
            assert s.status == "merged"
            assert s.repo == "acme-corp/frontend-app"

    def test_get_session_found(self) -> None:
        result = service.get_session("sess_001")
        assert result is not None
        assert result.session_id == "sess_001"
        assert result.repo == SESSIONS[0]["repo"]
        assert len(result.timeline) > 0

    def test_get_session_not_found(self) -> None:
        result = service.get_session("nonexistent")
        assert result is None

    def test_get_session_has_timeline(self) -> None:
        result = service.get_session("sess_001")
        assert result is not None
        assert result.timeline[0].event_type == "session_started"

    def test_get_session_detail_fields(self) -> None:
        result = service.get_session("sess_001")
        assert result is not None
        assert result.branch is not None
        assert result.commit_count >= 1
        assert result.files_changed >= 1
        assert result.finished_at is not None


class TestSessionsEndpoints:
    """Tests for sessions HTTP endpoints."""

    @pytest.mark.asyncio
    async def test_list_sessions(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/sessions?limit=5")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["data"]) == 5
        assert "pagination" in body

    @pytest.mark.asyncio
    async def test_list_sessions_filter_status(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/sessions?status=failed&limit=50")
        assert resp.status_code == 200
        for s in resp.json()["data"]:
            assert s["status"] == "failed"

    @pytest.mark.asyncio
    async def test_list_sessions_pagination(self, client: AsyncClient) -> None:
        resp1 = await client.get("/api/v1/sessions?limit=3")
        body1 = resp1.json()
        cursor = body1["pagination"]["next_cursor"]
        assert cursor is not None

        resp2 = await client.get(f"/api/v1/sessions?limit=3&cursor={cursor}")
        body2 = resp2.json()
        ids1 = {s["session_id"] for s in body1["data"]}
        ids2 = {s["session_id"] for s in body2["data"]}
        assert ids1.isdisjoint(ids2)

    @pytest.mark.asyncio
    async def test_get_session_detail(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/sessions/sess_001")
        assert resp.status_code == 200
        body = resp.json()
        assert body["session_id"] == "sess_001"
        assert "timeline" in body
        assert len(body["timeline"]) > 0

    @pytest.mark.asyncio
    async def test_get_session_not_found(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/sessions/nonexistent")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_list_sessions_invalid_cursor(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/sessions?cursor=nonexistent")
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_list_sessions_limit_validation(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/sessions?limit=0")
        assert resp.status_code == 422

        resp = await client.get("/api/v1/sessions?limit=101")
        assert resp.status_code == 422
