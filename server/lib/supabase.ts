import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export type DatabaseClient = SupabaseClient;

export function createAnonClient(accessToken?: string) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured (missing SUPABASE_URL / SUPABASE_ANON_KEY).");
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
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service client is not configured.");
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
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
