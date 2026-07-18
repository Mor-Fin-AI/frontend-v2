# frontend-v2

Mor Finance user dashboard — Vite + React with Fluent UI, treasury flows, arbitrage monitoring, fee integration, and Web3 wallet support.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — MOR API + dashboard
- `npm run openclaw:setup` — generate OpenClaw agent workspaces + config
- `npm run openclaw:gateway` — OpenClaw Control UI on http://127.0.0.1:18789/
- `npm run dev:full` — MOR + OpenClaw together
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## OpenClaw (submodule)

OpenClaw source is in `openclaw/`. MOR agent config is in `integrations/openclaw/`.

```bash
git submodule update --init --recursive   # after clone
npm run openclaw:setup
npm run dev:full
```

See [integrations/openclaw/README.md](./integrations/openclaw/README.md).

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_WALLETCONNECT_PROJECT_ID` — WalletConnect project ID
- `VITE_GOOGLE_MAPS_API_KEY` — optional, for GeoChart maps
