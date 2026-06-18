import { Router } from "express";
import healthRouter from "./health.js";
import adminRouter from "./admin.js";
import notificationsRouter from "./notifications.js";
import supportChatRouter from "./supportChat.js";
import ticketsRouter from "./tickets.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/admin", adminRouter);
router.use("/notifications", notificationsRouter);
router.use("/support/chat", supportChatRouter);
router.use("/tickets", ticketsRouter);

export default router;
