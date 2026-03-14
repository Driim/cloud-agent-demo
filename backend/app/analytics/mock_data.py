"""Static mock fixtures for analytics module.

All time-series data is deterministic (seed-based arithmetic progressions
with sine-wave variation and day-of-week modulation) — no random module
is used so values are stable across restarts.

Values calibrated to industry benchmarks (March 2026):
- Token consumption: 20–35M/day (team), median 550K/session
- Spend: $180–220/day weekdays, $30–50 weekends (5:1 ratio)
- Session outcomes: completed 50%, merged 25%, failed 17%, timed_out 8%
- Cost breakdown: output tokens 52%, compute 22%, input tokens 18%, storage 8%
- Duration: median 25 min, buckets <10/10–30/30–60/60+ min
"""

import math
from datetime import date, timedelta
from typing import Final

# ---------------------------------------------------------------------------
# KPI overview (current month, mid-cycle)
# ---------------------------------------------------------------------------

OVERVIEW: Final[dict] = {
    "total_sessions": 1_050,
    "total_tokens": 547_500_000,
    "total_spend_usd": 2_580.00,
    "total_prs_merged": 262,
    "success_rate": 71.0,
    "avg_cost_per_pr_usd": 9.85,
    "top_repos": [
        {"repo": "acme-corp/backend-api", "sessions": 231},
        {"repo": "acme-corp/frontend-app", "sessions": 189},
        {"repo": "acme-corp/auth-service", "sessions": 147},
        {"repo": "acme-corp/data-pipeline", "sessions": 105},
        {"repo": "acme-corp/mobile-sdk", "sessions": 95},
        {"repo": "acme-corp/ml-models", "sessions": 84},
        {"repo": "acme-corp/infra-terraform", "sessions": 74},
        {"repo": "acme-corp/docs-site", "sessions": 52},
        {"repo": "acme-corp/billing-engine", "sessions": 42},
        {"repo": "acme-corp/notification-hub", "sessions": 31},
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
        base=22_000_000, amplitude=3_500_000, period=14, trend=50_000, weekend_dip=0.80
    ),
    "sessions": _make_series(
        base=35, amplitude=6.0, period=14, trend=0.08, weekend_dip=0.80
    ),
    "spend": _make_series(
        base=200, amplitude=25.0, period=14, trend=0.5, weekend_dip=0.80
    ),
    "prs": _make_series(
        base=8.5, amplitude=2.5, period=14, trend=0.03, weekend_dip=0.85
    ),
    "latency_p95": _make_series(
        base=10_000, amplitude=1_500, period=7, trend=-8, weekend_dip=0.15
    ),
    "cost_per_session": _make_series(
        base=3.50, amplitude=0.5, period=14, trend=-0.01, weekend_dip=0.0
    ),
}

# ---------------------------------------------------------------------------
# Quotas (mid-cycle: 55–70% utilisation)
# ---------------------------------------------------------------------------

QUOTAS: Final[list[dict]] = [
    {"name": "Sessions", "used": 1_050, "limit": 1_500, "unit": "sessions/month"},
    {
        "name": "Tokens",
        "used": 547_500_000,
        "limit": 1_000_000_000,
        "unit": "tokens/month",
    },
    {"name": "Concurrent agents", "used": 4, "limit": 10, "unit": "agents"},
    {"name": "API calls", "used": 32_500, "limit": 50_000, "unit": "calls/month"},
    {"name": "Storage", "used": 34.7, "limit": 100.0, "unit": "GB"},
    {"name": "Sandbox hours", "used": 186.5, "limit": 500.0, "unit": "hours/month"},
]

# ---------------------------------------------------------------------------
# Cost breakdown (output tokens dominate due to 5× price multiplier)
# ---------------------------------------------------------------------------

COSTS: Final[dict] = {
    "total_usd": 2_580.00,
    "breakdown": [
        {
            "category": "LLM tokens (output)",
            "amount_usd": 1_341.60,
            "percentage": 52.0,
        },
        {
            "category": "Compute (sandboxes)",
            "amount_usd": 567.60,
            "percentage": 22.0,
        },
        {
            "category": "LLM tokens (input)",
            "amount_usd": 464.40,
            "percentage": 18.0,
        },
        {"category": "Storage & egress", "amount_usd": 206.40, "percentage": 8.0},
    ],
    "trend": [
        {"month": "2025-07", "amount_usd": 1_041.00},
        {"month": "2025-08", "amount_usd": 1_166.00},
        {"month": "2025-09", "amount_usd": 1_306.00},
        {"month": "2025-10", "amount_usd": 1_463.00},
        {"month": "2025-11", "amount_usd": 1_639.00},
        {"month": "2025-12", "amount_usd": 1_836.00},
        {"month": "2026-01", "amount_usd": 2_057.00},
        {"month": "2026-02", "amount_usd": 2_304.00},
        {"month": "2026-03", "amount_usd": 2_580.00},
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
# Output:Input = 1:4 → input 80% of volume, output 20%
# ---------------------------------------------------------------------------

TOKEN_BREAKDOWN: Final[dict[str, list[dict]]] = {
    "token_input": _make_series(
        base=17_600_000, amplitude=2_600_000, period=14, trend=40_000, weekend_dip=0.80
    ),
    "token_output": _make_series(
        base=4_400_000, amplitude=650_000, period=14, trend=10_000, weekend_dip=0.80
    ),
}

# ---------------------------------------------------------------------------
# Session outcomes (completed / merged / failed / timed_out)
# Benchmark: completed 50%, merged 25%, failed 17%, timed_out 8%
# ---------------------------------------------------------------------------

SESSION_OUTCOMES: Final[dict] = {
    "total": 1_050,
    "items": [
        {"status": "completed", "count": 525, "percentage": 50.0},
        {"status": "merged", "count": 262, "percentage": 25.0},
        {"status": "failed", "count": 179, "percentage": 17.0},
        {"status": "timed_out", "count": 84, "percentage": 8.0},
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
# Benchmark: <10 min 20%, 10–30 min 40%, 30–60 min 25%, 60+ min 15%
# ---------------------------------------------------------------------------

DURATION_DISTRIBUTION: Final[list[dict]] = [
    {"bucket": "< 10 min", "count": 210},
    {"bucket": "10\u201330 min", "count": 420},
    {"bucket": "30\u201360 min", "count": 263},
    {"bucket": "60+ min", "count": 157},
]

# ---------------------------------------------------------------------------
# Adoption rate
# ---------------------------------------------------------------------------

ADOPTION_RATE: Final[dict] = {
    "rate_7d": 73.0,
    "rate_30d": 100.0,
    "total_members": 15,
    "active_7d": 11,
    "active_30d": 15,
    "delta_7d_pct": 10.0,
}
