"use client";

import { useMemo } from "react";
import FluentSankeyChartCard from "@/components/ui/charts/FluentSankeyChartCard";
import { toFluentSankeyChartProps } from "@/lib/sankeyChart";
import { treasurySankeyData } from "../treasuryData";

export default function TreasuryFlowSankey({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const data = useMemo(() => toFluentSankeyChartProps(treasurySankeyData), []);

  return (
    <FluentSankeyChartCard
      title="Capital Flow Diagram"
      description="How fees, borrowing, discharge, and recycling move through treasury"
      data={data}
      height={500}
      isLoading={isLoading}
    />
  );
}
