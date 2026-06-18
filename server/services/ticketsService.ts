import { z } from "zod";
import { createAnonClient } from "../lib/supabase.js";
import type {
  ApiSupportTicket,
  SupportTicketRow,
  SupportTicketWithProfile,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../types/tickets.js";
import { HttpError } from "../middleware/errorHandler.js";

const ticketCategories = [
  "Account",
  "Wallet",
  "Treasury",
  "Technical",
  "Billing",
  "Other",
] as const satisfies readonly TicketCategory[];

const ticketPriorities = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const satisfies readonly TicketPriority[];

const ticketStatuses = [
  "Open",
  "In Progress",
  "Resolved",
] as const satisfies readonly TicketStatus[];

export const createTicketSchema = z.object({
  subject: z.string().trim().min(1).max(120),
  category: z.enum(ticketCategories),
  priority: z.enum(ticketPriorities),
  description: z.string().trim().min(1),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatuses),
});

function mapTicket(row: SupportTicketRow): ApiSupportTicket {
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

function mapTicketWithProfile(row: SupportTicketWithProfile): ApiSupportTicket {
  return {
    ...mapTicket(row),
    userEmail: row.profiles?.email ?? null,
    userName: row.profiles?.full_name ?? null,
  };
}

function userClient(accessToken: string) {
  return createAnonClient(accessToken);
}

export async function listUserTickets(accessToken: string, userId: string) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data ?? []).map((row) => mapTicket(row as SupportTicketRow));
}

export async function createTicket(
  accessToken: string,
  userId: string,
  input: z.infer<typeof createTicketSchema>
) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("support_tickets")
    .insert({
      user_id: userId,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      description: input.description,
      status: "Open",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new HttpError(500, error?.message ?? "Failed to create ticket.");
  }

  return mapTicket(data as SupportTicketRow);
}

export async function listAllTickets(accessToken: string) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("support_tickets")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data ?? []).map((row) =>
    mapTicketWithProfile(row as SupportTicketWithProfile)
  );
}

export async function updateTicketStatus(
  accessToken: string,
  ticketId: string,
  status: TicketStatus
) {
  const client = userClient(accessToken);
  const { data, error } = await client
    .from("support_tickets")
    .update({ status })
    .eq("id", ticketId)
    .select("*")
    .single();

  if (error || !data) {
    throw new HttpError(500, error?.message ?? "Failed to update ticket status.");
  }

  return mapTicket(data as SupportTicketRow);
}
