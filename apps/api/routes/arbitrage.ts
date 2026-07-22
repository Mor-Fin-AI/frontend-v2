import { Router } from "express";
import { isAddress } from "viem";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getArbitrageExecutions } from "../services/arbitrageService.js";

const router = Router();

router.get(
  "/executions",
  asyncHandler(async (req, res) => {
    const wallet =
      typeof req.query.wallet === "string" ? req.query.wallet : undefined;
    if (wallet && !isAddress(wallet)) {
      res.status(400).json({ error: "Invalid wallet address" });
      return;
    }

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const sortBy =
      typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;

    res.json(
      await getArbitrageExecutions({
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 10,
        walletAddress: wallet,
        search,
        sortBy,
      })
    );
  })
);

export default router;
