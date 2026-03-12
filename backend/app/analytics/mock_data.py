"""Static mock fixtures for analytics module.

All time-series data is deterministic (seed-based arithmetic progressions
with a sine-wave variation) — no random module is used so values are
stable across restarts.
"""

import math
from datetime import date, timedelta
from typing import Final

# ---------------------------------------------------------------------------
# KPI overview
# ---------------------------------------------------------------------------

OVERVIEW: Final[dict] = {
    "total_sessions": 1_247,
    "total_tokens": 48_312_500,
    "total_spend_usd": 2_415.63,
    "total_prs_merged": 892,
    "success_rate": 87.4,
    "avg_cost_per_pr_usd": 2.71,
    "top_repos": [
        {"repo": "acme-corp/backend-api", "sessions": 312},
        {"repo": "acme-corp/frontend-app", "sessions": 248},
        {"repo": "acme-corp/data-pipeline", "sessions": 187},
        {"repo": "acme-corp/infra-terraform", "sessions": 143},
        {"repo": "acme-corp/mobile-sdk", "sessions": 98},
    ],
}

# ---------------------------------------------------------------------------
# Time-series — 90 days of daily data
# ---------------------------------------------------------------------------
# Anchor date: 2026-03-12 (today per system clock)
_ANCHOR = date(2026, 3, 12)
_DAYS = 90


def _make_series(base: float, amplitude: float, period: int = 14) -> list[dict]:
    """Return 90 daily time-series points using a sine wave around base."""
    points = []
    for i in range(_DAYS):
        day = _ANCHOR - timedelta(days=_DAYS - 1 - i)
        value = base + amplitude * math.sin(2 * math.pi * i / period)
        points.append({"timestamp": day.isoformat(), "value": round(value, 2)})
    return points


TIMESERIES: Final[dict[str, list[dict]]] = {
    "tokens": _make_series(base=537_916, amplitude=80_000, period=14),
    "sessions": _make_series(base=13.86, amplitude=4.0, period=14),
    "spend": _make_series(base=26.84, amplitude=5.0, period=14),
    "prs": _make_series(base=9.91, amplitude=3.0, period=14),
}

# ---------------------------------------------------------------------------
# Quotas
# ---------------------------------------------------------------------------

QUOTAS: Final[list[dict]] = [
    {"name": "Sessions", "used": 1_247, "limit": 5_000, "unit": "sessions/month"},
    {
        "name": "Tokens",
        "used": 48_312_500,
        "limit": 100_000_000,
        "unit": "tokens/month",
    },
    {"name": "Concurrent agents", "used": 4, "limit": 10, "unit": "agents"},
    {"name": "Storage", "used": 18.4, "limit": 100.0, "unit": "GB"},
]

# ---------------------------------------------------------------------------
# Cost breakdown
# ---------------------------------------------------------------------------

COSTS: Final[dict] = {
    "total_usd": 2_415.63,
    "breakdown": [
        {"category": "LLM tokens", "amount_usd": 1_685.42, "percentage": 69.8},
        {"category": "Compute (sandboxes)", "amount_usd": 482.31, "percentage": 20.0},
        {"category": "Storage & egress", "amount_usd": 144.94, "percentage": 6.0},
        {"category": "Other", "amount_usd": 102.96, "percentage": 4.2},
    ],
    "trend": [
        {"month": "2025-10", "amount_usd": 1_820.10},
        {"month": "2025-11", "amount_usd": 1_953.45},
        {"month": "2025-12", "amount_usd": 2_101.88},
        {"month": "2026-01", "amount_usd": 2_258.72},
        {"month": "2026-02", "amount_usd": 2_339.19},
        {"month": "2026-03", "amount_usd": 2_415.63},
    ],
}

# ---------------------------------------------------------------------------
# Error distribution
# ---------------------------------------------------------------------------

ERRORS: Final[dict] = {
    "total_errors": 158,
    "items": [
        {"error_type": "timeout", "count": 72, "percentage": 45.6},
        {"error_type": "context_overflow", "count": 38, "percentage": 24.1},
        {"error_type": "tool_call_failed", "count": 27, "percentage": 17.1},
        {"error_type": "sandbox_crash", "count": 14, "percentage": 8.9},
        {"error_type": "rate_limited", "count": 7, "percentage": 4.3},
    ],
}
