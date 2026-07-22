import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { getAgentsContextSnapshot } from "./agentsContextService.js";
import { getOpenClawAgentsSnapshot } from "./openclawAgentsService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const PROMPTS_DIR = path.join(REPO_ROOT, "docs/agents/prompts");

export type MentorId = "hermes" | "claude";

export type MentorDefinition = {
  id: MentorId;
  openclawAgentId: string;
  name: string;
  role: "mentor";
  platform: "openclaw";
  purpose: string;
  outputs: string[];
  promptFile: string;
  allowed: string[];
  denied: string[];
};

export const MENTOR_DEFINITIONS: MentorDefinition[] = [
  {
    id: "hermes",
    openclawAgentId: "mor-hermes",
    name: "Hermes",
    role: "mentor",
    platform: "openclaw",
    purpose:
      "Engineering mentor — code review, optimizations, failure analysis, templates.",
    outputs: ["REVIEW", "OPTIMIZE", "EXPLAIN_FAILURE", "TEMPLATE"],
    promptFile: "docs/agents/prompts/hermes-mentor.md",
    allowed: [
      "Code review",
      "Failure root-cause",
      "Prompt/template suggestions",
      "Observability recommendations",
    ],
    denied: [
      "Auto-modify production code",
      "Deployments",
      "PR merge",
      "Financial execution",
    ],
  },
  {
    id: "claude",
    openclawAgentId: "main",
    name: "Claude",
    role: "mentor",
    platform: "openclaw",
    purpose:
      "Developer Academy education mentor — teach MOR/OpenClaw concepts and guide exercises.",
    outputs: ["TEACH", "GUIDE", "CHECK", "HANDOFF"],
    promptFile: "docs/agents/prompts/claude-mentor.md",
    allowed: [
      "Education",
      "Documentation guidance",
      "Exercise coaching",
      "Concept checks",
    ],
    denied: [
      "Production code changes",
      "Deployments",
      "Financial execution",
    ],
  },
];

