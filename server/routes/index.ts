import { Router } from "express";
import healthRouter from "./health.js";
import adminRouter from "./admin.js";
import notificationsRouter from "./notifications.js";
import supportChatRouter from "./supportChat.js";
import ticketsRouter from "./tickets.js";
import dsaRouter from "./dsa.js";
import governanceRouter from "./governance.js";
import billingRouter from "./billing.js";
import lendingRouter from "./lending.js";
import arbitrageRouter from "./arbitrage.js";
import agentsRouter from "./agents.js";
import githubRouter from "./github.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/admin", adminRouter);
router.use("/notifications", notificationsRouter);
router.use("/support/chat", supportChatRouter);
router.use("/tickets", ticketsRouter);
router.use("/dsa", dsaRouter);
router.use("/governance", governanceRouter);
router.use("/billing", billingRouter);
router.use("/lending", lendingRouter);
router.use("/arbitrage", arbitrageRouter);
router.use("/agents", agentsRouter);
router.use("/github", githubRouter);

export default router;
