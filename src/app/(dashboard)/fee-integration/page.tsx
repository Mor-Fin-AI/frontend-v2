import FeeIntegrationPanel from "./components/FeeIntegrationPanel";
import SupportedDexStrip from "@/components/evm/SupportedDexStrip";
import MonitoredChainsStrip from "@/components/evm/MonitoredChainsStrip";
import FeeVolumeAreaChart from "./components/FeeVolumeAreaChart";
import FeeRoutingSankeyChart from "./components/FeeRoutingSankeyChart";
import DistributionGaugeChart from "./components/DistributionGaugeChart";
import DistributionLedgerTable from "./components/DistributionLedgerTable";

export default function FeeIntegrationPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <FeeIntegrationPanel />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MonitoredChainsStrip title="Fee capture networks" />
        <SupportedDexStrip />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2 [&>*]:h-full [&>*]:min-h-0">
        <FeeVolumeAreaChart />
        <FeeRoutingSankeyChart />
      </div>
      <DistributionGaugeChart />
      <DistributionLedgerTable />
    </div>
  );
}
