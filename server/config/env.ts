import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SERVER_PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  // Optional for local/dev and for serverless cold-start resilience.
  // Endpoints that require Supabase should fail with a clear 500, not crash the process.
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_PUBLIC_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PUBLIC_ANNUAL: z.string().optional(),
  STRIPE_PRICE_PRIVATE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRIVATE_ANNUAL: z.string().optional(),
});

function loadEnv() {
  const withFallbacks = {
    ...process.env,
    SUPABASE_URL:
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY,
  };

  const parsed = envSchema.safeParse(withFallbacks);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment:\n${details}`);
  }

  return parsed.data;
}

export const env = loadEnv();
