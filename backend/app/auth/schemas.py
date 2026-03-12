"""Pydantic schemas for auth module."""

from pydantic import BaseModel


class TokenRequest(BaseModel):
    """Request body for obtaining a token."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """Response containing JWT access and refresh tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Request body for refreshing a token."""

    refresh_token: str


class UserProfile(BaseModel):
    """Authenticated user profile."""

    user_id: str
    email: str
    org_id: str
    role: str
    plan: str
