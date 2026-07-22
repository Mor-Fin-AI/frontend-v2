# frontend-v2

Mor Finance user dashboard — Vite + React with Fluent UI, treasury flows, arbitrage monitoring, fee integration, and Web3 wallet support.

## Layout

```
apps/web  → frontend (Vite + React)
apps/api  → backend (Express)
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — API + dashboard
- `npm run dev:client` / `npm run dev:server` — each app alone
- `npm run openclaw:setup` — generate OpenClaw agent workspaces + config
- `npm run openclaw:gateway` — OpenClaw Control UI on http://127.0.0.1:18789/
- `npm run dev:full` — MOR + OpenClaw together
- `npm run build:web` — production frontend build → `apps/web/public`
- `npm start` — run API (`apps/api`)
- `npm run lint` — ESLint

## Deploy (separate hosts)

| | Frontend | API |
| --- | --- | --- |
| App | `apps/web` | `apps/api` |
| Host | **Vercel** (repo root) | **Vercel** (Root Directory `apps/api`) or Railway/Docker |
| Config | root `vercel.json` | `apps/api/vercel.json` |
| Env | `VITE_API_URL=https://YOUR-API/api` | `CLIENT_ORIGIN=https://YOUR-APP.vercel.app` |

Locally Vite proxies `/api` → `localhost:3001`. In production set `VITE_API_URL`.

See [.env.example](./.env.example) and [AGENTS.md](./AGENTS.md).

## OpenClaw (submodule)

OpenClaw source is in `openclaw/`. MOR agent config is in `integrations/openclaw/`.

```bash
git submodule update --init --recursive   # after clone
npm run openclaw:setup
npm run dev:full
```

See [integrations/openclaw/README.md](./integrations/openclaw/README.md).

## Environment

Copy `.env.example` to `.env` and set keys as needed (WalletConnect, Supabase, Stripe, etc.).
