"""Static mock fixtures for repositories module."""

from typing import Final

REPOSITORIES: Final[list[dict]] = [
    {
        "repo": "acme-corp/backend-api",
        "sessions": 312,
        "tokens_used": 12_150_000,
        "prs_merged": 224,
        "success_rate": 90.1,
        "total_cost_usd": 607.50,
        "top_contributor": "alice@acme-corp.io",
        "last_session_at": "2026-03-12T09:14:00+00:00",
    },
    {
        "repo": "acme-corp/frontend-app",
        "sessions": 248,
        "tokens_used": 9_620_000,
        "prs_merged": 178,
        "success_rate": 88.3,
        "total_cost_usd": 481.00,
        "top_contributor": "carol@acme-corp.io",
        "last_session_at": "2026-03-12T08:42:00+00:00",
    },
    {
        "repo": "acme-corp/data-pipeline",
        "sessions": 187,
        "tokens_used": 7_280_000,
        "prs_merged": 131,
        "success_rate": 85.6,
        "total_cost_usd": 364.00,
        "top_contributor": "bob@acme-corp.io",
        "last_session_at": "2026-03-11T22:30:00+00:00",
    },
    {
        "repo": "acme-corp/infra-terraform",
        "sessions": 143,
        "tokens_used": 5_530_000,
        "prs_merged": 102,
        "success_rate": 87.4,
        "total_cost_usd": 276.50,
        "top_contributor": "dave@acme-corp.io",
        "last_session_at": "2026-03-11T18:15:00+00:00",
    },
    {
        "repo": "acme-corp/mobile-sdk",
        "sessions": 98,
        "tokens_used": 3_732_500,
        "prs_merged": 68,
        "success_rate": 84.7,
        "total_cost_usd": 186.63,
        "top_contributor": "alice@acme-corp.io",
        "last_session_at": "2026-03-11T15:50:00+00:00",
    },
]
