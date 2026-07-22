import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getAgentManifest() {
  const manifestPath = path.resolve(__dirname, "../../../docs/agents/manifest.json");
  const raw = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}
