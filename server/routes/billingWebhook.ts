import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { handleStripeWebhook } from "../services/billingService.js";

export const billingWebhookHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new HttpError(400, "Missing Stripe signature header.");
    }

    if (!Buffer.isBuffer(req.body)) {
      throw new HttpError(400, "Webhook requires raw request body.");
    }

    const result = await handleStripeWebhook(req.body, signature);
    res.json(result);
  }
);
