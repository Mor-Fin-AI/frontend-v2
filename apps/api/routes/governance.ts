import { Router } from "express";
import { isAddress } from "viem";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  getGovernanceProposalById,
  getGovernanceProposals,
  getGovernanceStatus,
  getWalletGovernanceStats,
} from "../services/governanceService.js";

const router = Router();

router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    res.json(await getGovernanceStatus());
  })
);

router.get(
  "/proposals",
  asyncHandler(async (req, res) => {
    const voter = typeof req.query.voter === "string" ? req.query.voter : undefined;
    if (voter && !isAddress(voter)) {
      res.status(400).json({ error: "Invalid voter address" });
      return;
    }
    res.json(await getGovernanceProposals(voter));
  })
);

router.get(
  "/proposals/:proposalId",
  asyncHandler(async (req, res) => {
    const proposalId = String(req.params.proposalId);
    const voter = typeof req.query.voter === "string" ? req.query.voter : undefined;
    if (voter && !isAddress(voter)) {
      res.status(400).json({ error: "Invalid voter address" });
      return;
    }
    const proposal = await getGovernanceProposalById(proposalId, voter);
    if (!proposal) {
      res.status(404).json({ error: "Proposal not found on-chain" });
      return;
    }
    res.json(proposal);
  })
);

router.get(
  "/wallet/:walletAddress",
  asyncHandler(async (req, res) => {
    const walletAddress = String(req.params.walletAddress);
    res.json(await getWalletGovernanceStats(walletAddress));
  })
);

export default router;
