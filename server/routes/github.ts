import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { githubWorkflowsHandler } from "./githubWebhook.js";
import { loadGithubReviewContext } from "../services/githubCodeReviewService.js";

const router = Router();

router.get("/workflows", githubWorkflowsHandler);

router.get(
  "/review-context",
  asyncHandler(async (_req, res) => {
    const context = loadGithubReviewContext();
    if (!context) {
      res.status(404).json({ error: "No GitHub review context saved yet." });
      return;
    }
    res.json(context);
  }),
);

export default router;
