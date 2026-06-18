import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsonResponse, optionsResponse } from "../_shared/cors.ts";

const STATUSES = ["Open", "In Progress", "Resolved"] as const;

type UpdateInput = {
  ticketId?: string;
  status?: string;
};

function getAuthedClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: authHeader } },
    }
  );
}

async function isAdmin(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return data?.role === "admin";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = getAuthedClient(req);
    if (!supabase) {
      return jsonResponse({ error: "Missing authorization header." }, 401);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return jsonResponse({ error: "Admin access required." }, 403);
    }

    const body = (await req.json()) as UpdateInput;
    const ticketId = body.ticketId?.trim();
    const status = body.status ?? "";

    if (!ticketId) {
      return jsonResponse({ error: "ticketId is required." }, 400);
    }

    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      return jsonResponse({ error: "Invalid ticket status." }, 400);
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId)
      .select("*")
      .single();

    if (error || !data) {
      return jsonResponse(
        { error: error?.message ?? "Failed to update ticket status." },
        500
      );
    }

    return jsonResponse({ ticket: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
});
