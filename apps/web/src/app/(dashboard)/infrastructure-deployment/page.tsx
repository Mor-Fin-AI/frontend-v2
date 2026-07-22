import InfrastructureDeploymentPanel from "./components/InfrastructureDeploymentPanel";
import RegionalProgressGeoChart from "./components/RegionalProgressGeoChart";
import RegionalHeatMapChart from "./components/RegionalHeatMapChart";
import MilestoneGanttChart from "./components/MilestoneGanttChart";
import BudgetAllocationChart from "./components/BudgetAllocationChart";
import PhotoReportsTable from "./components/PhotoReportsTable";

export default function InfrastructureDeploymentPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <InfrastructureDeploymentPanel />
      <RegionalProgressGeoChart />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RegionalHeatMapChart />
        <MilestoneGanttChart />
      </div>
      <BudgetAllocationChart />
      <PhotoReportsTable />
    </div>
  );
}
