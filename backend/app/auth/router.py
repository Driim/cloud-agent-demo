"""Auth router: token issuance, refresh, and user profile endpoints."""

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.auth.mock_data import MOCK_ACCESS_TOKEN, MOCK_REFRESH_TOKEN
from app.auth.schemas import RefreshRequest, TokenRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=TokenResponse)
async def login(body: TokenRequest) -> TokenResponse:
    """Issue mock access and refresh tokens.

    Credentials are accepted as-is (no real validation in mock mode).
    """
    return TokenResponse(
        access_token=MOCK_ACCESS_TOKEN,
        refresh_token=MOCK_REFRESH_TOKEN,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest) -> TokenResponse:
    """Issue a new mock token pair from a refresh token."""
    return TokenResponse(
        access_token=MOCK_ACCESS_TOKEN,
        refresh_token=MOCK_REFRESH_TOKEN,
    )


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Return the profile of the currently authenticated user."""
    return current_user
