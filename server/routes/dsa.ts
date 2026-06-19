import { Router } from "express";
import type { MorModuleId } from "../lib/moduleRegistry.js";
import { morModuleDefinitions } from "../lib/moduleRegistry.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  getDsaAccountByAddress,
  getDsaAccountsForOwner,
  getMorDeploymentsPayload,
} from "../services/dsaService.js";
import {
  getModuleContractPayload,
  getPlatformStatus,
} from "../services/platformService.js";

const router = Router();

router.get(
  "/deployments",
  asyncHandler(async (_req, res) => {
    res.json(getMorDeploymentsPayload());
  })
);

router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    const payload = await getPlatformStatus();
    res.json(payload);
  })
);

router.get(
  "/modules/:moduleId",
  asyncHandler(async (req, res) => {
    const moduleId = String(req.params.moduleId);
    const valid = morModuleDefinitions.some((item) => item.id === moduleId);
    if (!valid) {
      res.status(404).json({ error: `Unknown module: ${moduleId}` });
      return;
    }
    const payload = getModuleContractPayload(moduleId as MorModuleId);
    res.json(payload);
  })
);

router.get(
  "/accounts/:walletAddress",
  asyncHandler(async (req, res) => {
    const walletAddress = String(req.params.walletAddress);
    const payload = await getDsaAccountsForOwner(walletAddress);
    res.json(payload);
  })
);

router.get(
  "/account/:dsaAddress",
  asyncHandler(async (req, res) => {
    const dsaAddress = String(req.params.dsaAddress);
    const payload = await getDsaAccountByAddress(dsaAddress);
    res.json(payload);
  })
);

export default router;
