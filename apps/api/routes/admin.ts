import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import {
  adminChatReplySchema,
  getAdminChatMessages,
  getAdminStats,
  listAdminChatSessions,
  listAdminUsers,
  sendAdminChatReply,
  updateUserRole,
  updateUserRoleSchema,
} from "../services/adminService.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const stats = await getAdminStats(req.accessToken!);
    res.json({ stats });
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await listAdminUsers(req.accessToken!);
    res.json({ users });
  })
);

router.patch(
  "/users/:userId/role",
  asyncHandler(async (req, res) => {
    const userId = String(req.params.userId ?? "");
    if (!userId) {
      throw new HttpError(400, "userId is required.");
    }

    const { role } = updateUserRoleSchema.parse(req.body);
    const user = await updateUserRole(req.accessToken!, userId, role);
    res.json({ user });
  })
);

router.get(
  "/chat/sessions",
  asyncHandler(async (req, res) => {
    const sessions = await listAdminChatSessions(req.accessToken!);
    res.json({ sessions });
  })
);

router.get(
  "/chat/sessions/:sessionId/messages",
  asyncHandler(async (req, res) => {
    const sessionId = String(req.params.sessionId ?? "");
    if (!sessionId) {
      throw new HttpError(400, "sessionId is required.");
    }

    const messages = await getAdminChatMessages(req.accessToken!, sessionId);
    res.json({ messages });
  })
);

router.post(
  "/chat/sessions/:sessionId/messages",
  asyncHandler(async (req, res) => {
    const sessionId = String(req.params.sessionId ?? "");
    if (!sessionId) {
      throw new HttpError(400, "sessionId is required.");
    }

    const { message } = adminChatReplySchema.parse(req.body);
    const reply = await sendAdminChatReply(
      req.accessToken!,
      req.user!.id,
      sessionId,
      message
    );
    res.status(201).json({ message: reply });
  })
);

export default router;
