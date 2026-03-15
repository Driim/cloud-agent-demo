# AgentCloud Dashboard: Benchmark Reference for Mock Data Generation

> March 2026 · Confidential

---

## Table of Contents

1. [Overview Page](#section-1-overview-page)
2. [Usage & Costs Page](#section-2-usage--costs-page)
3. [Agent Sessions Page](#section-3-agent-sessions-page)
4. [Team Activity Page](#section-4-team-activity-page)
5. [Summary Table of Mock Values](#section-5-summary-table-of-recommended-mock-values)
6. [Sources](#sources)

---

## SECTION 1: Overview Page

The overview page provides key KPIs: total session count, token consumption, costs, PRs, and session outcomes.

### 1.1 Total Agent Sessions

Benchmark is based on typical developer behavior with Claude Code: 2–3 sessions per day, 5-hour windows, 10–40 prompts per window.

| Metric | Benchmark | Mock Range |
|---|---|---|
| Sessions / developer / day | 2–3 | 2–4 |
| Sessions / team (15 people) / day | 25–45 | 30–40 |
| Sessions / month | 600–1,000 | 800–1,200 |
| MoM growth | 15–25% | 18–22% |
| Maturity curve | 3–6 months | Show S-curve |

**Distribution:** normal with mean of 2.5 sessions/day/developer. MoM trend with decay after 3–6 months.

> Sources: [Anthropic Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) · [What 100M Tokens Taught Us — LinkedIn](https://www.linkedin.com/pulse/from-token-burn-context-clarity-what-100m-tokens-taught-adam-alyan-kq7re) · [Jellyfish ROI Guide](https://jellyfish.co/library/ai-in-software-development/measuring-roi-of-code-assistants/)

---

### 1.2 Token Consumption (Input + Output, daily stacked chart)

Token consumption varies significantly by task type. Output/Input ratio: 1:3 — 1:5.

| Session Type | Share | Tokens/session | Mock Range | Distribution |
|---|---|---|---|---|
| Quick tasks | 40% | 50K–200K | 80K–180K | Log-normal |
| Typical | 46% | ~1.1M | 0.8M–1.5M | Log-normal |
| Extended | 14% | 2–3M | 2–3M | Right tail |
| Marathon (rare) | ~5% | up to 29.5M | 10–25M | Outliers |

**Aggregate metrics:**

| Metric | Benchmark | Mock Range |
|---|---|---|
| Daily consumption (15 devs) | 15–40M tokens | 20–35M tokens |
| Monthly consumption | 300M–800M tokens | 400M–700M tokens |
| Output/Input ratio | 1:3 — 1:5 | 1:4 (average) |
| Session median | 592K tokens | 500K–650K tokens |
| Academic best practice / task | ~100K tokens | 80K–120K tokens |

**Distribution:** log-normal with heavy right tail. Daily totals: weekends ~5x lower than weekdays.

> Sources: [Simon P. Couch — Claude Code Energy](https://www.simonpcouch.com/blog/2026-01-20-cc-impact/) · [What 100M Tokens Taught Us](https://www.linkedin.com/pulse/from-token-burn-context-clarity-what-100m-tokens-taught-adam-alyan-kq7re) · [SWE-bench](https://www.swebench.com/)

---

### 1.3 Total Spend

| Metric | Benchmark | Mock Range |
|---|---|---|
| Average cost / dev / day | $6 (average); 90% < $12 | $5–$10 |
| Monthly cost / dev | $100–$200 (Sonnet 4.6) | $120–$180 |
| Power users (max) | up to $5,623/month | $800–$2,000 |
| Team (15 devs) / month | $1,500–$3,000 | $2,000–$3,000 |
| Team (heavy) / month | up to $5,000 | $3,500–$5,000 |

**Cost breakdown by category:**

| Category | Cost Share | Mock Value | Note |
|---|---|---|---|
| Input tokens | ~20% | 18% | |
| Output tokens | ~50% | 52% | 3–5x more expensive than input |
| Compute / sandbox | ~20% | 20% | |
| Storage | ~10% | 10% | |

**Distribution:** right-skewed (log-normal). Spikes on release days.

> Sources: [Anthropic Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) · [IntuitionLabs — Claude Pricing](https://intuitionlabs.ai/articles/claude-pricing-plans-api-costs) · [ksred.com — Claude Code Pricing](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)

---

### 1.4 PRs Created (with success metrics)

| Metric | Benchmark | Mock Range |
|---|---|---|
| Median PR size (lines) | 76 lines (+33% in 2025) | 60–90 lines |
| AI-assisted code in commits | 42% | 35–50% |
| Successful builds (Copilot) | +84% increase | — |
| PR merge rate (AI-generated) | ~78% | 70–80% |
| Agent-only PR failure rate | 22% code-level | 18–25% |
| PRs / dev / week (agent) | 3–5 | 3–5 |
| Success rate (completed+merged) | 65–75% | 68–73% |

**Distribution:** Poisson-like for PR count, binomial for success rate. PR size: log-normal.

> Sources: [Greptile — State of AI Coding 2025](https://www.greptile.com/state-of-ai-coding-2025) · [GitHub/Accenture Copilot Research](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/) · [Alpha Edge Daily — AI Agent Failures](https://alpha-edge-daily.ghost.io/why-ai-agents-fail-70-of-the-time-the-real-research-on-autonomous-agent-success-rates/)

---

### 1.5 Session Outcomes (donut chart)

| Status | Benchmark | Mock Value | Color | Note |
|---|---|---|---|---|
| Completed | 45–55% | 50% | `#20808D` | Successfully completed |
| Merged | 25–35% | 25% | `#437A22` | Subset of Completed |
| Failed | 15–22% | 17% | `#A13544` | Code errors |
| Timed Out | 5–10% | 8% | `#964219` | Limit exceeded |

Alternative perspective: APEX benchmark shows 24% Pass@1, up to 40% with retries.

> Sources: [Alpha Edge Daily — CMU/APEX](https://alpha-edge-daily.ghost.io/why-ai-agents-fail-70-of-the-time-the-real-research-on-autonomous-agent-success-rates/) · [SWE-bench Pro](https://www.swebench.com/)

---

### 1.6 Top Repositories (horizontal bar chart)

Distribution follows Pareto: top 3 repositories account for ~60% of sessions.

| Repository | Sessions % | Sessions/month | Primary Language | Task Types |
|---|---|---|---|---|
| api-gateway | 22% | 220 | Go / TypeScript | Bug fixes, endpoints |
| web-dashboard | 18% | 180 | React / TypeScript | UI features |
| auth-service | 14% | 140 | Python | Security, OAuth |
| data-pipeline | 10% | 100 | Python / Spark | ETL, transforms |
| mobile-app | 9% | 90 | Swift / Kotlin | UI, API integration |
| ml-platform | 8% | 80 | Python | Models, inference |
| infra-config | 7% | 70 | Terraform / YAML | IaC, deploys |
| docs-site | 5% | 50 | MDX / Next.js | Documentation |
| shared-libs | 4% | 40 | TypeScript | Utilities |
| legacy-monolith | 3% | 30 | Java | Migration |

**Distribution:** power law / Pareto. Use Zipf-like distribution for generation.

---

## SECTION 2: Usage & Costs Page

This page details expenses, trends, and usage quotas.

### 2.1 Daily Spend Trend

| Metric | Benchmark | Mock Range |
|---|---|---|
| Weekdays (average) | $150–$250/day | $180–$220/day |
| Weekends | ~$30–$50 | $30–$50 |
| Weekday/weekend ratio | 5:1 | 5:1 |
| Spike days (releases, incidents) | 2–3x average | $400–$600 |
| Monthly trend | Gradual increase | +10–15% MoM |

**Distribution:** cyclical pattern (Mon–Fri high, Sat–Sun low). Normal for weekdays with random spike additions.

> Source: derived from Anthropic $6/dev/day × 15 devs, [Anthropic Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

---

### 2.2 Cost Breakdown (pie chart)

| Category | Cost Share | Mock % | Pie Color | Rationale |
|---|---|---|---|---|
| Input tokens | 15–20% | 18% | `#20808D` | $3/MTok (Sonnet 4.6) |
| Output tokens | 45–55% | 52% | `#A84B2F` | $15/MTok (5x input) |
| Compute (sandbox) | 20–25% | 22% | `#1B474D` | Cloud VMs |
| Storage | 5–10% | 8% | `#BCE2E7` | Files, cache |

Proportions are stable; output tokens dominate due to the 5x price multiplier.

> Source: [Anthropic Sonnet 4.6 Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

---

### 2.3 Cost per Session

| Metric | Benchmark | Mock Range |
|---|---|---|
| Average cost | $2–$8 | $3–$7 |
| Median | $3–$4 | $3.50 |
| Light sessions | $0.50–$2 | $0.80–$1.50 |
| Heavy sessions | $8–$20 | $8–$15 |
| Marathon debugging | up to $16+ | $12–$18 |
| Trend | Improving over time | -3–5% MoM |

**Distribution:** log-normal. Median ~$3.50, mean ~$5 (right tail from heavy sessions).

> Source: [LinkedIn — $16.29 worst session](https://www.linkedin.com/pulse/from-token-burn-context-clarity-what-100m-tokens-taught-adam-alyan-kq7re)

---

### 2.4 Usage Quotas (progress bars)

| Quota | Limit | Used | Usage % | Bar Color |
|---|---|---|---|---|
| Sessions / month | 1,500 | 1,050 | 70% | `#20808D` |
| Token budget | 1B tokens | 550M | 55% | `#20808D` |
| Concurrent sessions | 10 | 4 (peak 6) | 40% (peak 60%) | `#FFC553` |
| API calls / month | 50,000 | 32,500 | 65% | `#20808D` |

Quotas are modeled after Anthropic Team/Enterprise plan structure. Show mid-cycle: 55–70% usage.

---

## SECTION 3: Agent Sessions Page

Detailed information about each session: duration, tokens, cost, latency.

### 3.1 Session Table (typical values)

| Parameter | Benchmark | Mock Range | Median | Distribution |
|---|---|---|---|---|
| Duration | 5–90 min | 5–75 min | 25 min | Log-normal |
| Tokens / session | 50K–5M | 50K–4M | 500–600K | Log-normal |
| Cost / session | $0.50–$20 | $0.50–$15 | $3.50 | Log-normal |

**Status distribution in table:**

| Status | Mock % | Example Tasks | Note |
|---|---|---|---|
| Active | 5% | `Implement feature...` | Current sessions |
| Completed | 55% | `Fix bug in auth-service...` | Successfully completed |
| Merged | 25% | `Refactor API handler...` | Code in main |
| Failed | 12% | `Add tests for payment...` | Code errors |
| Timed Out | 3% | `Update API endpoint...` | Exceeded 250-step limit |

---

### 3.2 Duration Distribution (histogram)

| Range | Share | Mock % | Session Count | Note |
|---|---|---|---|---|
| < 10 min (Short) | 20% | 20% | ~200/month | Quick fixes |
| 10–30 min (Medium) | 40% | 40% | ~400/month | Main peak |
| 30–60 min (Long) | 25% | 25% | ~250/month | Features |
| 60+ min (Very long) | 15% | 15% | ~150/month | Complex tasks |

**Distribution:** log-normal (right-skewed). Peak at 15–25 minutes.

---

### 3.3 P95 Latency Trend (execution plan latency)

Latency to start agent execution (planning + tool selection), not LLM inference.

| Percentile | Benchmark | Mock Value | Note |
|---|---|---|---|
| P50 | 2–5 sec | 3 sec | Warm start |
| P95 | 8–15 sec | 10 sec | Agent execution planning |
| P99 | 20–40 sec | 25 sec | Complex plan + cold start |

**LLM API TTFT Benchmarks (for reference):**

| Model | P25 | P50 | P75 | Note |
|---|---|---|---|---|
| Sonnet 4.5 | 1.8s | 2.0s | 2.2s | Fast and stable |
| Opus 4.5 | 1.9s | 2.2s | 3.0s | Higher variance |
| GPT-5-Codex | 3.7s | 5.0s | 6.6s | High latency |

**Trend:** gradual improvement with occasional spikes during deployments and high load.

> Source: [Greptile — State of AI Coding 2025 (TTFT)](https://www.greptile.com/state-of-ai-coding-2025)

---

## SECTION 4: Team Activity Page

Team activity metrics: sessions per member, leaderboard, event feed.

### 4.1 Sessions per Member (bar chart)

| Metric | Benchmark | Mock Range |
|---|---|---|
| Sessions / dev / day | 1–6 | 1–5 |
| Average | 2.5 sessions | 2.5 sessions |
| Top performers | 4–6 sessions/day | 4–5 sessions |
| Light users | 1–2 sessions/day | 1–2 sessions |
| AI daily usage (professional devs) | 51% (daily) | >= 50% |
| DAU target (healthy) | > 30% of licenses | 35–45% |

**Distribution:** normal, mean=2.5, sigma=1.0. DAU < 30% — red flag.

> Sources: [Stack Overflow 2025 Survey](https://survey.stackoverflow.co/2025/ai) · [Jellyfish ROI Guide](https://jellyfish.co/library/ai-in-software-development/measuring-roi-of-code-assistants/)

---

### 4.2 Team Leaderboard

| Role | Sessions/week | PRs/week | Success % | Characteristic | Mock |
|---|---|---|---|---|---|
| Junior dev | 18–25 | 5–8 | 55–65% | +40% productivity | More sessions |
| Middle dev | 12–18 | 4–6 | 70–78% | Balanced | Average |
| Senior dev | 8–15 | 2–4 | 78–85% | +5% productivity | Fewer but better |
| Tech Lead | 5–10 | 1–3 | 80–88% | Review + architecture | Reviews |

Inverse correlation between session count and success rate. Juniors generate more sessions but with lower success.

> Source: [Jellyfish — Juniors +40%, Seniors +5%](https://jellyfish.co/library/ai-in-software-development/measuring-roi-of-code-assistants/)

---

### 4.3 Activity Feed

| Parameter | Benchmark | Mock Value | Note |
|---|---|---|---|
| Event frequency | 1 / 10–15 min | 1 / 12 min | During work hours |
| Peak hours | 10:00–12:00, 14:00–17:00 | 10–12, 14–17 | CET |
| Event types | 6 types | 6 types | See table below |

**Event types for the feed:**

| Event | Share | Example | Icon |
|---|---|---|---|
| Session Started | 25% | Alexey started a session in api-gateway | ▶ |
| Session Completed | 25% | Maria completed a session — Fix auth bug | ✓ |
| Session Failed | 10% | Dmitry: error in data-pipeline | ✗ |
| PR Created | 20% | PR #142: Refactor payment handler | 📋 |
| PR Merged | 15% | PR #138 merged into main | 🔀 |
| PR Review Requested | 5% | Review for PR #141 from Ivan | 👁 |

---

## SECTION 5: Summary Table of Recommended Mock Values

Key deliverable — a unified reference table for generating realistic data.

| Metric | Benchmark | Mock Value | Distribution | Page |
|---|---|---|---|---|
| Sessions/dev/day | 2–3 | 2–4 (mean 2.5) | Normal, sigma=1.0 | Overview |
| Sessions/month (team) | 600–1,000 | 800–1,200 | MoM +18–22% | Overview |
| Tokens/session (median) | 592K | 500–650K | Log-normal | Overview |
| Tokens/month (team) | 300M–800M | 400M–700M | Log-normal + tail | Overview |
| Output/Input ratio | 1:3 — 1:5 | 1:4 | Stable | Overview |
| Cost/dev/day | $6 (avg) | $5–$10 | Log-normal, 90% < $12 | Overview |
| Cost/team/month | $1,500–$3,000 | $2,000–$3,000 | Normal | Overview |
| PRs/dev/week | 3–5 | 3–5 | Poisson, lambda=4 | Overview |
| PR success rate | 65–75% | 68–73% | Binomial | Overview |
| Completed % | 45–55% | 50% | Fixed | Overview |
| Merged % | 25–35% | 25% | Fixed | Overview |
| Failed % | 15–22% | 17% | Fixed | Overview |
| Timed Out % | 5–10% | 8% | Fixed | Overview |
| Weekday spend/day | $150–$250 | $180–$220 | Normal + spikes | Costs |
| Weekend spend/day | $30–$50 | $30–$50 | 5x lower than weekdays | Costs |
| Input tokens % | 15–20% | 18% | Stable | Costs |
| Output tokens % | 45–55% | 52% | Dominant category | Costs |
| Compute % | 20–25% | 22% | Stable | Costs |
| Storage % | 5–10% | 8% | Stable | Costs |
| Cost/session (median) | $3–$4 | $3.50 | Log-normal | Costs |
| Sessions quota % | — | 70% of 1,500 | Mid-cycle | Costs |
| Token quota % | — | 55% of 1B | Mid-cycle | Costs |
| Duration (median) | 25 min | 25 min | Log-normal, 5–75 min | Sessions |
| Short < 10 min % | 20% | 20% | Fixed | Sessions |
| Medium 10–30 min % | 40% | 40% | Main peak | Sessions |
| Long 30–60 min % | 25% | 25% | — | Sessions |
| Very long 60+ min % | 15% | 15% | Tail | Sessions |
| P50 latency | 2–5 sec | 3 sec | — | Sessions |
| P95 latency | 8–15 sec | 10 sec | Gradual improvement | Sessions |
| P99 latency | 20–40 sec | 25 sec | — | Sessions |
| Sessions/dev/week | 8–25 | 10–20 | Normal, by role | Team |
| Junior success % | 55–65% | 60% | Binomial | Team |
| Senior success % | 78–85% | 82% | Binomial | Team |
| DAU % | > 30% | 38% | — | Team |
| Event frequency | 1/10–15 min | 1/12 min | Poisson process | Team |
| Peak hours | 10–12, 14–17 | 10–12, 14–17 | Bimodal | Team |

---

## Sources

1. **Anthropic Claude Code Docs** — [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)
2. **Anthropic Pricing** — [docs.anthropic.com/en/docs/about-claude/pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
3. **What 100M Tokens Taught Us About AI Coding Assistants** — [LinkedIn / Adam Alyan](https://www.linkedin.com/pulse/from-token-burn-context-clarity-what-100m-tokens-taught-adam-alyan-kq7re)
4. **Electricity use of AI coding agents** — [Simon P. Couch](https://www.simonpcouch.com/blog/2026-01-20-cc-impact/)
5. **The State of AI Coding 2025** — [Greptile](https://www.greptile.com/state-of-ai-coding-2025)
6. **Quantifying GitHub Copilot's Impact with Accenture** — [GitHub Blog](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/)
7. **Why AI Agents Fail 70% of the Time** — [Alpha Edge Daily](https://alpha-edge-daily.ghost.io/why-ai-agents-fail-70-of-the-time-the-real-research-on-autonomous-agent-success-rates/)
8. **Stack Overflow Developer Survey 2025 — AI** — [survey.stackoverflow.co](https://survey.stackoverflow.co/2025/ai)
9. **How to Measure the ROI of AI Code Assistants** — [Jellyfish](https://jellyfish.co/library/ai-in-software-development/measuring-roi-of-code-assistants/)
10. **Claude Code Pricing Guide** — [ksred.com](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)
11. **Claude Pricing Explained** — [IntuitionLabs](https://intuitionlabs.ai/articles/claude-pricing-plans-api-costs)
12. **SWE-bench Leaderboards** — [swebench.com](https://www.swebench.com/)
13. **SWE-Bench Pro Leaderboard** — [Morph](https://www.morphllm.com/swe-bench-pro)
14. **42% of Code Is Now AI-Assisted** — [ShiftMag](https://shiftmag.dev/state-of-code-2025-7978/)
15. **GitHub Copilot Statistics 2026** — [Quantumrun Foresight](https://www.quantumrun.com/consulting/github-copilot-statistics/)
16. **AI coding assistant pricing 2025** — [DX / getdx.com](https://getdx.com/blog/ai-coding-assistant-pricing/)
