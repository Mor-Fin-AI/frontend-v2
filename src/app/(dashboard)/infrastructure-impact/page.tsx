'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import ImpactStats from './components/ImpactStats';
import ActivityChart from './components/ActivityChart';
import ProjectsTable from './components/ProjectsTable';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function InfrastructureImpactPage() {
    const { ref: statsRef,  controls: statsControls  } = useScrollAnimation();
    const { ref: chartRef,  controls: chartControls  } = useScrollAnimation();
    const { ref: tableRef,  controls: tableControls  } = useScrollAnimation();

    return (
        <div className="flex flex-col gap-6">
            {/* Stat Cards */}
            <motion.div
                ref={statsRef}
                initial="hidden"
                animate={statsControls}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
            >
                <ImpactStats />
            </motion.div>

            {/* Activity Chart */}
            <motion.div
                ref={chartRef}
                initial="hidden"
                animate={chartControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <ActivityChart />
            </motion.div>

            {/* Projects Table */}
            <motion.div
                ref={tableRef}
                initial="hidden"
                animate={tableControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.25 }}
            >
                <ProjectsTable />
            </motion.div>
        </div>
    );
}