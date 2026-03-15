"""FastAPI application entry point."""

from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.analytics.router import router as analytics_router
from app.auth.router import router as auth_router
from app.config import settings
from app.repositories.router import router as repositories_router
from app.sessions.router import router as sessions_router
from app.team.router import router as team_router

app = FastAPI(
    title=settings.app_name,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


api_router.include_router(auth_router)
api_router.include_router(analytics_router)
api_router.include_router(sessions_router)
api_router.include_router(team_router)
api_router.include_router(repositories_router)

app.include_router(api_router)

# Serve frontend static files in production (when built into ./static)
_static_dir = Path(__file__).resolve().parent.parent / "static"
if _static_dir.is_dir():
    app.mount(
        "/", StaticFiles(directory=str(_static_dir), html=True),
        name="static",
    )
