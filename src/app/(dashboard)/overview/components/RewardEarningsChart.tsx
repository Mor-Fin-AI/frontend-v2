"use client";

import AreaChart from "@/components/ui/charts/AreaChart";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardHeaderMeta,
} from "@/components/ui/PanelCard";
import { rewardEarningsData } from "../data";

type RewardEarningsChartProps = {
  isLoading?: boolean;
};

export default function RewardEarningsChart({ isLoading = false }: RewardEarningsChartProps) {
  return (
    <PanelCard className="h-full" aria-busy={isLoading}>
      <PanelCardHeader
        title="Learning Activity"
        description="Last 7 days"
        action={<PanelCardHeaderMeta>Updated live</PanelCardHeaderMeta>}
      />
      <PanelCardBody className="flex-1">
        {isLoading ? (
          <ChartSkeleton minHeight={363} showLegend={false} aria-label="Loading learning activity chart" />
        ) : (
          <AreaChart
            data={rewardEarningsData}
            xKey="day"
            yKey="count"
            height={363}
            color="#22D3EE"
          />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
