import { apiRequest } from "@/lib/apiClient";

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

export async function fetchAdminStats() {
  return apiRequest<{ stats: AdminStats }>("/admin/stats");
}

export async function fetchAdminUsers() {
  return apiRequest<{ users: AdminUser[] }>("/admin/users");
}

export async function updateAdminUserRole(userId: string, role: "user" | "admin") {
  return apiRequest<{ user: AdminUser }>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function fetchAdminChatSessions() {
  return apiRequest<{ sessions: AdminChatSession[] }>("/admin/chat/sessions");
}

export async function fetchAdminChatMessages(sessionId: string) {
  return apiRequest<{ messages: AdminChatMessage[] }>(
    `/admin/chat/sessions/${sessionId}/messages`
  );
}

export async function sendAdminChatReply(sessionId: string, message: string) {
  return apiRequest<{ message: AdminChatMessage }>(
    `/admin/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
}

export function formatAdminDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
