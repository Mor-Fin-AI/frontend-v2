export type UserRole = "user" | "admin";

export type TicketCategory =
  | "Account"
  | "Wallet"
  | "Treasury"
  | "Technical"
  | "Billing"
  | "Other";

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type TicketStatus = "Open" | "In Progress" | "Resolved";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  wallet_address: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketRow {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketWithProfile extends SupportTicketRow {
  profiles: Pick<Profile, "email" | "full_name"> | null;
}

export interface ApiSupportTicket {
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
