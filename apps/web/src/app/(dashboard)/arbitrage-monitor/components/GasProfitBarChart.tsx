"use client";

import {
  GroupedVerticalBarChart,
  type GroupedVerticalBarChartData,
} from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { arbitrageGasByPair } from "../data";

const barData: GroupedVerticalBarChartData[] = arbitrageGasByPair.map(
  (group) => ({
    name: group.name,
    series: group.series.map((point) => ({
      key: point.key,
      legend: point.legend,
      data: point.data,
      color: point.color,
    })),
  })
);

function GasBarChartInner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <GroupedVerticalBarChart
      data={barData}
      width={width}
      height={height}
      roundCorners
    />
  );
}

export default function GasProfitBarChart() {
  return (
    <FluentChartCard
      title="Gas vs Net Profit by Pair"
      description="Gas efficiency compared to fit target across active routes"
      height={340}
    >
      <GasBarChartInner />
    </FluentChartCard>
  );
}
