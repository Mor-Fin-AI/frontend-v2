import StatCards from "../overview/components/StatCards";
import ActivityOverview from "../overview/components/ActivityOverview";
import RecentActivityTable from "../overview/components/RecentActivityTable";
import DashboardStickyBanner from "./components/DashboardStickyBanner";

export default function DashboardPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <DashboardStickyBanner />
      <StatCards />
      <ActivityOverview />
      <RecentActivityTable />
    </div>
  );
}
