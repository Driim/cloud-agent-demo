"""Static mock fixtures for analytics module.

All time-series data is deterministic (seed-based arithmetic progressions
with sine-wave variation and day-of-week modulation) — no random module
is used so values are stable across restarts.
"""

import math
from datetime import date, timedelta
from typing import Final

# ---------------------------------------------------------------------------
# KPI overview
# ---------------------------------------------------------------------------

OVERVIEW: Final[dict] = {
    "total_sessions": 2_188,
    "total_tokens": 84_312_500,
    "total_spend_usd": 4_215.63,
    "total_prs_merged": 1_567,
    "success_rate": 87.4,
    "avg_cost_per_pr_usd": 2.69,
    "top_repos": [
        {"repo": "acme-corp/backend-api", "sessions": 412},
        {"repo": "acme-corp/frontend-app", "sessions": 348},
        {"repo": "acme-corp/data-pipeline", "sessions": 287},
        {"repo": "acme-corp/auth-service", "sessions": 234},
        {"repo": "acme-corp/ml-models", "sessions": 198},
        {"repo": "acme-corp/billing-engine", "sessions": 176},
        {"repo": "acme-corp/infra-terraform", "sessions": 163},
        {"repo": "acme-corp/mobile-sdk", "sessions": 148},
        {"repo": "acme-corp/notification-hub", "sessions": 124},
        {"repo": "acme-corp/docs-site", "sessions": 98},
    ],
}

# ---------------------------------------------------------------------------
# Time-series — 90 days of daily data
# ---------------------------------------------------------------------------
# Anchor date: 2026-03-12 (today per system clock)
_ANCHOR = date(2026, 3, 12)
_DAYS = 90


def _make_series(
    base: float,
    amplitude: float,
    period: int = 14,
    trend: float = 0.0,
    weekend_dip: float = 0.0,
) -> list[dict]:
    """Return 90 daily time-series points with sine wave, trend, and weekend dip."""
    points = []
    for i in range(_DAYS):
        day = _ANCHOR - timedelta(days=_DAYS - 1 - i)
        sine = amplitude * math.sin(2 * math.pi * i / period)
        # secondary harmonic for more organic shape
        sine2 = (amplitude * 0.3) * math.sin(2 * math.pi * i / 7)
        linear = trend * i
        # weekend dip: Saturday=5, Sunday=6
        weekday_factor = 1.0
        if day.weekday() >= 5:
            weekday_factor = 1.0 - weekend_dip
        value = (base + sine + sine2 + linear) * weekday_factor
        points.append({"timestamp": day.isoformat(), "value": round(max(value, 0), 2)})
    return points


TIMESERIES: Final[dict[str, list[dict]]] = {
    "tokens": _make_series(
        base=537_916, amplitude=80_000, period=14, trend=1200, weekend_dip=0.35
    ),
    "sessions": _make_series(
        base=24.3, amplitude=6.0, period=14, trend=0.08, weekend_dip=0.40
    ),
    "spend": _make_series(
        base=46.84, amplitude=8.0, period=14, trend=0.15, weekend_dip=0.35
    ),
    "prs": _make_series(
        base=17.4, amplitude=4.5, period=14, trend=0.06, weekend_dip=0.45
    ),
    "latency_p95": _make_series(
        base=380, amplitude=60, period=7, trend=0.5, weekend_dip=0.15
    ),
    "cost_per_session": _make_series(
        base=1.93, amplitude=0.3, period=14, trend=-0.005, weekend_dip=0.0
    ),
}

# ---------------------------------------------------------------------------
# Quotas
# ---------------------------------------------------------------------------

QUOTAS: Final[list[dict]] = [
    {"name": "Sessions", "used": 2_188, "limit": 5_000, "unit": "sessions/month"},
    {
        "name": "Tokens",
        "used": 84_312_500,
        "limit": 200_000_000,
        "unit": "tokens/month",
    },
    {"name": "Concurrent agents", "used": 6, "limit": 15, "unit": "agents"},
    {"name": "Storage", "used": 34.7, "limit": 100.0, "unit": "GB"},
    {"name": "API calls", "used": 12_480, "limit": 50_000, "unit": "calls/month"},
    {"name": "Sandbox hours", "used": 186.5, "limit": 500.0, "unit": "hours/month"},
]

