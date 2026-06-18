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
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFluentThemeColors } from "@/hooks/useFluentThemeColors";
import { CHART_COLORS } from "@/lib/chartColors";
import {
  AREA_GRADIENT_BOTTOM_OPACITY,
  AREA_GRADIENT_TOP_OPACITY,
  areaFillGradientId,
} from "@/lib/chartGradients";
import { treasuryBalanceTrend } from "../treasuryData";

const CHART_HEIGHT = 340;
const GRADIENT_PREFIX = "treasury-balance";

const variants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const chartData = treasuryBalanceTrend.map((row) => ({
  month: row.month,
  balance: row.balance / 1000,
  fees: row.fees / 1000,
  recycled: row.recycled / 1000,
}));

const series = [
  { key: "balance", name: "Treasury Balance", color: CHART_COLORS.green },
  { key: "fees", name: "Fees Collected", color: CHART_COLORS.blue },
  { key: "recycled", name: "Capital Recycled", color: CHART_COLORS.amber },
] as const;

export default function TreasuryBalanceChart({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const theme = useFluentThemeColors();
  const { ref, controls } = useScrollAnimation();

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
          title="Treasury Balance Over Time"
          description="6-month liquidity, fee inflows, and capital recycling"
        />

        <PanelCardBody>
          {isLoading ? (
            <ChartSkeleton
              minHeight={CHART_HEIGHT}
              aria-label="Loading treasury balance chart"
            />
          ) : (
            <div
              className="w-full min-w-0 focus:outline-none [&_*]:focus:outline-none"
              style={{ height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}
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
                    dataKey="month"
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
                      `$${value.toFixed(0)}K`,
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
                      type="monotone"
                      dataKey={item.key}
                      name={item.name}
                      stroke={item.color}
                      strokeWidth={2}
                      fill={`url(#${areaFillGradientId(GRADIENT_PREFIX, item.key)})`}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
