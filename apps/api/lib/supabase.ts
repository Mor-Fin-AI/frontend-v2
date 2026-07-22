import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { missingEnvVars } from "../config/envStatus.js";
import { ConfigError } from "../middleware/errorHandler.js";

export type DatabaseClient = SupabaseClient;

export function createAnonClient(accessToken?: string) {
  const missing = missingEnvVars(["SUPABASE_URL", "SUPABASE_ANON_KEY"]);
  if (missing.length > 0) {
    throw new ConfigError("Supabase auth", missing);
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

export function createServiceClient() {
  const missing = missingEnvVars(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (missing.length > 0) {
    throw new ConfigError("Supabase admin", missing);
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getUserFromToken(accessToken: string) {
  const client = createAnonClient();
  const { data, error } = await client.auth.getUser(accessToken);

  if (error || !data.user) {
    return { user: null, error: error?.message ?? "Invalid or expired token." };
  }

  return { user: data.user, error: null };
}
