import DaoEducationRewardsPanel from "./components/DaoEducationRewardsPanel";
import TrainingFunnelChart from "./components/TrainingFunnelChart";
import CertificationPolarChart from "./components/CertificationPolarChart";
import CohortCertificationTable from "./components/CohortCertificationTable";

export default function DaoEducationRewardsPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <DaoEducationRewardsPanel />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TrainingFunnelChart />
        <CertificationPolarChart />
      </div>
      <CohortCertificationTable />
    </div>
  );
}
