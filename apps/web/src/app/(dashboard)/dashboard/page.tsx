"use client";

import { Link } from "react-router-dom";
import StatCards from "../overview/components/StatCards";
import ActivityOverview from "../overview/components/ActivityOverview";
import RecentActivityTable from "../overview/components/RecentActivityTable";
import DashboardStickyBanner from "./components/DashboardStickyBanner";
import LiveMorDataBanner from "@/components/contracts/LiveMorDataBanner";
import { useAuth } from "@/context/AuthContext";

function EngineeringDashboard() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <DashboardStickyBanner />
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Operations overview
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Engineering access includes agent health, infrastructure status, and system KPIs.
          Treasury balances, realized PnL, and financial reports require Owner/Admin access.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/openclaw-agents"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            OpenClaw Agents
          </Link>
          <Link
            to="/infrastructure-deployment"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            Infrastructure Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <EngineeringDashboard />;
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <DashboardStickyBanner />
      <LiveMorDataBanner />
      <StatCards />
      <ActivityOverview />
      <RecentActivityTable />
    </div>
  );
}
