#!/usr/bin/env node
/**
 * Evaluate Smart Router candidates for flashloan suitability and post the
 * deterministic, recommend-only result to Slack.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  deliverAgentToSlack,
  isSlackPublicChannel,
  loadConfig,
  postSlackMessage,
  resolveAgent,
  resolveActiveThreadTs,
  resolveFollowupAgents,
  resolveSlackChannel,
  runCommanderSynthesis,
} from "./mor-slack-delivery-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH =
  process.env.OPENCLAW_CONFIG_PATH ??
  path.join(REPO_ROOT, "integrations/openclaw/openclaw.json");

for (const envPath of [
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, ".env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

function parseArgs(argv) {
  const options = {
    to: process.env.SLACK_ALERT_USER_ID ?? "",
    channelId: process.env.SLACK_ALERT_CHANNEL_ID ?? "",
    providerId: "aave-v3",
    dryRun: false,
    discuss: true,
    /** Inject a labeled synthetic OPPORTUNITY so Slack peer discussion can be tested. */
    testDiscuss: false,
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--to") options.to = argv[++index] ?? "";
    else if (arg === "--channel") options.channelId = argv[++index] ?? "";
    else if (arg === "--provider") options.providerId = argv[++index] ?? "aave-v3";
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--no-discuss") options.discuss = false;
    else if (arg === "--test-discuss") options.testDiscuss = true;
  }
  return options;
}

function buildTestOpportunityResult(providerId) {
  const providers = {
    "aave-v3": { id: "aave-v3", name: "Aave V3", feeBps: 9 },
    "balancer-v2": { id: "balancer-v2", name: "Balancer V2", feeBps: 0 },
  };
  const provider = providers[providerId] ?? providers["aave-v3"];
  const borrowAmountUsd = 5000;
  const estimatedFlashloanFeeUsd = Number(
    ((borrowAmountUsd * provider.feeBps) / 10_000).toFixed(2),
  );
  return {
    generatedAt: new Date().toISOString(),
    mode: "recommend-only",
    executionPolicy: "risk-engine-approval-required",
    dataSource: "live-quotes",
    provider,
    thresholds: {
      minExpectedNetProfitUsd: 1,
      minExpectedRealizedProfitUsd: 0.5,
      minSuccessProbability: 0.6,
      minConfidenceScore: 50,
      minProfitToFeeRatio: 2,
      maxOpportunities: 5,
    },
    smartRouterGeneratedAt: new Date().toISOString(),
    candidatesEvaluated: 1,
    opportunitiesFound: 1,
    liveQuoteScan: {
      quotesAttempted: 1,
      quotesSucceeded: 1,
      ethUsdPrice: Number(process.env.ETH_USD_PRICE ?? 2350),
      errors: [],
    },
    opportunities: [
      {
        route: "TEST · UniswapV3-500→UniswapV3-3000",
        pair: "WETH/USDC",
        routeDexes: ["UniswapV3-500", "UniswapV3-3000"],
        providerId: provider.id,
        providerName: provider.name,
        action: "OPPORTUNITY",
        borrowAmountUsd,
        estimatedFlashloanFeeUsd,
        expectedNetProfitUsd: 28.5,
        expectedRealizedProfitUsd: 24.2,
        expectedValueUsd: 23.6,
        expectedBps: 57,
        confidenceScore: 78,
        successProbability: 0.85,
        gasEstimateUsd: 2,
        slippageEstimateBps: 8,
        liquidityScore: 82,
        recommendedTradeSizeUsd: borrowAmountUsd,
        riskLevel: "LOW",
        executionPriority: 1,
        profitToFeeRatio:
          estimatedFlashloanFeeUsd > 0
            ? Number((28.5 / estimatedFlashloanFeeUsd).toFixed(2))
            : null,
        rejectionReasons: [],
      },
    ],
    rejected: [],
  };
}

