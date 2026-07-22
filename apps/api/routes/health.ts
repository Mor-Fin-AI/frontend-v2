import { Router } from "express";
import { getEnvDiagnostics } from "../config/envDiagnostics.js";

const router = Router();

router.get("/", (_req, res) => {
  const config = getEnvDiagnostics();
  res.json({
    ok: true,
    service: "morfinance-api",
    timestamp: new Date().toISOString(),
    configReady: config.ok,
    configCheck: "/api/health/config",
  });
});

router.get("/config", (_req, res) => {
  const status = getEnvDiagnostics();
  res.status(status.ok ? 200 : 503).json(status);
});

export default router;
