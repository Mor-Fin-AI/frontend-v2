import { supabase } from "@/lib/supabase";

import type {
  SupportTicketRow,
  SupportTicketWithProfile,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/database";

export interface SupportTicket {
  id: string;
  dbId: string;
  userId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  createdAt: string;
  userEmail?: string | null;
  userName?: string | null;
}

export function mapTicket(row: SupportTicketRow): SupportTicket {
  return {
    id: row.ticket_number,
    dbId: row.id,
    userId: row.user_id,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapTicketWithProfile(row: SupportTicketWithProfile): SupportTicket {
  return {
    ...mapTicket(row),
    userEmail: row.profiles?.email ?? null,
    userName: row.profiles?.full_name ?? null,
  };
}

function mapSetupError(message: string) {
  if (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("42P01")
  ) {
    return "Support ticket tables are missing. Run Supabase migration 001 in your project.";
  }

  return message;
}

async function requireAuthUser() {
  if (!supabase) {
    return { user: null, error: "Supabase is not configured." as const };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { user: null, error: "You must be signed in." as const };
  }

  return { user: session.user, error: null };
}

export async function fetchUserTickets() {
  if (!supabase) {
    return { data: [] as SupportTicket[], error: "Supabase is not configured." };
  }

  const { error: authError } = await requireAuthUser();
  if (authError) {
    return { data: [] as SupportTicket[], error: authError };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [] as SupportTicket[], error: mapSetupError(error.message) };
  }

  return {
    data: (data ?? []).map((row) => mapTicket(row as SupportTicketRow)),
    error: null,
  };
}

export async function createSupportTicket(input: {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
}) {
  const subject = input.subject.trim();
  const description = input.description.trim();

  if (!subject) {
    return { data: null as SupportTicket | null, error: "Subject is required." };
  }

  if (!description) {
    return { data: null as SupportTicket | null, error: "Description is required." };
  }

  const { user, error: authError } = await requireAuthUser();
  if (authError || !user) {
    return { data: null, error: authError };
  }

  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      category: input.category,
      priority: input.priority,
      description,
      status: "Open",
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      data: null,
      error: mapSetupError(error?.message ?? "Failed to create ticket."),
    };
  }

  return { data: mapTicket(data as SupportTicketRow), error: null };
}

export async function fetchAllTicketsAdmin() {
  if (!supabase) {
    return { data: [] as SupportTicket[], error: "Supabase is not configured." };
  }

  const { error: authError } = await requireAuthUser();
  if (authError) {
    return { data: [] as SupportTicket[], error: authError };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [] as SupportTicket[], error: mapSetupError(error.message) };
  }

  return {
    data: (data ?? []).map((row) =>
      mapTicketWithProfile(row as SupportTicketWithProfile)
    ),
    error: null,
  };
}

export async function updateTicketStatus(dbId: string, status: TicketStatus) {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error: authError } = await requireAuthUser();
  if (authError) {
    return { error: authError };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", dbId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: mapSetupError(error?.message ?? "Failed to update ticket status."),
    };
  }

  return { error: null, ticket: mapTicket(data as SupportTicketRow) };
}

/** @deprecated Use fetchUserTickets — kept for compatibility */
export async function fetchUserTicketsDirect() {
  return fetchUserTickets();
}

/** @deprecated Use fetchAllTicketsAdmin — kept for compatibility */
export async function fetchAllTicketsAdminDirect() {
  return fetchAllTicketsAdmin();
}

export function formatTicketDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
