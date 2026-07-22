"use client";

import { useMemo } from "react";
import { Chart } from "react-google-charts";
import { Caption1, mergeClasses } from "@fluentui/react-components";
import { motion, type Variants } from "framer-motion";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTheme } from "@/context/ThemeContext";
import { GOOGLE_CHART_VERSION } from "@/lib/googleCharts";
import {
  buildGoogleGaugeData,
  buildGoogleGaugeOptions,
  type GoogleGaugeOptionsInput,
} from "@/lib/gaugeChart";

const variants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

type GoogleGaugeChartCardProps = {
  title: string;
  description?: string;
  label: string;
  value: number;
  statusLabel?: string;
  height?: number;
  isLoading?: boolean;
  className?: string;
  gaugeOptions?: GoogleGaugeOptionsInput;
};

export default function GoogleGaugeChartCard({
  title,
  description,
  label,
  value,
  statusLabel,
  height = 300,
  isLoading = false,
  className,
  gaugeOptions,
}: GoogleGaugeChartCardProps) {
  const { isDark } = useTheme();
  const { ref, controls } = useScrollAnimation();
  const fillHeight = className?.includes("h-full");
  const statusBandHeight = statusLabel ? 28 : 0;
  const gaugeChartHeight = height - statusBandHeight;

  const data = useMemo(
    () => buildGoogleGaugeData(label, value),
    [label, value]
  );

  const chartOptions = useMemo(
    () =>
      buildGoogleGaugeOptions({
        height: gaugeChartHeight,
        isDark,
        ...gaugeOptions,
      }),
    [gaugeOptions, gaugeChartHeight, isDark]
  );

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className={mergeClasses(fillHeight && "h-full min-h-0")}
    >
      <PanelCard
        aria-busy={isLoading}
        className={mergeClasses(
          className,
          fillHeight && "flex h-full min-h-0 flex-col"
        )}
      >
        <PanelCardHeader
          title={title}
          description={description}
          className={fillHeight ? "min-h-[4.75rem]" : undefined}
        />

        <PanelCardBody
          className={mergeClasses(fillHeight && "flex min-h-0 flex-1 flex-col")}
        >
          {isLoading ? (
            <ChartSkeleton minHeight={height} aria-label={`Loading ${title}`} />
          ) : (
            <>
              <div
                className="flex w-full min-w-0 shrink-0 flex-col overflow-hidden"
                style={{ height, minHeight: height }}
              >
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <Chart
                    chartType="Gauge"
                    width="100%"
                    height={`${gaugeChartHeight}px`}
                    data={data}
                    options={chartOptions}
                    chartVersion={GOOGLE_CHART_VERSION}
                    loader={
                      <ChartSkeleton
                        minHeight={height}
                        aria-label={`Loading ${title}`}
                      />
                    }
                  />
                </div>
                {statusLabel ? (
                  <Caption1 className="shrink-0 pb-1 text-center text-neutral-500">
                    {statusLabel}
                  </Caption1>
                ) : null}
              </div>
              {fillHeight ? <div className="min-h-0 flex-1" aria-hidden /> : null}
            </>
          )}
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
