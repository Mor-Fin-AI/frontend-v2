import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireMentorAuth } from "../middleware/mentorAuth.js";
import { getAgentManifest } from "../services/agentManifestService.js";
import { getAgentsContextSnapshot } from "../services/agentsContextService.js";
import {
  evaluateFlashloanOpportunities,
  isFlashloanProviderId,
  type FlashloanOpportunityResult,
} from "../services/flashloanOpportunityService.js";
import { scanLiveFlashloanQuotes } from "../services/flashloanLiveQuoteService.js";
import { isFlashloanChainId } from "../data/flashloanQuoteRoutes.js";
import { evaluateSmartRouterFromExecutions } from "../services/smartRouterScoringService.js";
import { getArbitrageExecutions } from "../services/arbitrageService.js";
import { getOpenClawAgentsSnapshot } from "../services/openclawAgentsService.js";
import {
  askMentor,
  getMentorForAcademy,
  listMentorsForAcademy,
  mentorAskSchema,
} from "../services/aiMentorService.js";

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

/** Developer Academy — AI Mentor discovery (OpenClaw + Hermes + Claude). */
router.get(
  "/mentors",
  requireMentorAuth,
  asyncHandler(async (_req, res) => {
    res.json(await listMentorsForAcademy());
  }),
);

/** Developer Academy — ask Hermes or Claude mentor. */
router.post(
  "/mentors/ask",
  requireMentorAuth,
  asyncHandler(async (req, res) => {
    const input = mentorAskSchema.parse(req.body ?? {});
    res.json(await askMentor(input));
  }),
);

router.get(
  "/mentors/:mentorId",
  requireMentorAuth,
  asyncHandler(async (req, res) => {
    res.json(await getMentorForAcademy(String(req.params.mentorId)));
  }),
);

router.get(
  "/smart-router",
  asyncHandler(async (_req, res) => {
    const context = await getAgentsContextSnapshot();
    res.json(context.smartRouter);
  })
);

router.get(
  "/flashloan-opportunities",
  asyncHandler(async (req, res) => {
    const providerId = isFlashloanProviderId(req.query.provider)
      ? req.query.provider
      : undefined;
    const chainFilter = isFlashloanChainId(req.query.chain)
      ? req.query.chain
      : undefined;
    const forceRefresh = req.query.refresh === "1";

    // Always scan live quotes for the dashboard/API (do not require ?chain=).
    const arbitrage = await getArbitrageExecutions({
      page: 1,
      pageSize: 50,
      sortBy: "time",
    });
    const liveQuotes = await scanLiveFlashloanQuotes({
      forceRefresh,
      chains: chainFilter,
    });
    const hasLive = liveQuotes.candidates.length > 0;
    const smartRouter = evaluateSmartRouterFromExecutions({
      executions: arbitrage.executions,
      confidenceCap: hasLive ? null : 50,
      candidates: hasLive ? liveQuotes.candidates : undefined,
    });

    res.json(
      evaluateFlashloanOpportunities({
        smartRouter,
        providerId,
        dataSource: hasLive ? "live-quotes" : "historical-executions",
        liveQuoteScan: {
          quotesAttempted: liveQuotes.quotesAttempted,
          quotesSucceeded: liveQuotes.quotesSucceeded,
          ethUsdPrice: liveQuotes.ethUsdPrice,
          chainsScanned: liveQuotes.chainsScanned,
          byChain: liveQuotes.byChain,
          errors: liveQuotes.errors,
        },
      }),
    );
  }),
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

router.post(
  "/flashloan-opportunities/evaluate",
  asyncHandler(async (req, res) => {
    const arbitrage = await getArbitrageExecutions({
      page: 1,
      pageSize: 50,
      sortBy: "time",
    });
    const bodyCandidates = Array.isArray(req.body?.candidates)
      ? req.body.candidates
      : undefined;
    const providerId = isFlashloanProviderId(req.body?.providerId)
      ? req.body.providerId
      : undefined;

    let candidates = bodyCandidates;
    let liveQuoteScan: FlashloanOpportunityResult["liveQuoteScan"];
    let dataSource: FlashloanOpportunityResult["dataSource"] | undefined;
    let confidenceCap: number | null = null;

    if (!candidates || candidates.length === 0) {
      const chainFilter = isFlashloanChainId(req.body?.chain)
        ? req.body.chain
        : undefined;
      const liveQuotes = await scanLiveFlashloanQuotes({
        forceRefresh: Boolean(req.body?.forceRefresh),
        chains: chainFilter,
      });
      candidates = liveQuotes.candidates;
      liveQuoteScan = {
        quotesAttempted: liveQuotes.quotesAttempted,
        quotesSucceeded: liveQuotes.quotesSucceeded,
        ethUsdPrice: liveQuotes.ethUsdPrice,
        chainsScanned: liveQuotes.chainsScanned,
        byChain: liveQuotes.byChain,
        errors: liveQuotes.errors,
      };
      dataSource = candidates.length > 0 ? "live-quotes" : undefined;
      if (!dataSource) {
        const context = await getAgentsContextSnapshot();
        confidenceCap = context.dataQuality.confidenceCap;
      }
    } else {
      dataSource = "live-candidates";
    }

    const smartRouter = evaluateSmartRouterFromExecutions({
      executions: arbitrage.executions,
      confidenceCap,
      candidates,
    });

    res.json(
      evaluateFlashloanOpportunities({
        smartRouter,
        providerId,
        dataSource,
        liveQuoteScan,
      }),
    );
  }),
);

export default router;