export const mentorAskSchema = z.object({
  mentorId: z.enum(["hermes", "claude"]).default("hermes"),
  message: z.string().trim().min(1).max(8000),
  sessionId: z.string().trim().min(1).max(128).optional(),
  learnerId: z.string().trim().min(1).max(128).optional(),
  includeLiveContext: z.boolean().optional().default(true),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(8000),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

export type MentorAskInput = z.infer<typeof mentorAskSchema>;

function resolveMentor(id: string): MentorDefinition {
  const mentor = MENTOR_DEFINITIONS.find((entry) => entry.id === id);
  if (!mentor) {
    throw new HttpError(404, `Unknown mentorId "${id}". Use hermes or claude.`);
  }
  return mentor;
}

async function readPrompt(relPath: string) {
  try {
    return await fs.readFile(path.join(REPO_ROOT, relPath), "utf8");
  } catch {
    return `Mentor prompt missing at ${relPath}. Stay in recommend-only mentor mode.`;
  }
}

async function readSharedContext() {
  const shared = await readPrompt("docs/agents/prompts/shared-system-context.md");
  const limits = await readPrompt("docs/agents/prompts/agent-limitations.md");
  return `${shared}\n\n---\n\n${limits}`;
}

async function callOpenAI(system: string, messages: { role: string; content: string }[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  const model = (process.env.MOR_MENTOR_OPENAI_MODEL ?? "gpt-4.1-mini").trim();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const data = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenAI HTTP ${response.status}`);
  }
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

async function callAnthropic(system: string, messages: { role: string; content: string }[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  const model = (process.env.MOR_MENTOR_ANTHROPIC_MODEL ?? "claude-sonnet-4-5").trim();
  const anthropicMessages = messages.map((entry) => ({
    role: entry.role === "assistant" ? "assistant" : "user",
    content: entry.content,
  }));
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1600,
      temperature: 0.4,
      system,
      messages: anthropicMessages,
    }),
  });
  const data = (await response.json()) as {
    error?: { message?: string };
    content?: Array<{ type?: string; text?: string }>;
  };
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Anthropic HTTP ${response.status}`);
  }
  return (
    data.content
      ?.filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("\n")
      .trim() || null
  );
}

function extractLabels(text: string, allowed: string[]) {
  return allowed.filter((label) =>
    new RegExp(`\\b${label.replace(/_/g, "[_ ]?")}\\b`, "i").test(text),
  );
}

export async function listMentorsForAcademy() {
  const [openclaw, context] = await Promise.all([
    getOpenClawAgentsSnapshot(),
    getAgentsContextSnapshot(),
  ]);

  const authRequired = Boolean(process.env.MOR_MENTOR_API_KEY?.trim());

  return {
    generatedAt: new Date().toISOString(),
    product: "developer-academy-ai-mentor",
    mode: "recommend-only" as const,
    integration: {
      openclaw: {
        gatewayUrl: openclaw.openclaw.gatewayUrl,
        dashboardUrl: openclaw.openclaw.dashboardUrl,
        reachable: openclaw.openclaw.reachable,
        configLoaded: openclaw.openclaw.configLoaded,
        defaultModel: openclaw.openclaw.defaultModel,
      },
      hermesAgentId: "mor-hermes",
      claudeVia: "main OpenClaw orchestrator + claude mentor prompt",
    },
    authentication: {
      required: authRequired,
      scheme: authRequired
        ? "Bearer MOR_MENTOR_API_KEY or X-MOR-Mentor-Key"
        : "none (MOR_MENTOR_API_KEY unset — local/dev)",
      headerExamples: [
        "Authorization: Bearer <MOR_MENTOR_API_KEY>",
        "X-MOR-Mentor-Key: <MOR_MENTOR_API_KEY>",
      ],
    },
    endpoints: {
      discovery: "GET /api/agents/mentors",
      ask: "POST /api/agents/mentors/ask",
      openclawSnapshot: "GET /api/agents/openclaw",
      liveContext: "GET /api/agents/context",
      manifest: "GET /api/agents/manifest",
    },
    mentors: MENTOR_DEFINITIONS.map((mentor) => {
      const registered = openclaw.agents.find(
        (agent) => agent.id === mentor.openclawAgentId,
      );
      return {
        ...mentor,
        openclaw: {
          agentId: mentor.openclawAgentId,
          registered: Boolean(registered?.registered),
          model: registered?.model ?? openclaw.openclaw.defaultModel,
          workspace: registered?.workspace ?? null,
        },
      };
    }),
    liveContextSummary: {
      dataQuality: context.dataQuality,
      recommendPaused: context.dataQuality?.recommendPaused ?? null,
      agentFramework: context.agentFramework,
    },
    docs: {
      contract: "docs/agents/AI-MENTOR-ACADEMY.md",
      hermesPrompt: "docs/agents/prompts/hermes-mentor.md",
      claudePrompt: "docs/agents/prompts/claude-mentor.md",
      openclaw: "docs/agents/openclaw-integration.md",
    },
  };
}

export async function getMentorForAcademy(mentorId: string) {
  const mentor = resolveMentor(mentorId);
  const catalog = await listMentorsForAcademy();
  const entry = catalog.mentors.find((item) => item.id === mentor.id);
  return {
    generatedAt: catalog.generatedAt,
    authentication: catalog.authentication,
    endpoints: catalog.endpoints,
    mentor: entry,
    promptPreview: (await readPrompt(mentor.promptFile)).slice(0, 1200),
  };
}

export async function askMentor(input: MentorAskInput) {
  const mentor = resolveMentor(input.mentorId);
  const [shared, mentorPrompt, openclaw] = await Promise.all([
    readSharedContext(),
    readPrompt(mentor.promptFile),
    getOpenClawAgentsSnapshot(),
  ]);

  let liveContextBlock = "";
  if (input.includeLiveContext) {
    try {
      const context = await getAgentsContextSnapshot();
      liveContextBlock = JSON.stringify(
        {
          dataQuality: context.dataQuality,
          agentFramework: context.agentFramework,
          summary: context.summary,
          smartRouter: {
            recommendations: context.smartRouter?.recommendations?.slice?.(0, 5),
          },
        },
        null,
        2,
      ).slice(0, 12_000);
    } catch {
      liveContextBlock = "Live context unavailable.";
    }
  }

  const system = [
    shared,
    mentorPrompt,
    "You are responding through the Developer Academy AI Mentor API.",
    "Stay within mentor boundaries. Never claim production changes were applied.",
    `OpenClaw gateway reachable: ${openclaw.openclaw.reachable}.`,
    liveContextBlock
      ? `## Live MOR context (JSON)\n\`\`\`json\n${liveContextBlock}\n\`\`\``
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const messages = [
    ...input.history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    { role: "user", content: input.message },
  ];

  const errors: string[] = [];
  let reply: string | null = null;
  let provider: "openai" | "anthropic" | "stub" = "stub";

  // Prefer Anthropic for Claude mentor; OpenAI otherwise — with cross fallback.
  const order =
    mentor.id === "claude"
      ? (["anthropic", "openai"] as const)
      : (["openai", "anthropic"] as const);

  for (const candidate of order) {
    try {
      if (candidate === "openai") {
        reply = await callOpenAI(system, messages);
        if (reply) {
          provider = "openai";
          break;
        }
      } else {
        reply = await callAnthropic(system, messages);
        if (reply) {
          provider = "anthropic";
          break;
        }
      }
    } catch (error) {
      errors.push(
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (!reply) {
    reply = [
      `**${mentor.name}** (structural stub — configure OPENAI_API_KEY or ANTHROPIC_API_KEY)`,
      "",
      `Received: ${input.message.slice(0, 280)}`,
      "",
      mentor.id === "hermes"
        ? "REVIEW: I can mentor once an LLM key is configured. Boundaries remain: no production auto-modify."
        : "TEACH: Set OPENAI_API_KEY or ANTHROPIC_API_KEY on the MOR API server to enable live Academy mentoring.",
      "",
      errors.length ? `Provider errors: ${errors.join(" | ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    provider = "stub";
  }

  return {
    generatedAt: new Date().toISOString(),
    product: "developer-academy-ai-mentor",
    mode: "recommend-only" as const,
    sessionId: input.sessionId ?? null,
    learnerId: input.learnerId ?? null,
    mentor: {
      id: mentor.id,
      name: mentor.name,
      openclawAgentId: mentor.openclawAgentId,
      outputs: mentor.outputs,
    },
    provider,
    labels: extractLabels(reply, mentor.outputs),
    reply,
    openclaw: {
      gatewayUrl: openclaw.openclaw.gatewayUrl,
      dashboardUrl: openclaw.openclaw.dashboardUrl,
      reachable: openclaw.openclaw.reachable,
    },
    errors: errors.length ? errors : undefined,
  };
}

export function mentorPromptPath(mentorId: MentorId) {
  return path.join(PROMPTS_DIR, mentorId === "hermes" ? "hermes-mentor.md" : "claude-mentor.md");
}
