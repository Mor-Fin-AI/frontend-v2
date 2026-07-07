import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getAgentManifest } from "../services/agentManifestService.js";
import { getAgentsContextSnapshot } from "../services/agentsContextService.js";
import { evaluateSmartRouterFromExecutions } from "../services/smartRouterScoringService.js";
import { getArbitrageExecutions } from "../services/arbitrageService.js";
import { getOpenClawAgentsSnapshot } from "../services/openclawAgentsService.js";

const router = Router();

router.get(
  "/manifest",
  asyncHandler(async (_req, res) => {
    res.json(await getAgentManifest());
  })
);

router.get(
  "/context",
  asyncHandler(async (_req, res) => {
    res.json(await getAgentsContextSnapshot());
  })
);

router.get(
  "/openclaw",
  asyncHandler(async (_req, res) => {
    res.json(await getOpenClawAgentsSnapshot());
  })
);

router.get(
  "/smart-router",
  asyncHandler(async (_req, res) => {
    const context = await getAgentsContextSnapshot();
    res.json(context.smartRouter);
  })
);

router.post(
  "/smart-router/evaluate",
  asyncHandler(async (req, res) => {
    const arbitrage = await getArbitrageExecutions({ page: 1, pageSize: 50, sortBy: "time" });
    const context = await getAgentsContextSnapshot();
    const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates : undefined;

    res.json(
      evaluateSmartRouterFromExecutions({
        executions: arbitrage.executions,
        confidenceCap: context.dataQuality.confidenceCap,
        candidates,
      }),
    );
  })
);

export default router;
