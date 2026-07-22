"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import StatCardsSkeleton from "@/components/ui/skeletons/StatCardsSkeleton";
import FramerCountUp from "@/components/ui/FramerCountUp";
import { governanceStats } from "../data";
import { motion } from "framer-motion";
import {
  useGovernanceStatus,
  useWalletGovernanceStats,
} from "@/hooks/useGovernance";
import { useAccount } from "wagmi";
import {
  DocumentText24Regular,
  DocumentBulletList24Regular,
  Vote24Regular,
  ArrowTrending24Regular,
} from "@fluentui/react-icons";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function GovernanceStats({ isLoading = false }: { isLoading?: boolean }) {
  const { isConnected } = useAccount();
  const statusQuery = useGovernanceStatus();
  const walletStatsQuery = useWalletGovernanceStats();

  const stats = useMemo(() => {
    const status = statusQuery.data;
    const wallet = walletStatsQuery.data;

    if (!status) {
      return governanceStats;
    }

    return [
      {
        title: "Active Proposals",
        value: status.activeProposals,
        subtitle: "On-chain voting open",
        icon: DocumentText24Regular,
        iconBg: "bg-[#22C38E1A]",
        iconColor: "text-[#22C38E]",
        valueColor: "text-[#22C38E]",
      },
      {
        title: "Total Proposals",
        value: status.totalProposals,
        subtitle: "MorGovernor on Arbitrum",
        icon: DocumentBulletList24Regular,
        iconBg: "bg-[#8547D11A]",
        iconColor: "text-[#8C47D1]",
        valueColor: "text-[#8C47D1]",
      },
      {
        title: "Your Votes Cast",
        value: isConnected ? (wallet?.votesCast ?? 0) : "—",
        subtitle: isConnected ? "From connected wallet" : "Connect wallet",
        icon: Vote24Regular,
        iconBg: "bg-[#30ABE81A]",
        iconColor: "text-[#30ABE8]",
        valueColor: "text-[#30ABE8]",
      },
      {
        title: "Voting Power",
        value: isConnected && wallet ? Number(wallet.votingPower).toFixed(2) : "—",
        valueSuffix: isConnected && wallet ? " MOR" : undefined,
        subtitle: `Threshold ${status.proposalThresholdFormatted} MOR`,
        icon: ArrowTrending24Regular,
        iconBg: "bg-[#F69E231A]",
        iconColor: "text-[#F69E23]",
        valueColor: "text-[#F69E23]",
      },
    ];
  }, [statusQuery.data, walletStatsQuery.data, isConnected]);

  const loading =
    isLoading || statusQuery.isLoading || (isConnected && walletStatsQuery.isLoading);

  if (loading) {
    return <StatCardsSkeleton aria-label="Loading governance stats" />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div key={stat.title} variants={item}>
          <Card
            title={stat.title}
            value={
              typeof stat.value === "number" ? (
                <FramerCountUp
                  to={stat.value}
                  suffix={"valueSuffix" in stat ? stat.valueSuffix : undefined}
                  decimals={
                    stat.title === "Voting Power" && typeof stat.value === "number"
                      ? 2
                      : undefined
                  }
                />
              ) : (
                stat.value
              )
            }
            subtitle={stat.subtitle}
            icon={stat.icon}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
