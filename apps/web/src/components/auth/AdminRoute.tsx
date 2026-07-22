"use client";

import { Navigate, Outlet } from "react-router-dom";
import AppSpinner from "@/components/ui/AppSpinner";
import { useAuth } from "@/context/AuthContext";
import { AUTH_ROUTES } from "@/middleware/authMiddleware";

export default function AdminRoute() {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <AppSpinner size="small" label="Checking admin access" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.signIn} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={AUTH_ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
