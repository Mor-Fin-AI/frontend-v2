"use client";

import { motion, type Variants } from "framer-motion";
import StatCardsSkeleton from "@/components/ui/skeletons/StatCardsSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const statCardsContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const statCardItemVariants: Variants = {
  hidden: { opacity: 1, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

type DashboardStatCardsGridProps = {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingLabel?: string;
};

function AnimatedStatCardsGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      variants={statCardsContainerVariants}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardStatCardsGrid({
  children,
  className = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  isLoading = false,
  loadingLabel = "Loading metrics",
}: DashboardStatCardsGridProps) {
  if (isLoading) {
    return <StatCardsSkeleton aria-label={loadingLabel} />;
  }

  return (
    <AnimatedStatCardsGrid className={className}>{children}</AnimatedStatCardsGrid>
  );
}
