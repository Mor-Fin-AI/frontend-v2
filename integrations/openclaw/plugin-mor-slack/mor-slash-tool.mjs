import { dispatchMorSlackSlash } from "../../../scripts/mor-slack-slash.mjs";
import { resolveCommandContext } from "./mor-slash-commands.mjs";

function jsonResult(text) {
  return { content: [{ type: "text", text }] };
}

function resolveRepoRoot(api) {
  const configured = api.pluginConfig?.repoRoot;
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim();
  }
  return process.env.MOR_REPO?.trim() || "";
}

export function createMorSlashTool(api, ctx) {
  return {
    name: "mor_slash",
    label: "MOR Slack Slash",
    description: "Dispatch MOR Finance slash commands to specialist Slack delivery scripts.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string" },
        commandName: { type: "string" },
        skillName: { type: "string" },
      },
      additionalProperties: true,
    },
    execute: async (_toolCallId, rawParams) => {
      const skillName = String(rawParams?.skillName ?? "").trim();
      if (!skillName) throw new Error("mor_slash: missing skillName");

      const pseudoCtx = {
        to: ctx.deliveryContext?.to,
        from: ctx.deliveryContext?.to,
        senderId: ctx.requesterSenderId,
        messageThreadId: ctx.deliveryContext?.threadId,
      };
      let { channelId, userId, threadTs } = resolveCommandContext(pseudoCtx);

      if (!channelId && !userId) {
        userId = process.env.SLACK_ALERT_USER_ID ?? "";
      }
      if (!channelId && !userId) {
        throw new Error("mor_slash: no Slack channel or user in delivery context");
      }

      const repoRoot = resolveRepoRoot(api);
      if (!repoRoot) throw new Error("mor_slash: MOR_REPO not configured");

      dispatchMorSlackSlash({
        skillName,
        message: String(rawParams?.command ?? "").trim(),
        channelId,
        userId,
        threadTs,
        background: true,
      });

      const where = channelId ? "this channel" : "your DM";
      return jsonResult(
        `✅ MOR specialist is posting in ${where}. Give it 30–90 seconds.`,
      );
    },
  };
}
