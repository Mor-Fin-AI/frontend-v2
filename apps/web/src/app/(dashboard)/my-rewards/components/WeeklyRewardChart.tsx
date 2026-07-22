"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { weeklyRewardData } from "../data";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import PanelCard, { PanelCardBody, PanelCardHeader } from "@/components/ui/PanelCard";
import { useFluentThemeColors } from "@/hooks/useFluentThemeColors";

type WeeklyRewardChartProps = {
  isLoading?: boolean;
};

export default function WeeklyRewardChart({ isLoading = false }: WeeklyRewardChartProps) {
  const theme = useFluentThemeColors();

  return (
    <PanelCard className="h-full" aria-busy={isLoading}>
      <PanelCardHeader
        title="Weekly Learning Activity Breakdown"
        description="Modules, achievements, and participation"
      />
      <PanelCardBody className="flex-1">
        {isLoading ? (
          <ChartSkeleton minHeight={320} aria-label="Loading weekly activity chart" />
        ) : (
        <div className="min-h-[320px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%" minHeight={320}>
            <BarChart
              data={weeklyRewardData}
              margin={{ top: 50, right: 0, left: -12, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={theme.colorNeutralStroke2}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.colorNeutralForeground3, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.colorNeutralForeground3, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colorNeutralBackground2,
                  borderColor: theme.colorNeutralStroke2,
                  borderRadius: "8px",
                  color: theme.colorNeutralForeground1,
                }}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                verticalAlign="bottom"
                height={20}
                content={(props: { payload?: Array<{ color?: string; value?: string }> }) => {
                  const { payload } = props;
                  return (
                    <div className="mt-2 flex w-full flex-row items-center justify-center gap-2 md:gap-4">
                      {payload?.map((entry, index) => (
                        <div
                          key={`item-${index}`}
                          className="flex flex-row items-center gap-2"
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs font-medium capitalize text-foreground md:text-sm">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="learningModules"
                name="Learning Modules"
                stackId="a"
                fill="#22C38E"
                barSize={60}
              />
              <Bar
                dataKey="achievements"
                name="Achievements"
                stackId="a"
                fill="#8C47D1"
              />
              <Bar
                dataKey="communityParticipation"
                name="Community Participation"
                stackId="a"
                fill="#30ABE8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
