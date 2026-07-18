import { dispatchMorSlackSlash } from "../../../scripts/mor-slack-slash.mjs";

export const MOR_SLASH_COMMANDS = [
  { name: "mor_pnl", skill: "mor-pnl", label: "MOR Route Quality" },
  { name: "mor_router", skill: "mor-smart-router", label: "MOR Smart Router" },
  { name: "mor_risk", skill: "mor-risk", label: "MOR Risk Guard" },
  { name: "mor_liquidity", skill: "mor-liquidity", label: "MOR Liquidity" },
  { name: "mor_mode", skill: "mor-mode", label: "MOR Market Mode" },
  { name: "mor_capital", skill: "mor-capital", label: "MOR Capital" },
  { name: "mor_governance", skill: "mor-governance", label: "MOR Governance" },
  { name: "mor_health", skill: "mor-health", label: "MOR Ops Watch" },
  { name: "mor_brief", skill: "mor-brief", label: "MOR Commander brief" },
  { name: "mor_finance", skill: "mor-finance", label: "MOR Finance brief" },
  { name: "mor_roundtable", skill: "mor-roundtable", label: "MOR roundtable" },
  { name: "mor_review", skill: "mor-review", label: "MOR full review" },
  { name: "mor_hermes", skill: "mor-hermes", label: "Hermes mentor" },
  { name: "mor_collab", skill: "mor-collab", label: "Hermes ↔ MOR collab" },
  { name: "mor_agents", skill: "mor-agents", label: "MOR Agents channel" },
  { name: "mor_audit", skill: "mor-audit", label: "MOR Audit channel" },
  { name: "mor_github", skill: "mor-github-events", label: "MOR GitHub events" },
  { name: "mor_suggestion", skill: "mor-suggestion", label: "MOR Suggestions" },
  { name: "mor_codefix", skill: "mor-codefix", label: "MOR Codefix" },
];

export function resolveCommandContext(ctx) {
  const to = String(ctx.to ?? ctx.from ?? "").trim();
  const userId = String(ctx.senderId ?? "").trim();
  const threadTs =
    ctx.messageThreadId != null && String(ctx.messageThreadId).trim()
      ? String(ctx.messageThreadId).trim()
      : "";

  if (to.startsWith("channel:")) {
    const channelId = to.slice("channel:".length);
    return { channelId, userId, threadTs };
  }
  if (/^[CG][A-Z0-9]+$/i.test(to)) {
    return { channelId: to, userId, threadTs };
  }

  const uid = userId || to.replace(/^(?:user|slack):/, "");
  return { channelId: "", userId: uid, threadTs };
}

export function handleMorSlashCommand(skill, label) {
  return async (ctx) => {
    const { channelId, userId, threadTs } = resolveCommandContext(ctx);
    if (!channelId && !userId) {
      return {
        text: "❌ Could not resolve Slack user/channel for this command. Try again from a DM or channel.",
      };
    }

    try {
      dispatchMorSlackSlash({
        skillName: skill,
        message: String(ctx.args ?? "").trim(),
        channelId,
        userId,
        threadTs,
        background: true,
      });
    } catch (err) {
      return { text: `❌ ${err.message ?? err}` };
    }

    const where = channelId ? "this channel" : "your DM";
    return {
      text: `✅ *${label}* is posting in ${where}. Specialists will follow up in the same thread — give it 30–90 seconds.`,
    };
  };
}
