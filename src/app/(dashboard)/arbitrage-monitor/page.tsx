import ArbitrageMonitorPanel from "./components/ArbitrageMonitorPanel";
import RegimeGaugeChart from "./components/RegimeGaugeChart";
import TradeSparklineChart from "./components/TradeSparklineChart";
import GasProfitBarChart from "./components/GasProfitBarChart";
import ExecutionLogTable from "./components/ExecutionLogTable";

export default function ArbitrageMonitorPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <ArbitrageMonitorPanel />
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 [&>*]:h-full [&>*]:min-h-0">
        <RegimeGaugeChart />
        <TradeSparklineChart />
      </div>
      <GasProfitBarChart />
      <ExecutionLogTable />
    </div>
  );
}
