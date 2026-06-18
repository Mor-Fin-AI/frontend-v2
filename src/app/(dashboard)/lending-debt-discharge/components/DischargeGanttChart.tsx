"use client";

import { GanttChart, type GanttChartDataPoint } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { LENDING_PAIR_CHART_HEIGHT } from "../chartLayout";
import { dischargeGanttTasks } from "../data";

const ganttData: GanttChartDataPoint[] = dischargeGanttTasks.map((task) => ({
  y: task.phase,
  x: { start: task.start, end: task.end },
  color: task.color,
  legend: task.phase,
}));

function DischargeGanttInner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <GanttChart
      data={ganttData}
      width={width}
      height={height}
      roundCorners
      enableGradient
    />
  );
}

export default function DischargeGanttChart() {
  return (
    <FluentChartCard
      title="Discharge Schedule"
      description="Multi-phase borrowing cycle timeline through cycle close"
      height={LENDING_PAIR_CHART_HEIGHT}
      className="h-full"
    >
      <DischargeGanttInner />
    </FluentChartCard>
  );
}
