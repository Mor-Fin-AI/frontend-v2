# MOR Finance — Sub-agent environment

OpenClaw sub-agents inherit the gateway process environment plus skill injection from `mor-finance`.

## Slack cross-agent collaboration

Specialists **interact on Slack in the same thread** and reference each other by display name.

| Flow | Script | Behavior |
|------|--------|----------|
| Single slash (`/mor_pnl`, etc.) | `mor_slash` plugin → `deliver-slack-agent.mjs` | Posts in **channel or DM** (`--channel` / `--to`). Primary agent posts, then peers follow up (`--followup all`) |
| Full review / roundtable | `deliver-slack-roundtable.mjs` | MOR specialists → Hermes → MOR response → Commander |
| **Hermes ↔ MOR collab** | `deliver-slack-collab.mjs` | Full bidirectional dialogue (recommended) |
| Cron specialist | `deliver-slack-agent.mjs` | Same follow-up chain in your DM thread |

```bash
npm run openclaw:roundtable -- "Full MOR review" --to "$SLACK_ALERT_USER_ID"
npm run openclaw:deliver -- mor-pnl "Route check" --to "$SLACK_ALERT_USER_ID"
```

Each follow-up turn receives the **full transcript** of prior specialist posts and must name peers explicitly.

## Config (`openclaw.json`)

| Setting | Value | Purpose |
|---------|-------|---------|
| `agents.defaults.subagents.requireAgentId` | `true` | Force explicit specialist id on spawn |
| `agents.defaults.subagents.delegationMode` | `prefer` | Main agent delegates analysis to specialists |
| `agents.defaults.subagents.maxConcurrent` | `8` | Parallel specialist runs (in-gateway spawn) |
| `agents.defaults.subagents.runTimeoutSeconds` | `600` | 10 min per sub-agent task |
| `agents.list[main].subagents.allowAgents` | 8 MOR ids + Hermes | Orchestrator may spawn these only |
| `tools.subagents.tools.deny` | gateway, cron, message | Sub-agents use deliver scripts for Slack (not `message` tool) |
| `tools.sessions.visibility` | `all` | Cross-session reads for orchestration |
| `tools.agentToAgent.enabled` | `true` | Allow orchestrator cross-agent tooling |

## Slack identity vs spawn

**Spawned sub-agents** (`sessions_spawn`) return results to **main** first — they do **not** auto-post as separate Slack names/avatars.

**Deliver scripts** post as each specialist's name + avatar and chain follow-ups in-thread.

| Path | Who posts in Slack |
|------|-------------------|
| `sessions_spawn` → main synthesize | MOR Commander only |
| `deliver-slack-agent.mjs` / roundtable | Each specialist + optional Commander |

Requires `chat:write.customize` on your Slack app.

## Environment variables

Set in `subagents.env` (loaded by `npm run openclaw:gateway`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `MOR_API_BASE` | yes | MOR REST API |
| `MOR_REPO` | yes | This repo path (prompts + context) |
| `MOR_DASHBOARD_URL` | no | Dashboard link for agents |
| `SLACK_ALERT_USER_ID` | yes for deliver | DM target for alerts |

## Spawn pattern (in-gateway, no Slack thread)

Use `sessions_spawn` when you need fast parallel analysis without Slack collaboration:

```
agentId: mor-pnl
task: Pull GET /api/agents/context and output PRIORITIZE/RETIRE per route.
```

For **Slack-visible collaboration**, prefer deliver scripts instead.

## Refresh after prompt changes

```bash
npm run openclaw:setup
npm run openclaw:gateway
```
