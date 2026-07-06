# MOR Agents — Slack interaction guide

Use this with [manifest.json](./manifest.json) to wire OpenClaw → Slack.

## Engineering intelligence phase (current)

Slack focuses on **engineering intelligence** — route quality, risk, liquidity, data health, execution diagnostics, and agent collaboration — **not** daily revenue or PnL rollups.

→ Full policy: [prompts/slack-engineering-focus.md](./prompts/slack-engineering-focus.md)

## Architecture

```
You (Slack DM / @mention)
        ↓
   main (🐾 Orchestrator)
        ↓ sessions_spawn (parallel)
   ┌────┴────┬──────────┬─────────────┬────────────────┐
 mor-pnl  mor-liquidity mor-dd-risk mor-market-mode mor-capital-ladder
        ↓ announce back to Slack
   Unified alert / summary
```

- **Talk to `main`** in Slack for on-demand analysis.
- **Sub-agents** run in background and **announce** results to your Slack thread.
- **Cron jobs** (optional) push scheduled alerts from each agent.

## 1. Enable Slack in OpenClaw

```bash
export SLACK_BOT_TOKEN=xoxb-...
export SLACK_APP_TOKEN=xapp-...

# Patch config (from repo root, with OPENCLAW_CONFIG_PATH set)
export OPENCLAW_CONFIG_PATH=integrations/openclaw/openclaw.json
export OPENCLAW_STATE_DIR=integrations/openclaw/state

openclaw channels add --channel slack --use-env
openclaw gateway restart
```

Or merge `integrations/openclaw/slack.patch.json5` into your `openclaw.json`.

## 2. Route Slack → main orchestrator

Default binding (already in template):

```json
"bindings": [{ "agentId": "main", "match": { "channel": "slack" } }]
```

DM the bot or @mention it in a channel.

## 3. Sample Slack messages

| Goal | Message to bot |
|------|----------------|
| Engineering review | `Run engineering roundtable — route quality, risk, data freshness, top 3 engineering actions (no revenue rollup)` |
| Route quality | `Spawn mor-pnl — opportunity scoring and PRIORITIZE/RETIRE from live context` |
| DD/Risk | `Spawn mor-dd-risk — borrow/lending health, APPROVE/REDUCE/BLOCK` |
| Market | `Spawn mor-market-mode — market observations and deployment tier` |
| Ops | `Spawn mor-ops — data freshness, latency, failure diagnostics` |
| Hermes | `Spawn mor-hermes — code review, prompt improvements, failure analysis` |

## 4. Scheduled Slack alerts (cron)

Each agent runs on its own schedule and posts to Slack with its own identity.

| Job | Agent | Schedule |
|-----|-------|----------|
| MOR Engineering Roundtable | main | Every 6h |
| MOR Engineering Standup | main | Weekdays 08:00 |
| MOR Engineering Digest | main | Weekdays 18:00 |
| MOR Route Quality Scan | mor-pnl | Every 4h |
| MOR DD/Risk Alert | mor-dd-risk | Every 2h at :30 |
| MOR Risk Watch (30m) | mor-dd-risk | Every 30m |
| MOR Market Observations | mor-market-mode | Hourly |
| MOR Liquidity Analysis | mor-liquidity | Every 4h at :15 |
| MOR Capital Ladder Engineering | mor-capital-ladder | Every 6h at :45 |
| MOR Ops & Data Freshness | mor-ops | Every 2h |
| MOR Governance Watch | mor-governance | Weekdays 9am & 3pm |
| MOR Hermes Engineering Review | mor-hermes | Fridays 10am |
| MOR GitHub Audit Sweep | main → `mor-audit` workflow | Weekdays 10am and 4pm |
| MOR GitHub Suggestion Sweep | main → `mor-suggestion` workflow | Weekdays 10:30am and 4:30pm |
| MOR GitHub Agents Collaboration | main → `mor-agents` workflow | Weekdays 11am and 5pm |

**Orchestrator jobs** (`main`) spawn all specialists in parallel and synthesize one brief.

**Specialist jobs** use `deliver-slack-agent.mjs` so each posts with its own Slack name + avatar in your active thread.

Set your Slack user or channel ID:

```bash
export SLACK_ALERT_USER_ID=U0265N69A2W    # DM alerts
# or
export SLACK_ALERT_CHANNEL_ID=C0123456789  # #channel alerts

# Gateway must be running
npm run openclaw:gateway

# Install all cron jobs (skip existing)
npm run openclaw:cron:install

# Reinstall (replace existing jobs)
npm run openclaw:cron:install -- --force
```

Optional timezone: `export MOR_CRON_TZ=America/New_York`

**How agents interact on Slack**

| Job type | Behavior |
|----------|----------|
| **Orchestrator** (`main`) | Isolated agent turn spawns all 5 specialists in parallel, synthesizes one DM brief |
| **Specialist** (`mor-*`) | Runs `deliver-slack-agent.mjs` — posts with that agent's Slack name + avatar |
| **GitHub workflow** (`main` → `mor-audit` / `mor-suggestion` / `mor-agents`) | Runs `deliver-slack-github-workflow.mjs` — posts to the dedicated GitHub Slack channels via the workflow's assigned subagent sequence/collab |

Specialist cron jobs do not go through Commander; each posts independently on its schedule. Commander jobs coordinate all specialists and post a single synthesized brief.

List jobs: `openclaw cron list`  
Recent runs: `openclaw cron runs --limit 20`  
Manual run: `openclaw cron run <job-id> --wait`

