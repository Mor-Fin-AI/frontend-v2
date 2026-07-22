import { env, envIssues } from "./env.js";
import { getConfigStatus, type ConfigStatus } from "./envStatus.js";

const API_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PUBLIC_MONTHLY",
  "STRIPE_PRICE_PUBLIC_ANNUAL",
  "STRIPE_PRICE_PRIVATE_MONTHLY",
  "STRIPE_PRICE_PRIVATE_ANNUAL",
  "CLIENT_ORIGIN",
  "NODE_ENV",
] as const;

const FRONTEND_ONLY_KEYS = [
  "VITE_API_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_WALLETCONNECT_PROJECT_ID",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_ARBITRUM_RPC_URL",
] as const;

function isPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

function maskHint(value: string | undefined): "missing" | "set" {
  return value?.trim() ? "set" : "missing";
}

export type EnvDiagnostics = ConfigStatus & {
  runtime: {
    vercel: boolean;
    nodeEnv: string;
    platform: string;
  };
  /** Which keys exist in process.env (values never exposed). */
  processEnv: Record<string, boolean>;
  /** Resolved config after fallbacks — set/missing only. */
  resolved: Record<string, "set" | "missing">;
  tips: string[];
};

export function getEnvDiagnostics(): EnvDiagnostics {
  const status = getConfigStatus();

  const processEnv: Record<string, boolean> = {};
  for (const key of API_ENV_KEYS) {
    processEnv[key] = isPresent(key);
  }
  for (const key of FRONTEND_ONLY_KEYS) {
    processEnv[key] = isPresent(key);
  }

  const resolved = {
    SUPABASE_URL: maskHint(env.SUPABASE_URL),
    SUPABASE_ANON_KEY: maskHint(env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: maskHint(env.SUPABASE_SERVICE_ROLE_KEY),
    STRIPE_SECRET_KEY: maskHint(env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: maskHint(env.STRIPE_WEBHOOK_SECRET),
    CLIENT_ORIGIN: maskHint(env.CLIENT_ORIGIN),
  };

  const tips: string[] = [];

  if (process.env.VERCEL) {
    tips.push(
      "API env vars must be on the API Vercel project (Root Directory: apps/api), not only the frontend project."
    );
    tips.push("After changing env vars in Vercel, redeploy the API project.");
  }

  if (
    isPresent("VITE_SUPABASE_URL") &&
    !isPresent("SUPABASE_URL") &&
    resolved.SUPABASE_URL === "set"
  ) {
    tips.push(
      "SUPABASE_URL is loaded from VITE_SUPABASE_URL fallback. Prefer setting SUPABASE_URL on the API project."
    );
  }

  if (
    !isPresent("SUPABASE_URL") &&
    !isPresent("VITE_SUPABASE_URL") &&
    resolved.SUPABASE_URL === "missing"
  ) {
    tips.push(
      "Add SUPABASE_URL to the API Vercel project (or VITE_SUPABASE_URL as fallback)."
    );
  }

  if (
    isPresent("VITE_SUPABASE_URL") &&
    isPresent("VITE_SUPABASE_ANON_KEY") &&
    !isPresent("SUPABASE_URL") &&
    !isPresent("SUPABASE_ANON_KEY")
  ) {
    tips.push(
      "You may have added VITE_* vars to the API project. The API reads SUPABASE_URL and SUPABASE_ANON_KEY (VITE_* works as fallback). Add them on this API project or redeploy after fixing names."
    );
  }

  if (
    !processEnv.CLIENT_ORIGIN &&
    env.CLIENT_ORIGIN === "http://localhost:5173" &&
    process.env.VERCEL
  ) {
    tips.push(
      "Set CLIENT_ORIGIN on the API project to your frontend URL(s), e.g. https://your-app.vercel.app,http://localhost:5173"
    );
  }

  const anyFeatureMissing = Object.values(status.features).some((f) => !f.ready);
  if (anyFeatureMissing) {
    tips.push(
      "Stripe vars are optional unless you use billing. Supabase vars are required for login and authenticated API routes."
    );
  }

  if (envIssues.some((i) => i.path === "SUPABASE_URL")) {
    tips.push(
      "SUPABASE_URL is set but invalid (must be a full https URL). Fix the value in Vercel env settings."
    );
  }

  return {
    ...status,
    ok: status.features.supabaseAuth.ready,
    runtime: {
      vercel: Boolean(process.env.VERCEL),
      nodeEnv: env.NODE_ENV,
      platform: process.env.VERCEL ? "vercel" : "local",
    },
    processEnv,
    resolved,
    tips,
  };
}
