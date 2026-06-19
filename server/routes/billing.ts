import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import {
  createBillingPortalSession,
  createCheckoutSession,
  getPublicPlans,
  getUserSubscription,
  verifyCheckoutSession,
} from "../services/billingService.js";

const router = Router();

const checkoutSchema = z.object({
  tier: z.enum(["public", "private"]),
  interval: z.enum(["monthly", "annual"]),
});

router.get(
  "/plans",
  asyncHandler(async (_req, res) => {
    res.json(getPublicPlans());
  })
);

router.get(
  "/subscription",
  requireAuth,
  asyncHandler(async (req, res) => {
    const subscription = await getUserSubscription(req.user!.id);
    res.json(subscription);
  })
);

router.post(
  "/checkout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid checkout payload.");
    }

    const session = await createCheckoutSession({
      userId: req.user!.id,
      email: req.user!.email,
      tier: parsed.data.tier,
      interval: parsed.data.interval,
    });

    res.json(session);
  })
);

router.post(
  "/portal",
  requireAuth,
  asyncHandler(async (req, res) => {
    const session = await createBillingPortalSession(req.user!.id);
    res.json(session);
  })
);

router.get(
  "/session/:sessionId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessionId = String(req.params.sessionId);
    const subscription = await verifyCheckoutSession(req.user!.id, sessionId);
    res.json(subscription);
  })
);

export default router;
