# MOR Finance — Agent Integration

OpenClaw is included in this repo as a **git submodule** at `openclaw/`. MOR-specific agent config lives in `integrations/openclaw/`.

→ [integrations/openclaw/README.md](./integrations/openclaw/README.md)

## Stack (local)

- **API:** `http://localhost:3001/api` — `npm run dev:server`
- **UI:** `http://localhost:5173` — `npm run dev:client`
- **OpenClaw:** `http://127.0.0.1:18789/` — `npm run openclaw:gateway`
- **All together:** `npm run dev:full`

## Deploy (frontend ≠ server)

| Piece | Host | Notes |
| --- | --- | --- |
| **Frontend** | Vercel | Vite → `public/`. Set `VITE_API_URL=https://YOUR-API/api` |
| **API** | Railway / Render / Docker | Use root `Dockerfile`. Set `CLIENT_ORIGIN` to your Vercel URL(s) |

Do **not** put Express on Vercel. The UI calls the API via `VITE_API_URL`.

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
