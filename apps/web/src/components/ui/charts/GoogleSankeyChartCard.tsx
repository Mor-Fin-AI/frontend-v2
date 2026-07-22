"use client";

import { useMemo } from "react";
import { Chart } from "react-google-charts";
import { motion, type Variants } from "framer-motion";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTheme } from "@/context/ThemeContext";
import { GOOGLE_CHART_VERSION, GOOGLE_SANKEY_CHART_PACKAGES } from "@/lib/googleCharts";
import { buildSankeyOptions } from "@/lib/sankeyChart";

const variants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

type GoogleSankeyChartCardProps = {
  title: string;
  description?: string;
  data: (string | number)[][];
  height?: number;
  isLoading?: boolean;
  options?: Record<string, unknown>;
};

export default function GoogleSankeyChartCard({
  title,
  description,
  data,
  height = 500,
  isLoading = false,
  options,
}: GoogleSankeyChartCardProps) {
  const { isDark } = useTheme();
  const { ref, controls } = useScrollAnimation();

  const chartOptions = useMemo(
    () => ({
      ...buildSankeyOptions(isDark),
      ...options,
    }),
    [isDark, options]
  );

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="h-full"
    >
      <PanelCard aria-busy={isLoading}>
        <PanelCardHeader title={title} description={description} />

        <PanelCardBody className="flex-1">
          {isLoading ? (
            <ChartSkeleton minHeight={height} aria-label={`Loading ${title}`} />
          ) : (
            <div
              className="w-full min-w-0 overflow-hidden rounded-xl"
              style={{ height, minHeight: height }}
            >
              <Chart
                chartType="Sankey"
                width="100%"
                height={`${height}px`}
                data={data}
                options={chartOptions}
                chartVersion={GOOGLE_CHART_VERSION}
                chartPackages={[...GOOGLE_SANKEY_CHART_PACKAGES]}
                loader={
                  <ChartSkeleton minHeight={height} aria-label={`Loading ${title}`} />
                }
              />
            </div>
          )}
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
