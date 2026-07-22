import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

export type EnvIssue = {
  path: string;
  message: string;
  severity: "error" | "warning";
};

export type EnvConfig = {
  NODE_ENV: "development" | "production" | "test";
  SERVER_PORT: number;
  CLIENT_ORIGIN: string;
  clientOrigins: string[];
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_PUBLIC_MONTHLY?: string;
  STRIPE_PRICE_PUBLIC_ANNUAL?: string;
  STRIPE_PRICE_PRIVATE_MONTHLY?: string;
  STRIPE_PRICE_PRIVATE_ANNUAL?: string;
};

function optionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function optionalUrl(
  key: string,
  value: string | undefined,
  issues: EnvIssue[]
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    issues.push({
      path: key,
      message: `Invalid URL "${trimmed}" — ignored.`,
      severity: "warning",
    });
    return undefined;
  }
}

function loadEnv(): { config: EnvConfig; issues: EnvIssue[] } {
  const issues: EnvIssue[] = [];

  const raw = {
    ...process.env,
    SERVER_PORT: process.env.PORT ?? process.env.SERVER_PORT ?? "3001",
    SUPABASE_URL: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY,
  };

  const nodeEnv = raw.NODE_ENV?.trim();
  let NODE_ENV: EnvConfig["NODE_ENV"] = "development";
  if (nodeEnv === "development" || nodeEnv === "production" || nodeEnv === "test") {
    NODE_ENV = nodeEnv;
  } else if (nodeEnv) {
    issues.push({
      path: "NODE_ENV",
      message: `Invalid value "${nodeEnv}" — using "development".`,
      severity: "warning",
    });
  }

  const port = Number(raw.SERVER_PORT);
  let SERVER_PORT = 3001;
  if (Number.isFinite(port) && port > 0) {
    SERVER_PORT = Math.floor(port);
  } else {
    issues.push({
      path: "SERVER_PORT",
      message: `Invalid port "${raw.SERVER_PORT}" — using 3001.`,
      severity: "warning",
    });
  }

  const CLIENT_ORIGIN =
    optionalString(raw.CLIENT_ORIGIN) ?? "http://localhost:5173";
  const clientOrigins = CLIENT_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const config: EnvConfig = {
    NODE_ENV,
    SERVER_PORT,
    CLIENT_ORIGIN,
    clientOrigins,
    SUPABASE_URL: optionalUrl("SUPABASE_URL", raw.SUPABASE_URL, issues),
    SUPABASE_ANON_KEY: optionalString(raw.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: optionalString(raw.SUPABASE_SERVICE_ROLE_KEY),
    STRIPE_SECRET_KEY: optionalString(raw.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: optionalString(raw.STRIPE_WEBHOOK_SECRET),
    STRIPE_PRICE_PUBLIC_MONTHLY: optionalString(raw.STRIPE_PRICE_PUBLIC_MONTHLY),
    STRIPE_PRICE_PUBLIC_ANNUAL: optionalString(raw.STRIPE_PRICE_PUBLIC_ANNUAL),
    STRIPE_PRICE_PRIVATE_MONTHLY: optionalString(raw.STRIPE_PRICE_PRIVATE_MONTHLY),
    STRIPE_PRICE_PRIVATE_ANNUAL: optionalString(raw.STRIPE_PRICE_PRIVATE_ANNUAL),
  };

  return { config, issues };
}

const loaded = loadEnv();

export const env = loaded.config;
export const envIssues = loaded.issues;

if (envIssues.length > 0) {
  console.warn("[env] Configuration warnings (server will still start):");
  for (const issue of envIssues) {
    console.warn(`  [${issue.path}] ${issue.message}`);
  }
}
