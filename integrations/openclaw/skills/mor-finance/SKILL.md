---
name: mor-finance
description: Query the MOR Finance dashboard API and intelligence agent prompts (recommend-only).
user-invocable: false
metadata:
  {"openclaw":{"requires":{"env":["MOR_API_BASE"]},"primaryEnv":"MOR_API_BASE"}}
---

# MOR Finance — `/mor_finance`

Use **`/mor_finance`** in Slack (underscore — not `/mor-finance` or `/mor_finan`). Handled by the `mor-slack` plugin.

**Non-negotiable:** Recommend only — never execute trades, sign transactions, or access treasury keys.

## Agent limitations

All MOR agents are advisors. Read `GET /api/agents/context` for live data plus:

- `limitations` — policy categories (general, trading/risk, security, mentors)
- `slackReporting` — engineering intelligence phase; excluded revenue/PnL rollups from Slack alerts
- `dataQuality` — stale/missing flags; pause aggressive recommendations when `recommendPaused` is true

Full policy: `docs/agents/prompts/agent-limitations.md`  
Slack phase: `docs/agents/prompts/slack-engineering-focus.md`
