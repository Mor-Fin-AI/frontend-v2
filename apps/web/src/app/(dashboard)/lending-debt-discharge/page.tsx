import LendingDebtDischargePanel from "./components/LendingDebtDischargePanel";
import LiveLendingBanner from "./components/LiveLendingBanner";
import RepaymentGaugeChart from "./components/RepaymentGaugeChart";
import DischargeGanttChart from "./components/DischargeGanttChart";
import LoanPositionsTable from "./components/LoanPositionsTable";

export default function LendingDebtDischargePage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <LiveLendingBanner />
      <LendingDebtDischargePanel />
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2 [&>*]:h-full [&>*]:min-h-0">
        <RepaymentGaugeChart />
        <DischargeGanttChart />
      </div>
      <LoanPositionsTable />
    </div>
  );
}
