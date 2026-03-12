"""Tests for team module endpoints and service layer."""

import asyncio
import json

import pytest
from httpx import AsyncClient

from app.team import service
from app.team.mock_data import TEAM_MEMBERS


class TestTeamService:
    """Tests for team service functions."""

    def test_get_team_stats_count(self) -> None:
        result = service.get_team_stats()
        assert len(result) == len(TEAM_MEMBERS)

    def test_get_team_stats_fields(self) -> None:
        result = service.get_team_stats()
        first = result[0]
        assert first.user == TEAM_MEMBERS[0]["user"]
        assert first.display_name == TEAM_MEMBERS[0]["display_name"]
        assert first.sessions == TEAM_MEMBERS[0]["sessions"]
        assert first.tokens_used == TEAM_MEMBERS[0]["tokens_used"]
        assert first.prs_merged == TEAM_MEMBERS[0]["prs_merged"]
        assert first.success_rate == TEAM_MEMBERS[0]["success_rate"]

    @pytest.mark.asyncio
    async def test_stream_activity_feed_yields_events(self) -> None:
        events: list[dict] = []
        async for event in service.stream_activity_feed():
            events.append(event)
            if len(events) >= 2:
                break
        assert len(events) == 2
        assert "event" in events[0]
        assert "data" in events[0]
        parsed = json.loads(events[0]["data"])
        assert "event_id" in parsed

    @pytest.mark.asyncio
    async def test_stream_activity_feed_json_serializable(self) -> None:
        async for event in service.stream_activity_feed():
            data = json.loads(event["data"])
            assert isinstance(data["timestamp"], str)
            break


class TestTeamEndpoints:
    """Tests for team HTTP endpoints."""

    @pytest.mark.asyncio
    async def test_get_team_stats(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/team")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == len(TEAM_MEMBERS)
        assert body[0]["user"] == TEAM_MEMBERS[0]["user"]

    @pytest.mark.asyncio
    async def test_team_stats_has_all_members(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/analytics/team")
        users = {m["user"] for m in resp.json()}
        expected = {m["user"] for m in TEAM_MEMBERS}
        assert users == expected

    def test_team_feed_returns_event_source_response(self) -> None:
        """Verify the feed endpoint returns an EventSourceResponse."""
        from sse_starlette.sse import EventSourceResponse

        from app.auth.dependencies import get_current_user
        from app.team.router import get_team_feed

        user = get_current_user(
            authorization="Bearer mock.token",
        )
        loop = asyncio.new_event_loop()
        try:
            result = loop.run_until_complete(
                get_team_feed(_=user),
            )
            assert isinstance(result, EventSourceResponse)
        finally:
            loop.close()
