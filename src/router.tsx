import { createBrowserRouter, Navigate } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import OverviewPage from "@/app/(dashboard)/overview/page";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import UserDsaAccountPage from "@/app/(dashboard)/dsa-account/page";
import ArbitrageMonitorPage from "@/app/(dashboard)/arbitrage-monitor/page";
import DaoEducationRewardsPage from "@/app/(dashboard)/dao-education-rewards/page";
import LendingDebtDischargePage from "@/app/(dashboard)/lending-debt-discharge/page";
import InfrastructureDeploymentPage from "@/app/(dashboard)/infrastructure-deployment/page";
import FeeIntegrationPage from "@/app/(dashboard)/fee-integration/page";
import PricingPage from "@/app/(dashboard)/pricing/page";
import PricingSuccessPage from "@/app/(dashboard)/pricing/success/page";
import PricingCancelPage from "@/app/(dashboard)/pricing/cancel/page";
import GovernancePage from "@/app/(dashboard)/governance/page";
import CreateProposalPage from "@/app/(dashboard)/governance/create/page";
import ProposalDetailPage from "@/app/(dashboard)/governance/proposal/page";
import SettingsLayout from "@/app/(dashboard)/settings/layout";
import SettingsGeneralPage from "@/app/(dashboard)/settings/general/page";
import SettingsSupportPage from "@/app/(dashboard)/settings/support/page";
import SettingsAuditLogsPage from "@/app/(dashboard)/settings/audit-logs/page";
import AdminDashboardPage from "@/app/(dashboard)/admin/page";
import AdminUsersPage from "@/app/(dashboard)/admin/users/page";
import AdminChatPage from "@/app/(dashboard)/admin/chat/page";
import AdminTicketsPage from "@/app/(dashboard)/admin/tickets/page";
import SignInPage from "@/app/auth/sign-in/page";
import RegisterPage from "@/app/auth/register/page";
import ResetPasswordPage from "@/app/auth/reset-password/page";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import GuestRoute from "@/components/auth/GuestRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    element: <GuestRoute />,
    children: [
      { path: "/sign-in", element: <SignInPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "overview", element: <OverviewPage /> },
          { path: "dsa-account", element: <UserDsaAccountPage /> },
          { path: "arbitrage-monitor", element: <ArbitrageMonitorPage /> },
          { path: "dao-education-rewards", element: <DaoEducationRewardsPage /> },
          { path: "lending-debt-discharge", element: <LendingDebtDischargePage /> },
          { path: "infrastructure-deployment", element: <InfrastructureDeploymentPage /> },
          { path: "fee-integration", element: <FeeIntegrationPage /> },
          { path: "pricing", element: <PricingPage /> },
          { path: "pricing/success", element: <PricingSuccessPage /> },
          { path: "pricing/cancel", element: <PricingCancelPage /> },
          { path: "governance/create", element: <CreateProposalPage /> },
          { path: "governance", element: <GovernancePage /> },
          { path: "governance/:proposalId", element: <ProposalDetailPage /> },
          {
            path: "settings",
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="general" replace /> },
              { path: "general", element: <SettingsGeneralPage /> },
              { path: "support", element: <SettingsSupportPage /> },
              { path: "audit-logs", element: <SettingsAuditLogsPage /> },
            ],
          },
          { path: "audit-logs", element: <Navigate to="/settings/audit-logs" replace /> },
          {
            path: "admin",
            element: <AdminRoute />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "tickets", element: <AdminTicketsPage /> },
              { path: "users", element: <AdminUsersPage /> },
              { path: "chat", element: <AdminChatPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
