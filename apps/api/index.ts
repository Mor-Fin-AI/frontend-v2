import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const port = env.SERVER_PORT;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[api] http://localhost:${port}`);
    console.log(`[api] health: http://localhost:${port}/api/health`);
    console.log(`[api] config: http://localhost:${port}/api/health/config`);
  });
}

export default app;
