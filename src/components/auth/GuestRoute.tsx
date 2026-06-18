"use client";

import { Navigate, Outlet } from "react-router-dom";
import AppSpinner from "@/components/ui/AppSpinner";
import { useAuth } from "@/context/AuthContext";
import { AUTH_ROUTES } from "@/middleware/authMiddleware";

export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AppSpinner size="small" label="Loading" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
