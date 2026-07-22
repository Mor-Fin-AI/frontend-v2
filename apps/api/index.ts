/**
 * Local dev entry — uses the same simple test app as Vercel (api/index.ts).
 * Full Express app in app.ts is disabled for now.
 */
import app from "./api/index.js";

const port = Number(process.env.PORT ?? process.env.SERVER_PORT ?? 3001);

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[test-api] http://localhost:${port}`);
    console.log(`[test-api] health: http://localhost:${port}/api/health`);
  });
}

export default app;