If `openclaw cron` fails with **scope upgrade pending approval**, run `npm run openclaw:cron:install` (uses gateway token for install), or approve via `openclaw devices list` → `openclaw devices approve <requestId>`.

## 5. Agent manifest (machine-readable)

- File: `docs/agents/manifest.json`
- API: `GET http://localhost:3001/api/agents/manifest`

## Rules

- Agents **recommend only** — never execute trades.
- Risk Engine approves; Execution Engine executes.
- `mor-dd-risk` **BLOCK** → treat as highest-priority Slack alert.

## How to reach specialists in Slack

Sub-agents are **not separate Slack apps**. You will only see **one** app: **MOR Finance Intelligence** (sidebar → Apps).

| Goal | What to do |
|------|------------|
| Talk to Commander | DM the bot or `/mor <message>` |
| Full MOR review | `/mor_review` or `/mor_roundtable` — all specialists follow up on Slack |
| Executive brief | `/mor_brief` — top metrics without full spawn |
| Ops / health | `/mor_health` |
| Governance | `/mor_governance` |
| Talk to PnL Intel | `/mor_pnl <question>` in DM or any channel |
| Talk to Risk Guard | `/mor_risk <question>` |
| Talk to Market Mode | `/mor_mode <question>` |
| Talk to Liquidity | `/mor_liquidity <question>` |
| Talk to Capital | `/mor_capital <question>` |
| MOR Finance snapshot | `/mor_finance` (underscore — **not** `/mor-finance`) |

Slash commands post in the **same channel or DM** where you run them. Specialists reply with their own name + avatar; peers follow up in the same thread.

**Valid commands use underscores:** `/mor_pnl`, `/mor_finance`, `/mor_roundtable` — hyphens like `/mor-pnl` or `/mor-finance` will not work.

### Channel vs DM

- In a **channel**: invite the bot (`/invite @MOR Intelligence`), then run `/mor_pnl` or `/mor_roundtable`. All specialists post in that channel (first message anchors a thread for follow-ups).
- In a **DM**: same slash commands; delivery uses your Assistant thread when available.

Slash commands are dispatched instantly via the `mor_slash` plugin (no LLM timeout). You should see `✅ … is posting in this channel` within a few seconds; full specialist analysis takes 30–90s.

### Why specialist replies only show in History (not Chats & threads)

Slack **Assistant** chats live in threaded conversations. If delivery posts to the DM root (no `thread_ts`), replies appear under the bot's **Messages** / **History** tab, not in your active **Chats & threads** panel.

The deliver script now auto-detects your latest Assistant `thread_ts`. Main should pass `--thread-ts` from the inbound Slack session when invoking deliver.

After updating `docs/agents/slack-app-manifest.json`, **reinstall the Slack app** so slash commands sync. Restart gateway: `npm run openclaw:gateway`.

If Slack rejects the manifest with **PKCE cannot be disabled when enabled**, your app already has PKCE on — the manifest includes `"pkce_enabled": true` under `oauth_config` to match. Do not remove that field.

### "You are not authorized to use this command"

Slash commands (`/mor_pnl`, etc.) require `channels.slack.allowFrom` — not just `commands.ownerAllowFrom`. The repo config uses:

```json
"channels": { "slack": { "dmPolicy": "open", "allowFrom": ["*", "U0265N69A2W"] } },
"commands": { "allowFrom": { "slack": ["*", "U0265N69A2W"] } }
```

After changing `integrations/openclaw/openclaw.json`, restart the gateway: `npm run openclaw:gateway`

### Slash command failed: "the app did not respond"

OpenClaw registers skill slash commands with **underscores** (`/mor_pnl`, `/mor_finance`), not hyphens (`/mor-pnl`, `/mor-finance`). The Slack app manifest must match. If you see a timeout:

1. Reinstall the app from `docs/agents/slack-app-manifest.json` (includes `/mor_finance`)
2. Run `npm run openclaw:setup` then restart gateway: `npm run openclaw:gateway`
3. Confirm the `mor-slack` plugin loaded: `openclaw plugins list` (should show `mor_slash` tool)
4. Use `/mor_pnl` (underscore), not `/mor-pnl`
5. Fallback: `npm run openclaw:slash -- mor-pnl "check routes" --channel C…` or `--to U…`

Each agent has its own configured **name + avatar** in `openclaw.json`. They only appear in Slack when that agent **delivers directly** (not when main relays text).

| Agent | Slack name | How to DM with this identity |
|-------|------------|------------------------------|
| main | MOR Commander | Talk to the bot normally |
| mor-pnl | MOR PnL Intel | `npm run openclaw:deliver -- mor-pnl "…" --to U…` |
| mor-liquidity | MOR Liquidity | `npm run openclaw:deliver -- mor-liquidity "…"` |
| mor-dd-risk | MOR Risk Guard | `npm run openclaw:deliver -- mor-dd-risk "…"` |
| mor-market-mode | MOR Market Mode | `npm run openclaw:deliver -- mor-market-mode "…"` |
| mor-capital-ladder | MOR Capital | `npm run openclaw:deliver -- mor-capital-ladder "…"` |

**Why "tell MOR PnL Intel to msg me" shows MOR Intelligence:** main spawned the specialist for analysis, then relayed the reply via its own Slack bot. That is expected — use `openclaw:deliver` or ask main to run it via bash.

**Test all six identities:** `npm run openclaw:test-identities`

Requires `chat:write.customize` on the Slack app (in `docs/agents/slack-app-manifest.json`) and a reinstall. Restart gateway after scope changes.

## Prerequisites

```bash
npm run dev              # MOR API on :3001
npm run openclaw:gateway # OpenClaw on :18789
```
