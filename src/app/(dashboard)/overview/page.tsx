import TreasuryFlowPanel from "./components/TreasuryFlowPanel";
import TreasuryBalanceChart from "./components/TreasuryBalanceChart";
import TreasuryFlowSankey from "./components/TreasuryFlowSankey";
import TreasuryLedgerTable from "./components/TreasuryLedgerTable";

export default function OverviewPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <TreasuryFlowPanel />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TreasuryBalanceChart />
        <div className="min-w-0 xl:min-w-[480px]">
          <TreasuryFlowSankey />
        </div>
      </div>
      <TreasuryLedgerTable />
    </div>
  );
}
