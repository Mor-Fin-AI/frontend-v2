# MOR Finance Agent Framework

Intelligence-layer prompts for the multi-agent arbitrage ecosystem. Agents **recommend only** — they never execute trades.

## Execution hierarchy

1. **Agents** — analyze, score, recommend
2. **Risk Engine** — approve or reject recommendations
3. **Execution Engine** — execute approved actions

## Agents

| Agent | Prompt file | Primary outputs |
|-------|-------------|-----------------|
| PnL Intelligence | [prompts/pnl-intelligence.md](./prompts/pnl-intelligence.md) | PRIORITIZE, MAINTAIN, DEPRIORITIZE, RETIRE |
| Liquidity Intelligence | [prompts/liquidity-intelligence.md](./prompts/liquidity-intelligence.md) | SAFE SIZE, REDUCE SIZE, AVOID ROUTE |
| DD / Risk | [prompts/dd-risk.md](./prompts/dd-risk.md) | APPROVE, REDUCE, BLOCK |
| Market Mode | [prompts/market-mode-intelligence.md](./prompts/market-mode-intelligence.md) | BASELINE, BURST, 5×, 10× deployment tier |
| Capital Ladder | [prompts/capital-ladder.md](./prompts/capital-ladder.md) | MAINTAIN, SCALE, PAUSE, UPGRADE/DOWNGRADE tier |
| Governance | [prompts/governance-intelligence.md](./prompts/governance-intelligence.md) | MONITOR, PREPARE, URGENT, PAUSE OPS |
| Ops / Health | [prompts/ops-health.md](./prompts/ops-health.md) | HEALTHY, DEGRADED, DOWN, ACTION REQUIRED |
| Hermes (mentor) | [prompts/hermes-mentor.md](./prompts/hermes-mentor.md) | REVIEW, OPTIMIZE, EXPLAIN_FAILURE, TEMPLATE |
| Claude (Academy mentor) | [prompts/claude-mentor.md](./prompts/claude-mentor.md) | TEACH, GUIDE, CHECK, HANDOFF |

## Developer Academy AI Mentor API

Endpoint contract for OpenClaw + Hermes (+ Claude) MVP integration:

→ [AI-MENTOR-ACADEMY.md](./AI-MENTOR-ACADEMY.md)

- `GET /api/agents/mentors` — discovery + auth scheme + OpenClaw status  
- `POST /api/agents/mentors/ask` — mentor chat turn  

## Shared context

All agents load [prompts/shared-system-context.md](./prompts/shared-system-context.md) as base instructions.

## Agent limitations

Mandatory policy: [AGENT-LIMITATIONS.md](./AGENT-LIMITATIONS.md) (prompt source: [prompts/agent-limitations.md](./prompts/agent-limitations.md))

Agents analyze, monitor, recommend, and optimize — they do **not** take autonomous financial actions.

## Slack engineering phase

During deployment, Slack reports engineering intelligence (routes, risk, liquidity, data health) — not daily revenue/PnL. See [prompts/slack-engineering-focus.md](./prompts/slack-engineering-focus.md).

## Production baseline

- **Chains:** Arbitrum, Base, Optimism, Ethereum
- **Target routes:** 5–6 diversified routes
- **Current:** ~12–13 realized opportunities/day, &lt;20% failure rate, ~0.24% avg realized opportunity
- **Goal (8–12 weeks):** 25–30+ realized opportunities/day while preserving quality

## Deployment tiers (Market Mode)

| Mode | Tier multiplier | Typical conditions |
|------|-----------------|------------------|
| Baseline | 1.5× | Stable volatility, normal liquidity, 12–20 trades/day |
| Burst | 2.5× | High opportunity density, deep liquidity, low competition |
| Enhanced Scaling | 5× | PnL/Liquidity/DD scores &gt;90, route persistence, cross-chain alignment |
| Exceptional | 10× | All scores &gt;95, deep liquidity, cluster, Capital Ladder + Risk Engine approval |

## OpenClaw (in this repo)

- Source: `openclaw/` (git submodule)
- MOR config: `integrations/openclaw/`
- Setup: `npm run openclaw:setup`

→ [openclaw-integration.md](./openclaw-integration.md)
