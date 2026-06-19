export type UserRole = "user" | "admin";

export type SubscriptionTier = "free" | "public" | "private";
export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";
export type BillingPeriod = "monthly" | "annual";

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

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  billing_period: BillingPeriod | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          wallet_address?: string | null;
          role?: UserRole;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          wallet_address?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: SupportTicketRow;
        Insert: {
          user_id: string;
          subject: string;
          category: TicketCategory;
          priority: TicketPriority;
          description: string;
          status?: TicketStatus;
          ticket_number?: string;
        };
        Update: {
          subject?: string;
          category?: TicketCategory;
          priority?: TicketPriority;
          description?: string;
          status?: TicketStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: {
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: SubscriptionTier;
          billing_period?: BillingPeriod | null;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: SubscriptionTier;
          billing_period?: BillingPeriod | null;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
