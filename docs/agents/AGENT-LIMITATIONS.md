# MOR Finance — Agent Limitations Policy

Canonical policy for the MOR intelligence layer. Agents function as **advisors**; the **Risk Engine** and **Execution Engine** retain final authority.

## Execution hierarchy

1. **Agents** — analyze, monitor, recommend, optimize
2. **Risk Engine** — approve or reject recommendations
3. **Execution Engine** — execute approved actions only

## Limitations by category

### General

| Rule | Enforcement |
|------|-------------|
| No autonomous trade execution | Prompt + OpenClaw tool denies; no signing keys in agent env |
| No direct treasury access | API read-only context; no wallet tools |
| No capital allocation without Risk Engine approval | Recommendations only (SCALE, tier changes) |
| No protocol configuration changes | Prompt; human governance workflow |
| No unauthorized contract/infra deployment | Prompt; no deploy tools on specialist agents |

### Trading & risk

- Recommend **routes** and **trade sizing** only.
- Borrow/lending paths require **DD/Risk Agent** + **Risk Engine** validation.
- Never bypass risk limits, kill switches, or daily loss limits.
- Pause aggressive recommendations when market or data confidence is low.

### Data quality

- Detect stale/missing data (`GET /api/agents/context` → `dataQuality`).
- Every recommendation includes a **confidence score** (0–100).
- Escalate conflicting signals; do not merge contradictory views without review.

### AI mentors

| Mentor | Allowed | Not allowed |
|--------|---------|-------------|
| **Claude** | Education, docs, learning guidance | Production code changes, deployments, financial execution |
| **Hermes** | Code review, optimizations, failure analysis, templates | Auto-modify production code, deployments |

### Security

- No private keys or wallet secrets.
- No independent transaction signing.
- Owner-only financial data gated in the admin dashboard (`admin` role).

### Admin dashboard RBAC

| Role | Visibility |
|------|------------|
| **user** (engineering) | Ops metrics, health, agents, infrastructure, system KPIs |
| **admin** (owner) | Treasury, realized PnL, revenue, arbitrage monitor, fee integration, financial reports |

## Implementation map

| Layer | Location |
|-------|----------|
| Agent prompts | `docs/agents/prompts/agent-limitations.md`, `shared-system-context.md` |
| OpenClaw workspaces | `integrations/openclaw/workspaces/*/AGENTS.md` (via `npm run openclaw:setup`) |
| API metadata | `GET /api/agents/context` → `limitations`, `dataQuality` |
| Registry | `server/data/agentLimitations.ts`, `docs/agents/manifest.json` |
| Dashboard RBAC | `src/layout/VerticalNavigationBar/navConfig.ts`, `AdminRoute` on financial pages |

## Related docs

- [Agent framework README](./README.md)
- [Shared system context](./prompts/shared-system-context.md)
- [OpenClaw integration](./openclaw-integration.md)
