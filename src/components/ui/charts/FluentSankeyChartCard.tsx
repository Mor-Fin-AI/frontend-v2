"use client";

import { SankeyChart, type ChartProps } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";

type FluentSankeyChartCardProps = {
  title: string;
  description?: string;
  data: ChartProps;
  height?: number;
  isLoading?: boolean;
  className?: string;
};

function SankeyChartInner({
  data,
  width,
  height,
}: {
  data: ChartProps;
  width?: number;
  height?: number;
}) {
  return <SankeyChart data={data} width={width} height={height} />;
}

export default function FluentSankeyChartCard({
  title,
  description,
  data,
  height = 500,
  isLoading = false,
  className,
}: FluentSankeyChartCardProps) {
  return (
    <FluentChartCard
      title={title}
      description={description}
      height={height}
      isLoading={isLoading}
      className={className}
    >
      <SankeyChartInner data={data} />
    </FluentChartCard>
  );
}
