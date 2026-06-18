import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getSupportChat,
  sendMessageSchema,
  sendSupportChatMessage,
} from "../services/notificationsService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const chat = await getSupportChat(req.accessToken!, req.user!.id);
    res.json(chat);
  })
);

router.post(
  "/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = sendMessageSchema.parse(req.body);
    const result = await sendSupportChatMessage(
      req.accessToken!,
      req.user!.id,
      input
    );
    res.status(201).json(result);
  })
);

export default router;
