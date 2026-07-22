import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// Local / Docker: listen on a port.
// Vercel: detects the default export and does not need listen().
if (!process.env.VERCEL) {
  app.listen(env.SERVER_PORT, () => {
    console.log(
      `[server] Morfinance API listening on http://localhost:${env.SERVER_PORT}`,
    );
    console.log(
      `[server] Health check: http://localhost:${env.SERVER_PORT}/api/health`,
    );
  });
}

export default app;
