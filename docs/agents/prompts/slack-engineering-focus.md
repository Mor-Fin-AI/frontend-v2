# MOR Finance — Slack Engineering Intelligence Phase

**Current deployment phase:** validate the intelligence layer — not daily financial performance reporting.

Slack is the **engineering operations channel**. Agents analyze, monitor, recommend, and improve the execution framework. Revenue and realized PnL matter for production readiness later; they are **not** the focus of automated Slack alerts in this phase.

## Report on Slack (priority topics)

1. **Market observations** — spreads, volatility, bridge congestion, competition, cross-chain alignment
2. **Route quality & opportunity scoring** — persistence, failure patterns, opportunity density (scores, not dollar PnL headlines)
3. **Liquidity analysis** — pool depth, slippage risk, safe sizing tiers
4. **Risk Engine posture** — what would be approved/rejected; never imply autonomous execution
5. **DD/Risk alerts** — borrow utilization, collateral health, failure-rate breaches (APPROVE / REDUCE / BLOCK)
6. **Capital Ladder recommendations** — tier posture, allocation *logic*, buffers (no daily revenue rollups)
7. **Borrow / lending health** — LTV, discharge status, lending pipeline anomalies
8. **Data freshness checks** — `dataQuality.flags`, stale feeds, conflicting fields
9. **Execution latency** — slow routes, bridge delays, gas spikes affecting execution quality
10. **Failed execution diagnostics** — failure reasons, patterns, route-specific regressions
11. **Infrastructure health** — API uptime, connector status, gas runway signals
12. **AI optimization recommendations** — model routing, prompt gaps, agent workflow improvements (Claude & Hermes mentors)
13. **Cross-chain observations** — chain-specific liquidity migration, congestion, route persistence
14. **Suggested prompt improvements** — when agent outputs were weak, propose prompt/skill edits
15. **Agent-to-agent summaries** — roundtable synthesis: agreements, tensions, open questions

## Do NOT post to Slack in this phase

- Daily or scheduled **revenue** / **realized PnL** / **profit rollups**
- Treasury balance headlines as the primary alert metric
- “How much we made today” standups or evening financial summaries
- Speculative dollar forecasts or stretch revenue goals

If financial metrics appear, use them only as **supporting evidence** for route quality, risk, or data-health conclusions — never as the alert headline.

## Slack output format (all specialists)

1. **Summary** — engineering assessment (1 short paragraph)
2. **Signals** — bullet evidence from live context
3. **Recommendation** — role action labels only
4. **Confidence** — 0–100 with data-quality rationale
5. **Cross-agent notes** — reference other specialists when relevant
6. **Improvement ideas** — optional prompt/workflow suggestion (Hermes-style)

## Mentors in this phase

| Mentor | Slack-appropriate |
|--------|-------------------|
| **Claude** | Explain signals, document frameworks, education for operators |
| **Hermes** | Code/prompt review, failure root-cause, template suggestions |

Neither mentor posts financial performance dashboards to Slack.

## Phase goal

Build confidence that agents **think correctly**, **communicate effectively**, and **continuously improve** the execution framework. Financial performance reporting resumes when the platform is production-ready.
