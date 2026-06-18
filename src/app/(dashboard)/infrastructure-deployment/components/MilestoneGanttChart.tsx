"use client";

import { GanttChart, type GanttChartDataPoint } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { deploymentMilestones } from "../data";

const ganttData: GanttChartDataPoint[] = deploymentMilestones.map((task) => ({
  y: task.phase,
  x: { start: task.start, end: task.end },
  color: task.color,
}));

function MilestoneGanttInner({
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
    />
  );
}

export default function MilestoneGanttChart() {
  return (
    <FluentChartCard
      title="Deployment Milestones"
      description="Phase timeline for roads, housing, kerbs, and drainage"
      height={360}
    >
      <MilestoneGanttInner />
    </FluentChartCard>
  );
}
