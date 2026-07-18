import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createMorSlashTool } from "./mor-slash-tool.mjs";
import { MOR_SLASH_COMMANDS, handleMorSlashCommand } from "./mor-slash-commands.mjs";

export default definePluginEntry({
  id: "mor-slack",
  name: "MOR Slack Slash",
  description: "Fast slash dispatch for MOR Finance Slack commands (channel + DM).",
  register(api) {
    // Direct plugin slash handlers — bypass LLM (reliable <3s Slack ack).
    for (const cmd of MOR_SLASH_COMMANDS) {
      api.registerCommand({
        name: cmd.name,
        description: cmd.label,
        acceptsArgs: true,
        requireAuth: true,
        channels: ["slack"],
        handler: handleMorSlashCommand(cmd.skill, cmd.label),
      });
    }

    // Fallback for skill command-dispatch if enabled.
    api.registerTool((ctx) => createMorSlashTool(api, ctx));
  },
});
