import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Prefer platform PORT (Railway/Render/Fly), then SERVER_PORT, then 3001.
  SERVER_PORT: z.coerce.number().int().positive().default(3001),
  // Comma-separated list of allowed browser origins for CORS.
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  // Optional for local/dev. Endpoints that require Supabase fail clearly, not crash.
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
    SERVER_PORT:
      process.env.PORT ?? process.env.SERVER_PORT ?? "3001",
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

  const clientOrigins = parsed.data.CLIENT_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    ...parsed.data,
    clientOrigins,
  };
}

export const env = loadEnv();
