# OpenClaw integration (in this repo)

OpenClaw lives in this monorepo:

| Path | Purpose |
|------|---------|
| `openclaw/` | OpenClaw source ([git submodule](https://github.com/openclaw/openclaw)) |
| `integrations/openclaw/` | MOR config, agent workspaces, skill, runtime state |
| `docs/agents/prompts/` | Agent prompt source of truth |

## Quick start

```bash
# 1. Generate workspaces + config (once, or after prompt changes)
npm run openclaw:setup

# 2. Start MOR dashboard + API
npm run dev

# 3. Start OpenClaw gateway (uses integrations/openclaw/openclaw.json)
npm run openclaw:gateway

# Or both together:
npm run dev:full
```

- **MOR dashboard:** http://localhost:5173/openclaw-agents  
- **OpenClaw Control UI:** http://127.0.0.1:18789/

## First-time OpenClaw CLI

The gateway script uses the global `openclaw` CLI. Install if needed:

```bash
npm install -g openclaw@latest
openclaw doctor --generate-gateway-token
# Paste token into integrations/openclaw/openclaw.json → gateway.auth.token
```

Optional: install deps in the submodule for local development:

```bash
cd openclaw && npm install
```

## Developer Academy AI Mentor

MOR exposes Hermes + Claude mentors for Academy over the dashboard API:

- Contract: [docs/agents/AI-MENTOR-ACADEMY.md](../../docs/agents/AI-MENTOR-ACADEMY.md)
- `GET /api/agents/mentors` — discovery (OpenClaw + Hermes)
- `POST /api/agents/mentors/ask` — mentor chat
- Optional auth: `MOR_MENTOR_API_KEY`

## Sub-agents

See [SUBAGENTS.md](./SUBAGENTS.md) for spawn patterns, env vars, and tool policy.

Copy `subagents.env.example` → `subagents.env` (or run `npm run openclaw:setup`).

| Variable | Default |
|----------|---------|
| `OPENCLAW_CONFIG_PATH` | `integrations/openclaw/openclaw.json` (auto) |
| `OPENCLAW_STATE_DIR` | `integrations/openclaw/state/` |
| `OPENCLAW_GATEWAY_URL` | `http://127.0.0.1:18789` |

## Update submodule

```bash
git submodule update --remote openclaw
```
