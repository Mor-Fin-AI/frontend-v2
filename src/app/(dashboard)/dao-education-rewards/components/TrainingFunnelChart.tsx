"use client";

import { FunnelChart, type FunnelChartDataPoint } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { trainingFunnelData } from "../data";

const funnelData: FunnelChartDataPoint[] = trainingFunnelData.map((row) => ({
  stage: row.stage,
  value: row.value,
  color: row.color,
}));

function TrainingFunnelInner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <FunnelChart
      data={funnelData}
      width={width}
      height={height}
      orientation="horizontal"
      hideLegend={false}
    />
  );
}

export default function TrainingFunnelChart() {
  return (
    <FluentChartCard
      title="Training Pipeline Funnel"
      description="Learner progression from enrollment through NFT issuance"
      height={340}
    >
      <TrainingFunnelInner />
    </FluentChartCard>
  );
}
