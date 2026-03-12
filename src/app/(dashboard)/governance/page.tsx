'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import GovernanceStats from './components/GovernanceStats';
import ProposalList from './components/ProposalList';
import { proposals } from './data';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function GovernancePage() {
    const { ref: statsRef,    controls: statsControls    } = useScrollAnimation();
    const { ref: proposalsRef, controls: proposalsControls } = useScrollAnimation();

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
                <GovernanceStats />
            </motion.div>

            {/* Proposals */}
            <motion.div
                ref={proposalsRef}
                initial="hidden"
                animate={proposalsControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <ProposalList proposals={proposals} />
            </motion.div>
        </div>
    );
}