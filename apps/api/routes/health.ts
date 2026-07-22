import { Router } from "express";
import { getConfigStatus } from "../config/envStatus.js";

const router = Router();

router.get("/", (_req, res) => {
  const config = getConfigStatus();
  res.json({
    ok: true,
    service: "morfinance-api",
    timestamp: new Date().toISOString(),
    configReady: config.ok,
    configCheck: "/api/health/config",
  });
});

router.get("/config", (_req, res) => {
  const status = getConfigStatus();
  res.status(status.ok ? 200 : 503).json(status);
});

export default router;
