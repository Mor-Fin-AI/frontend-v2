"use client";

import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import FluentChartCard from "@/components/ui/charts/FluentChartCard";
import { useFluentThemeColors } from "@/hooks/useFluentThemeColors";
import { CHART_COLORS } from "@/lib/chartColors";
import {
  AREA_GRADIENT_BOTTOM_OPACITY,
  AREA_GRADIENT_TOP_OPACITY,
  areaFillGradientId,
} from "@/lib/chartGradients";
import { ARBITRAGE_PAIR_CHART_HEIGHT } from "../chartLayout";
import { arbitrageHourlyTrades } from "../data";

const GRADIENT_PREFIX = "trade-sparkline";

const chartData = arbitrageHourlyTrades.map((row) => ({
  hour: row.hour,
  trades: row.trades,
}));

function TradeSparklineInner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  const theme = useFluentThemeColors();

  if (!width || !height) {
    return null;
  }

  return (
    <AreaChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
    >
      <defs>
        <linearGradient
          id={areaFillGradientId(GRADIENT_PREFIX, "trades")}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={CHART_COLORS.green}
            stopOpacity={AREA_GRADIENT_TOP_OPACITY}
          />
          <stop
            offset="100%"
            stopColor={CHART_COLORS.green}
            stopOpacity={AREA_GRADIENT_BOTTOM_OPACITY}
          />
        </linearGradient>
      </defs>
      <XAxis
        dataKey="hour"
        axisLine={false}
        tickLine={false}
        tick={{
          fill: theme.colorNeutralForeground3,
          fontSize: 10,
          fontFamily: "Inter",
        }}
        interval="preserveStartEnd"
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        width={32}
        tick={{
          fill: theme.colorNeutralForeground3,
          fontSize: 10,
          fontFamily: "Inter",
        }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: theme.colorNeutralBackground2,
          borderColor: theme.colorNeutralStroke2,
          borderRadius: "8px",
          color: theme.colorNeutralForeground1,
        }}
        labelFormatter={(label) => `Hour ${label}`}
        formatter={(value) => [`${value} trades`, "Trades"]}
      />
      <Area
        type="monotone"
        dataKey="trades"
        stroke={CHART_COLORS.green}
        strokeWidth={2}
        fill={`url(#${areaFillGradientId(GRADIENT_PREFIX, "trades")})`}
        dot={false}
        activeDot={{ r: 4, fill: CHART_COLORS.green }}
      />
    </AreaChart>
  );
}

export default function TradeSparklineChart() {
  return (
    <FluentChartCard
      title="Intraday Trade Throughput"
      description="Executions by hour across monitored pairs"
      height={ARBITRAGE_PAIR_CHART_HEIGHT}
      className="h-full"
    >
      <TradeSparklineInner />
    </FluentChartCard>
  );
}
