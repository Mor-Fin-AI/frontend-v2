'use client';

import React from 'react';
import RewardStats from './components/RewardStats';
import WeeklyRewardChart from './components/WeeklyRewardChart';
import MilestonesSection from './components/MilestonesSection';
import PayoutHistorySection from './components/PayoutHistory';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

export default function MyRewardsPage() {
  const { ref: statsRef, controls: statsControls } = useScrollAnimation();
  const { ref: chartsRef, controls: chartsControls } = useScrollAnimation();
  const { ref: historyRef, controls: historyControls } = useScrollAnimation();

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        ref={statsRef}
        initial="hidden"
        animate={statsControls}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 },
        }}
        transition={{ duration: 0.5 }}>
        <RewardStats />
      </motion.div>

      <motion.div
        ref={chartsRef}
        initial="hidden"
        animate={chartsControls}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 },
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 xl:grid-cols-12  gap-6">
        <div className="xl:col-span-7">
          <WeeklyRewardChart />
        </div>
        <div className="xl:col-span-5">
          <MilestonesSection />
        </div>
      </motion.div>

      <motion.div
        ref={historyRef}
        initial="hidden"
        animate={historyControls}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 },
        }}
        transition={{ duration: 0.5, delay: 0.3 }}>
        <PayoutHistorySection />
      </motion.div>
    </div>
  );
}
