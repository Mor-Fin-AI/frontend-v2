'use client';

import RewardEarningsChart from './RewardEarningsChart';
import MilestonesList from './MilestonesList';
import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function ActivityOverview() {
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="grid grid-cols-1 md:grid-cols-12 items-stretch gap-4"
    >
      <div className="md:col-span-6 h-full">
        <RewardEarningsChart />
      </div>
      <div className="md:col-span-6 h-full">
        <MilestonesList />
      </div>
    </motion.div>
  );
}
