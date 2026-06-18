export interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  openChatSessions: number;
  totalChatMessages: number;
}

export interface AdminUser {
  id: string;
  email: string | null;
  fullName: string | null;
  walletAddress: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export interface AdminChatSession {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  status: "open" | "closed";
  messageCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  updatedAt: string;
}

export interface AdminChatMessage {
  id: string;
  role: "user" | "support";
  text: string;
  time: string;
  createdAt: string;
}
