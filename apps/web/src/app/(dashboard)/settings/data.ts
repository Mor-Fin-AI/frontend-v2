export type TicketCategory =
  | "Account"
  | "Wallet"
  | "Treasury"
  | "Technical"
  | "Billing"
  | "Other";

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type TicketStatus = "Open" | "In Progress" | "Resolved";

export const TICKET_CATEGORIES: TicketCategory[] = [
  "Account",
  "Wallet",
  "Treasury",
  "Technical",
  "Billing",
  "Other",
];

export const TICKET_PRIORITIES: TicketPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export const TICKET_STATUSES: TicketStatus[] = [
  "Open",
  "In Progress",
  "Resolved",
];

export { formatTicketDate } from "@/lib/supportTickets";
export type { SupportTicket } from "@/lib/supportTickets";
