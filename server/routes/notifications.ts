import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationsService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await listNotifications(req.accessToken!, req.user!.id);
    res.json({ notifications });
  })
);

router.patch(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await markAllNotificationsRead(req.accessToken!, req.user!.id);
    res.json({ ok: true });
  })
);

router.patch(
  "/:notificationId/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notificationId = req.params.notificationId;
    if (!notificationId) {
      throw new HttpError(400, "notificationId is required.");
    }

    await markNotificationRead(req.accessToken!, notificationId);
    res.json({ ok: true });
  })
);

export default router;
