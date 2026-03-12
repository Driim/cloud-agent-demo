"""Shared test fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    """Async HTTP client wired to the FastAPI test app."""
    transport = ASGITransport(app=app)
    headers = {"Authorization": "Bearer mock.access.token"}
    async with AsyncClient(
        transport=transport, base_url="http://test", headers=headers
    ) as ac:
        yield ac
