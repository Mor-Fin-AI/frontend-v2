import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.SERVER_PORT, () => {
  console.log(`[server] Morfinance API listening on http://localhost:${env.SERVER_PORT}`);
  console.log(`[server] Health check: http://localhost:${env.SERVER_PORT}/api/health`);
});
