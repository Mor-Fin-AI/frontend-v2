"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, type Variants } from "framer-motion";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFluentThemeColors } from "@/hooks/useFluentThemeColors";
import { CHART_COLORS } from "@/lib/chartColors";
import {
  AREA_GRADIENT_BOTTOM_OPACITY,
  AREA_GRADIENT_TOP_OPACITY,
  areaFillGradientId,
} from "@/lib/chartGradients";
import { FEE_PAIR_CHART_HEIGHT } from "../chartLayout";
import { feeVolumeTrend } from "../data";
const GRADIENT_PREFIX = "fee-volume";

const variants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const chartData = feeVolumeTrend.map((row) => ({
  day: row.day,
  volume: row.volume / 1000,
  fees: row.fees / 1000,
}));

const series = [
  { key: "volume", name: "Volume (USD K)", color: CHART_COLORS.blue, stepped: false },
  { key: "fees", name: "Fees (USD K)", color: CHART_COLORS.green, stepped: true },
] as const;

export default function FeeVolumeAreaChart() {
  const theme = useFluentThemeColors();
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="h-full min-h-0"
    >
      <PanelCard className="flex h-full min-h-0 flex-col">
        <PanelCardHeader
          title="Weekly Volume & Fee Capture"
          description="Positive volume captured with stepped 1% fee accrual"
          className="min-h-[4.75rem]"
        />

        <PanelCardBody className="flex min-h-0 flex-1 flex-col">
          <div
            className="w-full min-w-0 shrink-0 focus:outline-none [&_*]:focus:outline-none"
            style={{ height: FEE_PAIR_CHART_HEIGHT, minHeight: FEE_PAIR_CHART_HEIGHT }}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  {series.map((item) => (
                    <linearGradient
                      key={item.key}
                      id={areaFillGradientId(GRADIENT_PREFIX, item.key)}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={item.color}
                        stopOpacity={AREA_GRADIENT_TOP_OPACITY}
                      />
                      <stop
                        offset="100%"
                        stopColor={item.color}
                        stopOpacity={AREA_GRADIENT_BOTTOM_OPACITY}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme.colorNeutralStroke2}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: theme.colorNeutralForeground3,
                    fontSize: 10,
                    fontFamily: "Inter",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{
                    fill: theme.colorNeutralForeground3,
                    fontSize: 10,
                    fontFamily: "Inter",
                  }}
                  tickFormatter={(value: number) => `$${value}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.colorNeutralBackground2,
                    borderColor: theme.colorNeutralStroke2,
                    borderRadius: "8px",
                    color: theme.colorNeutralForeground1,
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(name.includes("Fees") ? 1 : 0)}K`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                {series.map((item) => (
                  <Area
                    key={item.key}
                    type={item.stepped ? "stepAfter" : "monotone"}
                    dataKey={item.key}
                    name={item.name}
                    stroke={item.color}
                    strokeWidth={2}
                    fill={`url(#${areaFillGradientId(GRADIENT_PREFIX, item.key)})`}
                    dot={false}
                    activeDot={{ r: 4, fill: item.color }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="min-h-0 flex-1" aria-hidden />
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
