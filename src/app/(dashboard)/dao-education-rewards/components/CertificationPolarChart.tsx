"use client";

import { PolarChart, type AreaPolarSeries } from "@fluentui/react-charts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { certificationPolarData } from "../data";

const polarSeries: AreaPolarSeries[] = [
  {
    type: "areapolar",
    legend: "Certifications",
    color: CHART_COLORS.violet,
    data: certificationPolarData.map((row) => ({
      r: row.count,
      theta: row.category,
      radialAxisCalloutData: `${row.count} certs`,
    })),
  },
];

function CertPolarInner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <PolarChart
      data={polarSeries}
      width={width}
      height={height}
      shape="polygon"
      hideLegend={false}
    />
  );
}

export default function CertificationPolarChart() {
  return (
    <FluentChartCard
      title="Certification Categories"
      description="Distribution of issued certifications by program type"
      height={340}
    >
      <CertPolarInner />
    </FluentChartCard>
  );
}
