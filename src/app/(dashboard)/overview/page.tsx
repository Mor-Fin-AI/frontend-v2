import React from "react";
import StatCards from "./components/StatCards";
import ActivityOverview from "./components/ActivityOverview";
import RecentActivityTable from "./components/RecentActivityTable";
import { motion } from "framer-motion";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6 mt-6">
      <StatCards />
      <ActivityOverview />
      <RecentActivityTable />
    </div>
  );
}
