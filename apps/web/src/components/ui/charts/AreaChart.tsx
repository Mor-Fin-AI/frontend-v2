"use client";

import { useId } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useFluentThemeColors } from "@/hooks/useFluentThemeColors";
import {
  AREA_GRADIENT_BOTTOM_OPACITY,
  AREA_GRADIENT_TOP_OPACITY,
} from "@/lib/chartGradients";

interface AreaChartProps {
  data: object[];
  xKey: string;
  yKey: string;
  height?: number | string;
  color?: string;
}

export default function AreaChart({
  data,
  xKey,
  yKey,
  height = 300,
  color = "#22D3EE",
}: AreaChartProps) {
  const theme = useFluentThemeColors();
  const gradientId = useId().replace(/:/g, "");

  return (
    <div
      className="w-full focus:outline-none [&_*]:focus:outline-none"
      style={{ height: typeof height === "number" ? height : undefined }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={AREA_GRADIENT_TOP_OPACITY}
              />
              <stop
                offset="100%"
                stopColor={color}
                stopOpacity={AREA_GRADIENT_BOTTOM_OPACITY}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colorNeutralStroke2}
            vertical
            horizontal
          />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: theme.colorNeutralForeground3, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: theme.colorNeutralForeground3, fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.colorNeutralBackground2,
              border: `1px solid ${theme.colorNeutralStroke2}`,
              borderRadius: "8px",
              color: theme.colorNeutralForeground1,
            }}
            itemStyle={{ color }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
