# MOR Finance — Agent Integration

OpenClaw is included in this repo as a **git submodule** at `openclaw/`. MOR-specific agent config lives in `integrations/openclaw/`.

→ [integrations/openclaw/README.md](./integrations/openclaw/README.md)

## Apps layout

```
apps/web   → Vite + React dashboard (Vercel)
apps/api   → Express API (Railway / Render / Docker)
```

## Stack (local)

- **API:** `http://localhost:3001/api` — `npm run dev:server`
- **UI:** `http://localhost:5173` — `npm run dev:client`
- **OpenClaw:** `http://127.0.0.1:18789/` — `npm run openclaw:gateway`
- **All together:** `npm run dev:full`

## Deploy (frontend ≠ server)

| Piece | Host | Notes |
| --- | --- | --- |
| **Frontend** | Vercel (repo root) | `apps/web` → `public/`. Set `VITE_API_URL` |
| **API** | Vercel project Root Directory `apps/api`, or Railway/Docker | Uses `apps/api/vercel.json` |

See [.env.example](./.env.example).

## Setup (once)

```bash
npm run openclaw:setup
npm install -g openclaw@latest   # if not installed
openclaw doctor --generate-gateway-token
```

## Intelligence prompts

`docs/agents/prompts/` — re-run `npm run openclaw:setup` to sync into agent workspaces.

## Agent snapshot API

- `GET /api/agents/context` — on-chain data for agents
- `GET /api/agents/openclaw` — reads `integrations/openclaw/openclaw.json`
- `GET /api/agents/mentors` — Developer Academy AI Mentor discovery (OpenClaw + Hermes + Claude)
- `POST /api/agents/mentors/ask` — Academy mentor chat turn

→ [docs/agents/AI-MENTOR-ACADEMY.md](./docs/agents/AI-MENTOR-ACADEMY.md)
