import { createHmac, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { GithubSlackWorkflowId } from "../data/githubSlackWorkflows.js";
import { resolveWorkflowChannelId } from "../data/githubSlackWorkflows.js";
import { postSlackMessage } from "./slackPostService.js";
import {
  buildGithubReviewContext,
  formatGithubReviewContextForAgents,
  saveGithubReviewContext,
} from "./githubCodeReviewService.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const PROCESSED_DELIVERIES = new Set<string>();
const MAX_PROCESSED = 500;

export type GithubWebhookResult = {
  ok: true;
  event: string;
  action: string | null;
  workflows: string[];
  slackPosted: boolean;
};

function rememberDelivery(deliveryId: string) {
  PROCESSED_DELIVERIES.add(deliveryId);
  if (PROCESSED_DELIVERIES.size > MAX_PROCESSED) {
    const first = PROCESSED_DELIVERIES.values().next().value;
    if (first) PROCESSED_DELIVERIES.delete(first);
  }
}

export function verifyGithubSignature(rawBody: Buffer, signatureHeader: string | undefined) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = `sha256=${digest}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

function formatGithubEvent(payload: Record<string, unknown>) {
  const event = String(payload.action ?? payload.ref ?? "update");
  const repo = (payload.repository as { full_name?: string } | undefined)?.full_name ?? "unknown/repo";
  const sender = (payload.sender as { login?: string } | undefined)?.login ?? "unknown";

  if (payload.pull_request) {
    const pr = payload.pull_request as {
      number: number;
      title: string;
      html_url: string;
      state: string;
      user?: { login?: string };
    };
    return {
      title: `PR #${pr.number}: ${pr.title}`,
      lines: [
        `*Repository:* ${repo}`,
        `*Action:* ${event}`,
        `*Author:* ${pr.user?.login ?? sender}`,
        `*State:* ${pr.state}`,
        `*Link:* ${pr.html_url}`,
      ],
      url: pr.html_url,
      number: pr.number,
    };
  }

  if (payload.issue && !payload.comment) {
    const issue = payload.issue as {
      number: number;
      title: string;
      html_url: string;
      state: string;
      user?: { login?: string };
    };
    return {
      title: `Issue #${issue.number}: ${issue.title}`,
      lines: [
        `*Repository:* ${repo}`,
        `*Action:* ${event}`,
        `*Author:* ${issue.user?.login ?? sender}`,
        `*State:* ${issue.state}`,
        `*Link:* ${issue.html_url}`,
      ],
      url: issue.html_url,
      number: issue.number,
    };
  }

  if (payload.commits && Array.isArray(payload.commits)) {
    const commits = payload.commits as Array<{ id: string; message: string; author?: { name?: string } }>;
    const ref = String(payload.ref ?? "refs/heads/main");
    const branch = ref.replace(/^refs\/heads\//, "");
    const head = commits[0];
    return {
      title: `Push to ${branch} (${commits.length} commit${commits.length === 1 ? "" : "s"})`,
      lines: [
        `*Repository:* ${repo}`,
        `*Pusher:* ${sender}`,
        `*Branch:* ${branch}`,
        head ? `*Latest:* \`${head.id.slice(0, 7)}\` ${head.message.split("\n")[0]}` : "",
        `*Compare:* ${(payload.compare as string | undefined) ?? ""}`,
      ].filter(Boolean),
      url: (payload.compare as string | undefined) ?? null,
      number: null,
    };
  }

  return {
    title: `GitHub ${event}`,
    lines: [`*Repository:* ${repo}`, `*Actor:* ${sender}`],
    url: null,
    number: null,
  };
}

