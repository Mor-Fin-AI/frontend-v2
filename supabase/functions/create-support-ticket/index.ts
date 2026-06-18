import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsonResponse, optionsResponse } from "../_shared/cors.ts";

const CATEGORIES = [
  "Account",
  "Wallet",
  "Treasury",
  "Technical",
  "Billing",
  "Other",
] as const;

const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

type TicketInput = {
  subject?: string;
  category?: string;
  priority?: string;
  description?: string;
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

function validateTicketInput(body: TicketInput) {
  const subject = body.subject?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const category = body.category ?? "";
  const priority = body.priority ?? "";

  if (!subject || subject.length > 120) {
    return { error: "Subject is required and must be 120 characters or fewer." };
  }

  if (!description) {
    return { error: "Description is required." };
  }

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Invalid ticket category." };
  }

  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return { error: "Invalid ticket priority." };
  }

  return {
    data: { subject, description, category, priority },
  };
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

    const body = (await req.json()) as TicketInput;
    const validation = validateTicketInput(body);

    if ("error" in validation) {
      return jsonResponse({ error: validation.error }, 400);
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: validation.data.subject,
        category: validation.data.category,
        priority: validation.data.priority,
        description: validation.data.description,
        status: "Open",
      })
      .select("*")
      .single();

    if (error || !data) {
      return jsonResponse(
        { error: error?.message ?? "Failed to create support ticket." },
        500
      );
    }

    return jsonResponse({ ticket: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
});