# ---------------------------------------------------------------------------
# Cost breakdown
# ---------------------------------------------------------------------------

COSTS: Final[dict] = {
    "total_usd": 4_215.63,
    "breakdown": [
        {"category": "LLM tokens (input)", "amount_usd": 1_685.42, "percentage": 40.0},
        {
            "category": "LLM tokens (output)",
            "amount_usd": 1_264.69,
            "percentage": 30.0,
        },
        {
            "category": "Compute (sandboxes)",
            "amount_usd": 632.34,
            "percentage": 15.0,
        },
        {"category": "Embedding calls", "amount_usd": 252.94, "percentage": 6.0},
        {"category": "Storage & egress", "amount_usd": 210.78, "percentage": 5.0},
        {"category": "Code search index", "amount_usd": 126.47, "percentage": 3.0},
        {"category": "Other", "amount_usd": 42.99, "percentage": 1.0},
    ],
    "trend": [
        {"month": "2025-07", "amount_usd": 1_420.30},
        {"month": "2025-08", "amount_usd": 1_685.10},
        {"month": "2025-09", "amount_usd": 1_820.50},
        {"month": "2025-10", "amount_usd": 2_120.10},
        {"month": "2025-11", "amount_usd": 2_453.45},
        {"month": "2025-12", "amount_usd": 2_801.88},
        {"month": "2026-01", "amount_usd": 3_258.72},
        {"month": "2026-02", "amount_usd": 3_739.19},
        {"month": "2026-03", "amount_usd": 4_215.63},
    ],
}

# ---------------------------------------------------------------------------
# Error distribution
# ---------------------------------------------------------------------------

ERRORS: Final[dict] = {
    "total_errors": 276,
    "items": [
        {"error_type": "timeout", "count": 89, "percentage": 32.2},
        {"error_type": "context_overflow", "count": 64, "percentage": 23.2},
        {"error_type": "tool_call_failed", "count": 42, "percentage": 15.2},
        {"error_type": "sandbox_crash", "count": 28, "percentage": 10.1},
        {"error_type": "rate_limited", "count": 21, "percentage": 7.6},
        {"error_type": "build_failed", "count": 16, "percentage": 5.8},
        {"error_type": "dependency_conflict", "count": 9, "percentage": 3.3},
        {"error_type": "permission_denied", "count": 7, "percentage": 2.5},
    ],
}

# ---------------------------------------------------------------------------
# Token breakdown (input / output split for stacked chart)
# ---------------------------------------------------------------------------

TOKEN_BREAKDOWN: Final[dict[str, list[dict]]] = {
    "token_input": _make_series(
        base=322_750, amplitude=48_000, period=14, trend=720, weekend_dip=0.35
    ),
    "token_output": _make_series(
        base=215_166, amplitude=32_000, period=14, trend=480, weekend_dip=0.35
    ),
}

# ---------------------------------------------------------------------------
# Session outcomes (completed / merged / failed / timed_out)
# ---------------------------------------------------------------------------

SESSION_OUTCOMES: Final[dict] = {
    "total": 80,
    "items": [
        {"status": "completed", "count": 27, "percentage": 33.75},
        {"status": "merged", "count": 33, "percentage": 41.25},
        {"status": "failed", "count": 13, "percentage": 16.25},
        {"status": "timed_out", "count": 7, "percentage": 8.75},
    ],
}

# ---------------------------------------------------------------------------
# Tokens per merged PR
# ---------------------------------------------------------------------------

TOKENS_PER_PR: Final[dict] = {
    "avg_tokens_per_pr": 53_810,
    "delta_pct": -4.2,
}

# ---------------------------------------------------------------------------
# Duration distribution (session length buckets)
# ---------------------------------------------------------------------------

DURATION_DISTRIBUTION: Final[list[dict]] = [
    {"bucket": "< 1 min", "count": 5},
    {"bucket": "1\u20135 min", "count": 28},
    {"bucket": "5\u201315 min", "count": 31},
    {"bucket": "15+ min", "count": 16},
]

# ---------------------------------------------------------------------------
# Adoption rate
# ---------------------------------------------------------------------------

ADOPTION_RATE: Final[dict] = {
    "rate_7d": 75.0,
    "rate_30d": 100.0,
    "total_members": 8,
    "active_7d": 6,
    "active_30d": 8,
    "delta_7d_pct": 12.5,
}
