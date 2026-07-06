import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import {
  handleGithubWebhook,
  verifyGithubSignature,
} from "../services/githubWebhookService.js";
import { GITHUB_SLACK_WORKFLOWS } from "../data/githubSlackWorkflows.js";
import { resolveWorkflowChannelId } from "../data/githubSlackWorkflows.js";

export const githubWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!Buffer.isBuffer(req.body)) {
    throw new HttpError(400, "Webhook requires raw request body.");
  }

  const signature = req.headers["x-hub-signature-256"];
  if (!verifyGithubSignature(req.body, typeof signature === "string" ? signature : undefined)) {
    throw new HttpError(401, "Invalid GitHub webhook signature.");
  }

  const event = req.headers["x-github-event"];
  if (!event || typeof event !== "string") {
    throw new HttpError(400, "Missing X-GitHub-Event header.");
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(req.body.toString("utf8")) as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "Invalid JSON payload.");
  }

  const deliveryId =
    typeof req.headers["x-github-delivery"] === "string"
      ? req.headers["x-github-delivery"]
      : undefined;

  const result = await handleGithubWebhook({ event, deliveryId, payload });
  res.json(result);
});

export const githubWorkflowsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    workflows: GITHUB_SLACK_WORKFLOWS.map((workflow) => ({
      ...workflow,
      channelConfigured: Boolean(resolveWorkflowChannelId(workflow.id)),
      channelId: resolveWorkflowChannelId(workflow.id),
    })),
    webhookPath: "/api/github/webhook",
    autoTriggers: {
      auditOnPr: process.env.GITHUB_AUTO_AUDIT_PR === "true",
      suggestionOnPr: process.env.GITHUB_AUTO_SUGGESTION === "true",
      suggestionOnIssue: process.env.GITHUB_AUTO_SUGGESTION_ISSUES === "true",
      agentsOnIssue: process.env.GITHUB_AUTO_AGENTS_ISSUES === "true",
      codefixOnMention: process.env.GITHUB_AUTO_CODEFIX === "true",
    },
  });
});
