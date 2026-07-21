import { createApp } from "../server/app.js";

// Vercel serverless catch-all for `/api/*`.
// Forwards the request into the existing Express app (read-only MVP behavior).
const app = createApp();

export default function handler(req: any, res: any) {
  // Depending on Vercel routing, `req.url` may be missing the `/api` prefix.
  // Express in this repo expects routes like `/api/agents/context`.
  if (typeof req?.url === "string" && !req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}

