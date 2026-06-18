"use client";

import { useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import { motion, type Variants } from "framer-motion";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTheme } from "@/context/ThemeContext";
import {
  getGoogleMapsApiKey,
  GOOGLE_CHART_VERSION,
  GOOGLE_GEO_CHART_PACKAGES,
} from "@/lib/googleCharts";
import {
  buildEastAfricaGeoData,
  buildRegionalGeoMarkerData,
  infrastructureDeploymentMetrics,
} from "../data";

const variants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const CHART_HEIGHT = 400;

export default function RegionalProgressGeoChart({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const { isDark } = useTheme();
  const { ref, controls } = useScrollAnimation();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const mapsApiKey = getGoogleMapsApiKey();

  const markerData = useMemo(
    () => buildRegionalGeoMarkerData(infrastructureDeploymentMetrics.regionalProgress),
    []
  );

  const africaData = useMemo(
    () => buildEastAfricaGeoData(infrastructureDeploymentMetrics.regionalProgress),
    []
  );

  const markerOptions = useMemo(
    () => ({
      region: "KE",
      displayMode: "markers" as const,
      colorAxis: {
        colors: ["#E8E8E8", "#F69E23", "#22C38E"],
        minValue: 0,
        maxValue: 100,
      },
      backgroundColor: isDark ? "#1e1b2e" : "#ffffff",
      datalessRegionColor: isDark ? "#2a2540" : "#f1eff8",
      defaultColor: isDark ? "#2a2540" : "#f5f5f5",
      legend: "none" as const,
      tooltip: { trigger: "focus" as const },
    }),
    [isDark]
  );

  const africaOptions = useMemo(
    () => ({
      region: "002",
      colorAxis: {
        colors: ["#00853f", isDark ? "#12101c" : "#374151", "#e31b23"],
        minValue: 0,
        maxValue: 100,
      },
      backgroundColor: isDark ? "#1e1b2e" : "#ffffff",
      datalessRegionColor: isDark ? "#2a2540" : "#f8bbd0",
      defaultColor: isDark ? "#2a2540" : "#f5f5f5",
      legend: { textStyle: { color: isDark ? "#f3f4f6" : "#12101c" } },
    }),
    [isDark]
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
        <PanelCardHeader
          title="Regional Progress Map"
          description="Deployment completion across Mombasa zones and East Africa context"
        />

        <PanelCardBody className="gap-6">
          {isLoading ? (
            <ChartSkeleton
              minHeight={CHART_HEIGHT}
              aria-label="Loading regional progress map"
            />
          ) : !mapsApiKey ? (
            <div
              className="flex min-h-[200px] w-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center"
              role="status"
            >
              <p className="max-w-md text-sm text-muted-foreground">
                Set{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  VITE_GOOGLE_MAPS_API_KEY
                </code>{" "}
                in your environment to load the regional progress map. Enable the
                Maps JavaScript API and Geocoding API for your Google Cloud project.
              </p>
            </div>
          ) : (
            <>
              <div
                className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)]"
                style={{ height: CHART_HEIGHT }}
              >
                <Chart
                  chartType="GeoChart"
                  width="100%"
                  height={`${CHART_HEIGHT}px`}
                  data={markerData}
                  options={markerOptions}
                  mapsApiKey={mapsApiKey}
                  chartVersion={GOOGLE_CHART_VERSION}
                  chartPackages={[...GOOGLE_GEO_CHART_PACKAGES]}
                  chartEvents={[
                    {
                      eventName: "select",
                      callback: ({ chartWrapper }) => {
                        if (!chartWrapper) return;

                        const chart = chartWrapper.getChart();
                        const selection = chart.getSelection();
                        if (selection.length === 0) {
                          setSelectedRegion(null);
                          return;
                        }

                        const row = markerData[selection[0].row + 1];
                        if (Array.isArray(row) && typeof row[2] === "string") {
                          setSelectedRegion(row[2]);
                        }
                      },
                    },
                  ]}
                />
              </div>

              <div
                className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)]"
                style={{ height: CHART_HEIGHT }}
              >
                <Chart
                  chartType="GeoChart"
                  width="100%"
                  height={`${CHART_HEIGHT}px`}
                  data={africaData}
                  options={africaOptions}
                  mapsApiKey={mapsApiKey}
                  chartVersion={GOOGLE_CHART_VERSION}
                  chartPackages={[...GOOGLE_GEO_CHART_PACKAGES]}
                />
              </div>

              {selectedRegion ? (
                <p className="text-sm text-muted-foreground">
                  Selected zone:{" "}
                  <span className="font-medium text-foreground">{selectedRegion}</span>
                </p>
              ) : null}
            </>
          )}
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
