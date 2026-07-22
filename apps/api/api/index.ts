/**
 * Minimal Mor Finance API — Vercel test server.
 * Full app (routes, Supabase, etc.) is disabled until deploy works.
 */
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "morfinance-api-test",
    message: "Simple test server is running.",
    endpoints: ["/api/health"],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "morfinance-api-test",
    timestamp: new Date().toISOString(),
  });
});

export default app;
