import { Router } from "express";
import { isAddress } from "viem";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getLendingDischargeData } from "../services/lendingService.js";

const router = Router();

router.get(
  "/discharge",
  asyncHandler(async (req, res) => {
    const wallet =
      typeof req.query.wallet === "string" ? req.query.wallet : undefined;
    if (wallet && !isAddress(wallet)) {
      res.status(400).json({ error: "Invalid wallet address" });
      return;
    }
    res.json(await getLendingDischargeData(wallet));
  })
);

export default router;
