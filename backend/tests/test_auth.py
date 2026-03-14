"""Tests for auth module endpoints and dependencies."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.auth.dependencies import get_current_user
from app.auth.mock_data import MOCK_ACCESS_TOKEN, MOCK_REFRESH_TOKEN, MOCK_USER
from app.main import app


class TestGetCurrentUser:
    """Tests for the get_current_user dependency."""

    def test_returns_user_profile_with_valid_header(self) -> None:
        user = get_current_user(authorization="Bearer mock.token")
        assert user.user_id == MOCK_USER["user_id"]
        assert user.email == MOCK_USER["email"]
        assert user.org_id == MOCK_USER["org_id"]
        assert user.role == MOCK_USER["role"]
        assert user.plan == MOCK_USER["plan"]

    def test_excludes_password(self) -> None:
        user = get_current_user(authorization="Bearer mock.token")
        assert not hasattr(user, "password")

    def test_raises_401_without_header(self) -> None:
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(authorization=None)
        assert exc_info.value.status_code == 401

    def test_raises_401_without_bearer_prefix(self) -> None:
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(authorization="Basic abc123")
        assert exc_info.value.status_code == 401


class TestAuthEndpoints401:
    """Tests that protected endpoints return 401 without auth."""

    @pytest.mark.asyncio
    async def test_me_without_auth_returns_401(self) -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            resp = await ac.get("/api/v1/auth/me")
            assert resp.status_code == 401


class TestPostToken:
    """Tests for POST /api/v1/auth/token."""

    @pytest.mark.asyncio
    async def test_returns_tokens_with_valid_credentials(
        self, client: AsyncClient
    ) -> None:
        resp = await client.post(
            "/api/v1/auth/token",
            json={
                "email": MOCK_USER["email"],
                "password": MOCK_USER["password"],
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["access_token"] == MOCK_ACCESS_TOKEN
        assert body["refresh_token"] == MOCK_REFRESH_TOKEN
        assert body["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_returns_401_with_invalid_credentials(
        self, client: AsyncClient
    ) -> None:
        resp = await client.post(
            "/api/v1/auth/token",
            json={"email": "wrong@example.com", "password": "wrong"},
        )
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_missing_fields_returns_422(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/auth/token", json={})
        assert resp.status_code == 422


class TestPostRefresh:
    """Tests for POST /api/v1/auth/refresh."""

    @pytest.mark.asyncio
    async def test_returns_new_tokens_with_valid_refresh(
        self, client: AsyncClient
    ) -> None:
        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": MOCK_REFRESH_TOKEN},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["access_token"] == MOCK_ACCESS_TOKEN
        assert body["refresh_token"] == MOCK_REFRESH_TOKEN

    @pytest.mark.asyncio
    async def test_returns_401_with_invalid_refresh(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid.token"},
        )
        assert resp.status_code == 401


class TestGetMe:
    """Tests for GET /api/v1/auth/me."""

    @pytest.mark.asyncio
    async def test_returns_user_profile(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 200
        body = resp.json()
        assert body["user_id"] == MOCK_USER["user_id"]
        assert body["email"] == MOCK_USER["email"]
        assert body["org_id"] == MOCK_USER["org_id"]