function spawnWorkflow(
  workflowId: GithubSlackWorkflowId,
  message: string,
  threadTs?: string,
  reviewContextPath?: string,
) {
  const channelId = resolveWorkflowChannelId(workflowId);
  if (!channelId) return false;

  const script = path.join(REPO_ROOT, "scripts/deliver-slack-github-workflow.mjs");
  const args = [script, "--workflow", workflowId, message];
  args.push("--channel", channelId);
  if (threadTs) args.push("--thread-ts", threadTs);
  if (reviewContextPath) args.push("--review-context", reviewContextPath);

  const child = spawn(process.execPath, args, {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      MOR_REPO: process.env.MOR_REPO ?? REPO_ROOT,
      GITHUB_REVIEW_CONTEXT_PATH: reviewContextPath ?? "",
    },
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return true;
}

function shouldAutoReviewCode(event: string, action: string | null) {
  if (process.env.GITHUB_AUTO_REVIEW_CODE === "false") return false;
  if (process.env.GITHUB_AUTO_AUDIT_PR === "true") {
    return event === "pull_request" && (action === "opened" || action === "synchronize");
  }
  if (process.env.GITHUB_AUTO_REVIEW_CODE === "true") {
    if (event === "pull_request" && (action === "opened" || action === "synchronize")) return true;
    if (event === "push") return true;
  }
  return false;
}

function shouldAutoAudit(event: string, action: string | null) {
  if (process.env.GITHUB_AUTO_AUDIT_PR !== "true") return false;
  return event === "pull_request" && (action === "opened" || action === "synchronize");
}

function shouldAutoCodefix(event: string, payload: Record<string, unknown>) {
  if (process.env.GITHUB_AUTO_CODEFIX !== "true") return false;
  const comment = payload.comment as { body?: string } | undefined;
  const body = comment?.body?.toLowerCase() ?? "";
  return event === "issue_comment" && (body.includes("@hermes") || body.includes("/mor_codefix"));
}

function shouldAutoAgentsOnIssue(event: string, action: string | null) {
  if (process.env.GITHUB_AUTO_AGENTS_ISSUES !== "true") return false;
  return event === "issues" && (action === "opened" || action === "reopened");
}

function shouldAutoSuggestionOnIssue(event: string, action: string | null) {
  if (process.env.GITHUB_AUTO_SUGGESTION_ISSUES !== "true") return false;
  return event === "issues" && (action === "opened" || action === "reopened");
}

export async function handleGithubWebhook(options: {
  event: string;
  deliveryId: string | undefined;
  payload: Record<string, unknown>;
}): Promise<GithubWebhookResult> {
  const { event, deliveryId, payload } = options;
  const action = typeof payload.action === "string" ? payload.action : null;

  if (deliveryId) {
    if (PROCESSED_DELIVERIES.has(deliveryId)) {
      return { ok: true, event, action, workflows: [], slackPosted: false };
    }
    rememberDelivery(deliveryId);
  }

  const formatted = formatGithubEvent({ ...payload, action: action ?? event });
  const reviewContext = await buildGithubReviewContext(event, payload);
  let reviewContextPath: string | undefined;
  let codeReviewBlock = "";

  if (reviewContext) {
    reviewContextPath = saveGithubReviewContext(reviewContext);
    codeReviewBlock = formatGithubReviewContextForAgents(reviewContext);
  }

  const eventsChannel = resolveWorkflowChannelId("mor-github-events");

  let slackPosted = false;
  let threadTs: string | undefined;

  if (eventsChannel) {
    const fileSummary =
      reviewContext && reviewContext.changedFiles.length > 0
        ? `\n*Changed files (${reviewContext.changedFiles.length}):*\n${reviewContext.changedFiles
            .slice(0, 8)
            .map((f) => `• \`${f.path}\` (${f.status})`)
            .join("\n")}`
        : "";
    const text = [`:github: *${formatted.title}*`, ...formatted.lines, fileSummary]
      .filter(Boolean)
      .join("\n");
    const post = await postSlackMessage({
      channel: eventsChannel,
      text,
      username: "MOR GitHub",
      iconUrl: "https://ui-avatars.com/api/?name=GH&background=24292f&color=fff&size=128&bold=true",
    });
    threadTs = post.ts ?? undefined;
    slackPosted = true;
  }

  const workflows: string[] = [];
  const contextMessage = [
    `GitHub ${event}${action ? ` (${action})` : ""}: ${formatted.title}`,
    formatted.url ? `URL: ${formatted.url}` : "",
    reviewContext
      ? `Changed files: ${reviewContext.changedFiles.map((f) => f.path).join(", ") || "see context"}`
      : "",
    codeReviewBlock || "Review this change in the context of MOR Finance engineering standards.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const autoReview = shouldAutoReviewCode(event, action) || shouldAutoAudit(event, action);

  if (autoReview && reviewContext) {
    if (spawnWorkflow("mor-audit", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-audit");
    }
  } else if (shouldAutoAudit(event, action)) {
    if (spawnWorkflow("mor-audit", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-audit");
    }
  }

  if (shouldAutoCodefix(event, payload)) {
    if (spawnWorkflow("mor-codefix", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-codefix");
    }
  }

  if (event === "pull_request" && action === "opened" && process.env.GITHUB_AUTO_SUGGESTION === "true") {
    if (spawnWorkflow("mor-suggestion", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-suggestion");
    }
  }

  if (shouldAutoSuggestionOnIssue(event, action)) {
    if (spawnWorkflow("mor-suggestion", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-suggestion");
    }
  }

  // Push with code diff → suggestion pass when enabled
  if (event === "push" && reviewContext?.source === "local-git" && process.env.GITHUB_AUTO_REVIEW_CODE === "true") {
    if (spawnWorkflow("mor-agents", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-agents");
    }
  }

  if (shouldAutoAgentsOnIssue(event, action)) {
    if (spawnWorkflow("mor-agents", contextMessage, threadTs, reviewContextPath)) {
      workflows.push("mor-agents");
    }
  }

  return { ok: true, event, action, workflows, slackPosted };
}
