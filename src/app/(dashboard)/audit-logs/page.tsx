'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AuditStats from './components/AuditStats';
import EventLog from './components/EventLog';

const fadeUp = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function AuditLogsPage() {
    const { ref: statsRef,    controls: statsControls    } = useScrollAnimation();
    const { ref: logRef,      controls: logControls      } = useScrollAnimation();

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
                <AuditStats />
            </motion.div>

            {/* Event Log */}
            <motion.div
                ref={logRef}
                initial="hidden"
                animate={logControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <EventLog />
            </motion.div>
        </div>
    );
}