function usd(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function pct(value) {
  return `${(Number(value ?? 0) * 100).toFixed(1)}%`;
}

function formatReport(result) {
  const quoteMeta = result.liveQuoteScan
    ? ` · Live quotes: ${result.liveQuoteScan.quotesSucceeded}/${result.liveQuoteScan.quotesAttempted}`
    : "";
  const chainsMeta = result.liveQuoteScan?.chainsScanned?.length
    ? ` · Chains: ${result.liveQuoteScan.chainsScanned.join(", ")}`
    : "";
  const lines = [
    result.__testDiscuss
      ? "*Flashloan Opportunity Engine* — *TEST DISCUSSION* (synthetic live opportunity)"
      : "*Flashloan Opportunity Engine* — recommend only",
    `Source: *${result.dataSource ?? "unknown"}*${quoteMeta}${chainsMeta}`,
    `Provider: *${result.provider.name}* (${result.provider.feeBps} bps) · Evaluated: ${result.candidatesEvaluated} · Qualified: ${result.opportunitiesFound}`,
    `Policy: Risk Engine approval required; this job does not execute transactions.`,
  ];

  if (!result.opportunities.length) {
    const reasons = [...new Set(
      result.rejected.flatMap((row) => row.rejectionReasons ?? []),
    )].slice(0, 4);
    lines.push(
      "",
      "*Action: WATCH / NO EXECUTION*",
      reasons.length
        ? `Top rejection reasons: ${reasons.join(", ")}`
        : "No Smart Router candidates passed flashloan thresholds.",
    );
    return lines.join("\n");
  }

  lines.push("");
  for (const opportunity of result.opportunities) {
    lines.push(
      `*#${opportunity.executionPriority} ${opportunity.action} — ${opportunity.pair}*`,
      `Chain: *${opportunity.chain ?? "n/a"}* · Route: ${opportunity.route} · Size: ${usd(opportunity.recommendedTradeSizeUsd)}`,
      `Expected realized: *${usd(opportunity.expectedRealizedProfitUsd)}* · EV: ${usd(opportunity.expectedValueUsd)} · Net: ${usd(opportunity.expectedNetProfitUsd)}`,
      `Success: ${pct(opportunity.successProbability)} · Confidence: ${opportunity.confidenceScore}/100 · Risk: ${opportunity.riskLevel}`,
      `Gas: ${usd(opportunity.gasEstimateUsd)} · Flash fee: ${usd(opportunity.estimatedFlashloanFeeUsd)} · Slippage: ${opportunity.slippageEstimateBps} bps`,
      "",
    );
  }
  return lines.join("\n").trim();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let result;
  if (options.testDiscuss) {
    result = buildTestOpportunityResult(options.providerId);
    result.__testDiscuss = true;
  } else {
    const apiBase = (process.env.MOR_API_BASE ?? "http://localhost:3001/api").replace(
      /\/$/,
      "",
    );
    const url = new URL(`${apiBase}/agents/flashloan-opportunities`);
    url.searchParams.set("provider", options.providerId);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Flashloan Opportunity API HTTP ${response.status}`);
    }
    result = await response.json();
  }
  const text = formatReport(result);

  if (options.dryRun) {
    console.log(text);
    return;
  }
  if (!options.to && !options.channelId) {
    throw new Error("Set SLACK_ALERT_USER_ID or SLACK_ALERT_CHANNEL_ID");
  }

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is required");

  const cfg = loadConfig(CONFIG_PATH);
  const agent = resolveAgent(cfg, "mor-smart-router");
  const channel = await resolveSlackChannel({
    channelId: options.channelId,
    userId: options.to,
    token,
  });
  const activeThreadTs = isSlackPublicChannel(channel)
    ? undefined
    : await resolveActiveThreadTs(channel, options.to, token);
  const posted = await postSlackMessage({
    channel,
    text,
    name: agent.name,
    avatar: agent.avatar,
    token,
    threadTs: activeThreadTs,
  });
  console.log(`Delivered ${result.opportunitiesFound} flashloan opportunity recommendation(s).`);

  if (
    !options.discuss ||
    result.dataSource !== "live-quotes" ||
    !result.opportunities?.length
  ) {
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "Skipped peer discussion: OPENAI_API_KEY is required for specialist turns.",
    );
    return;
  }

  const threadTs = activeThreadTs ?? posted.ts;
  const transcript = [
    {
      id: "mor-smart-router",
      name: agent.name,
      text,
      ts: posted.ts,
    },
  ];
  const peers = resolveFollowupAgents("mor-smart-router", "auto");
  const opportunityContext = JSON.stringify(
    {
      generatedAt: result.generatedAt,
      dataSource: result.dataSource,
      provider: result.provider,
      liveQuoteScan: result.liveQuoteScan,
      opportunities: result.opportunities,
    },
    null,
    2,
  );
  const discussionPrompt = [
    result.__testDiscuss
      ? "This is a TEST DISCUSSION of a synthetic live flashloan opportunity."
      : "Review the live flashloan opportunities posted by MOR Smart Router.",
    "Reference prior specialists by name and challenge unsupported assumptions.",
    "Assess expected realized profit, quote freshness, liquidity, slippage, safe size,",
    "flashloan fee, gas, and route execution risk.",
    "Conclude with APPROVE, REDUCE, WATCH, or BLOCK.",
    "Recommend only. Never sign, submit, enqueue, or execute a transaction.",
  ].join(" ");

  console.log(`→ Opportunity discussion: ${peers.join(" → ")}`);
  let usedLlm = true;
  for (const peerId of peers) {
    try {
      const entry = await deliverAgentToSlack({
        cfg,
        agentId: peerId,
        message: discussionPrompt,
        to: options.to,
        token,
        channel,
        threadTs,
        transcript,
        contextBlock: opportunityContext,
        allowFallback: false,
      });
      transcript.push(entry);
    } catch (error) {
      if (!options.testDiscuss) throw error;
      usedLlm = false;
      const peer = resolveAgent(cfg, peerId);
      const stub = [
        `*${peer.name}* — structural discussion stub (LLM unavailable)`,
        `Responding to MOR Smart Router on \`${result.opportunities[0]?.pair ?? "route"}\`.`,
        peerId === "mor-pnl"
          ? "• PnL view: expected realized profit looks material vs fee/gas; verify quote persistence before Risk Engine."
          : peerId === "mor-liquidity"
            ? "• Liquidity view: size must stay inside depth; reduce if impact > quote bps cushion."
            : "• Risk view: BLOCK execution until Risk Engine signs off; recommend-only only.",
        `• LLM error: ${error instanceof Error ? error.message.split("|")[0].trim() : String(error)}`,
        "• Conclusion: WATCH",
      ].join("\n");
      const postedPeer = await postSlackMessage({
        channel,
        text: stub,
        name: peer.name,
        avatar: peer.avatar,
        token,
        threadTs,
      });
      transcript.push({
        id: peerId,
        name: peer.name,
        text: stub,
        ts: postedPeer.ts,
      });
      console.warn(`→ ${peerId} used structural stub (${error instanceof Error ? error.message.slice(0, 80) : error})`);
    }
  }

  try {
    await runCommanderSynthesis({
      cfg,
      transcript,
      userTopic:
        "Synthesize the live flashloan opportunity discussion into a final recommend-only posture for Risk Engine review.",
      to: options.to,
      token,
      channel,
      threadTs,
      allowFallback: false,
    });
  } catch (error) {
    if (!options.testDiscuss) throw error;
    usedLlm = false;
    const commander = resolveAgent(cfg, "main");
    const stub = [
      "*MOR Intelligence* — structural synthesis stub (LLM unavailable)",
      "• Smart Router posted a flashloan OPPORTUNITY for specialist review.",
      "• Specialists replied in-thread (PnL / Liquidity / Risk).",
      "• Final posture: WATCH — Risk Engine approval required; no execution.",
      `• LLM error: ${error instanceof Error ? error.message.split("|")[0].trim() : String(error)}`,
    ].join("\n");
    await postSlackMessage({
      channel,
      text: stub,
      name: commander.name,
      avatar: commander.avatar,
      token,
      threadTs,
    });
    console.warn(`→ Commander used structural stub`);
  }
  console.log(
    `→ ${peers.length} specialists + Commander synthesis posted in thread` +
      (usedLlm ? "." : " (structural stubs — restore OpenAI/Anthropic billing for live LLM discussion)."),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
