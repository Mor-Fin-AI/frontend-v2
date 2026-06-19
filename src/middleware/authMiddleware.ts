import type { UserRole } from "@/types/database";

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  register: "/register",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  admin: "/admin",
  adminTickets: "/admin/tickets",
} as const;

export function isAdminRole(role: UserRole | string | null | undefined) {
  return role === "admin";
}

export function canAccessAdmin(role: UserRole | string | null | undefined) {
  return isAdminRole(role);
}

export function getRedirectPathForAuth(
  isAuthenticated: boolean,
  pathname: string,
  role?: UserRole | null
) {
  if (!isAuthenticated) {
    if (pathname.startsWith("/admin")) {
      return AUTH_ROUTES.signIn;
    }
    return null;
  }

  if (pathname.startsWith("/admin") && !canAccessAdmin(role)) {
    return AUTH_ROUTES.dashboard;
  }

  if (pathname === AUTH_ROUTES.signIn || pathname === AUTH_ROUTES.register) {
    return AUTH_ROUTES.dashboard;
  }

  if (pathname === AUTH_ROUTES.resetPassword) {
    return null;
  }

  return null;
}
