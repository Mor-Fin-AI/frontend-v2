"use client";

import StatCards from "../overview/components/StatCards";
import ActivityOverview from "../overview/components/ActivityOverview";
import RecentActivityTable from "../overview/components/RecentActivityTable";
import DashboardStickyBanner from "./components/DashboardStickyBanner";
import LiveMorDataBanner from "@/components/contracts/LiveMorDataBanner";

export default function DashboardPage() {
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
