"use client";

import { useMemo } from "react";
import { GanttChart, type GanttChartDataPoint } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { useLendingDischargeData } from "@/hooks/useLendingDischarge";
import { LENDING_PAIR_CHART_HEIGHT } from "../chartLayout";

function DischargeGanttInner({
  data,
  width,
  height,
}: {
  data: GanttChartDataPoint[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        No discharge events recorded on-chain yet.
      </div>
    );
  }

  return (
    <GanttChart
      data={data}
      width={width}
      height={height}
      roundCorners
      enableGradient
    />
  );
}

export default function DischargeGanttChart() {
  const { data, isLoading, isError } = useLendingDischargeData();

  const ganttData = useMemo<GanttChartDataPoint[]>(() => {
    if (!data?.ganttTasks?.length) return [];
    return data.ganttTasks.map((task) => ({
      y: task.phase,
      x: {
        start: new Date(task.start),
        end: new Date(task.end),
      },
      color: task.color,
      legend: task.phase,
    }));
  }, [data?.ganttTasks]);

  const description = isError
    ? "Could not load discharge timeline from chain"
    : isLoading
      ? "Loading discharge schedule from MorTreasuryFlowPanel…"
      : ganttData.length > 0
        ? "On-chain discharge phases from MorTreasuryFlowPanel"
        : "No active discharge phases on-chain";

  return (
    <FluentChartCard
      title="Discharge Schedule"
      description={description}
      height={LENDING_PAIR_CHART_HEIGHT}
      className="h-full"
      isLoading={isLoading}
    >
      <DischargeGanttInner data={ganttData} />
    </FluentChartCard>
  );
}
