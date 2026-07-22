import { env, envIssues, type EnvConfig, type EnvIssue } from "./env.js";

export type FeatureStatus = {
  ready: boolean;
  missing: string[];
  hint?: string;
};

export type ConfigStatus = {
  ok: boolean;
  issues: EnvIssue[];
  features: Record<string, FeatureStatus>;
  envFileHint: string;
};

const FEATURES: Record<
  string,
  { keys: (keyof EnvConfig)[]; hint: string }
> = {
  supabaseAuth: {
    keys: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    hint: "Required for login and authenticated routes.",
  },
  supabaseAdmin: {
    keys: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    hint: "Required for billing webhooks and admin DB writes.",
  },
  stripe: {
    keys: ["STRIPE_SECRET_KEY"],
    hint: "Required for checkout and subscription routes.",
  },
  stripeWebhooks: {
    keys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    hint: "Required for POST /api/billing/webhook.",
  },
};

function isSet(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function missingEnvVars(keys: (keyof EnvConfig)[]): string[] {
  return keys.filter((key) => !isSet(env[key]));
}

export function getFeatureStatus(
  feature: string,
  keys: (keyof EnvConfig)[],
  hint: string
): FeatureStatus {
  const missing = missingEnvVars(keys);
  return {
    ready: missing.length === 0,
    missing,
    hint,
  };
}

export function getConfigStatus(): ConfigStatus {
  const features = Object.fromEntries(
    Object.entries(FEATURES).map(([name, { keys, hint }]) => [
      name,
      getFeatureStatus(name, keys, hint),
    ])
  );

  const hasBlockingIssues = envIssues.some((issue) => issue.severity === "error");

  return {
    ok: !hasBlockingIssues,
    issues: envIssues,
    features,
    envFileHint:
      "Set missing variables in Vercel → Project → Settings → Environment Variables, or in the repo root .env for local dev.",
  };
}

export { envIssues };
