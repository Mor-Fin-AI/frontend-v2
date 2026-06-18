"use client";

import { HeatMapChart, type HeatMapChartData } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { regionalHeatMapData } from "../data";

const heatMapData: HeatMapChartData[] = regionalHeatMapData;

function RegionalHeatMapInner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <HeatMapChart
      data={heatMapData}
      width={width}
      height={height}
      domainValuesForColorScale={[0, 50, 100]}
      rangeValuesForColorScale={["#E8E8E8", "#F69E23", "#22C38E"]}
    />
  );
}

export default function RegionalHeatMapChart() {
  return (
    <FluentChartCard
      title="Regional Deployment Heatmap"
      description="Completion intensity by region and infrastructure category"
      height={360}
    >
      <RegionalHeatMapInner />
    </FluentChartCard>
  );
}
