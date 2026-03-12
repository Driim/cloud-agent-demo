"""Mock user fixtures for auth module."""

from typing import Final

MOCK_USER: Final[dict] = {
    "user_id": "user_001",
    "email": "admin@acme-corp.io",
    "org_id": "org_abc123",
    "role": "org_admin",
    "plan": "enterprise",
    "password": "mock-password",
}

# JWT payload structure per system_design section 3.2
MOCK_JWT_PAYLOAD: Final[dict] = {
    "jti": "tok_a1b2c3d4e5f6",
    "sub": MOCK_USER["email"],
    "org_id": MOCK_USER["org_id"],
    "role": MOCK_USER["role"],
    "plan": MOCK_USER["plan"],
}

MOCK_ACCESS_TOKEN: Final[str] = "mock.access.token"
MOCK_REFRESH_TOKEN: Final[str] = "mock.refresh.token"
