/**
 * Vercel serverless entry for `/api/*`.
 *
 * Important: do not rewrite browser traffic to this `.ts` file path.
 * That makes Vercel serve the source as a download.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/app.js";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Ensure Express sees `/api/...` even when Vercel strips the prefix.
  if (typeof req.url === "string" && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  return app(req, res);
}
