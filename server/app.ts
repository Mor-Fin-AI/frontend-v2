import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { billingWebhookHandler } from "./routes/billingWebhook.js";
import { githubWebhookHandler } from "./routes/githubWebhook.js";
import apiRouter from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Non-browser clients (curl, webhooks) send no Origin.
        if (!origin) {
          callback(null, true);
          return;
        }
        if (env.clientOrigins.includes("*") || env.clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );

  app.post(
    "/api/billing/webhook",
    express.raw({ type: "application/json" }),
    billingWebhookHandler
  );

  app.post(
    "/api/github/webhook",
    express.raw({ type: "application/json" }),
    githubWebhookHandler
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.json({ ok: true, message: "Morfinance API server" });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
