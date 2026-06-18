"use client";

import {
  GroupedVerticalBarChart,
  type GroupedVerticalBarChartData,
} from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { budgetAllocationByCategory } from "../data";

const barData: GroupedVerticalBarChartData[] = budgetAllocationByCategory.map(
  (group) => ({
    name: group.name,
    series: group.series.map((point) => ({
      key: point.key,
      legend: point.legend,
      data: point.data / 1000000,
      color: point.color,
      yAxisCalloutData: `$${(point.data / 1000000).toFixed(2)}M`,
    })),
  })
);

function BudgetAllocationInner({
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
      yAxisTickFormat={(value: number) => `$${value}M`}
    />
  );
}

export default function BudgetAllocationChart() {
  return (
    <FluentChartCard
      title="Budget Allocation by Category"
      description="Spent vs remaining budget across infrastructure workstreams (USD millions)"
      height={360}
    >
      <BudgetAllocationInner />
    </FluentChartCard>
  );
}
