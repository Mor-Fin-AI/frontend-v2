'use client';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import ActivityStats from './components/ActivityStats';
import ActiveTrainings from './components/ActiveTrainings';
import RecentValidations from './components/RecentValidations';
import ParticipationHistory from './components/ParticipationHistory';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function DaoActivitiesPage() {
    const { ref: statsRef,       controls: statsControls }       = useScrollAnimation();
    const { ref: trainingsRef,   controls: trainingsControls }   = useScrollAnimation();
    const { ref: validationsRef, controls: validationsControls } = useScrollAnimation();
    const { ref: historyRef,     controls: historyControls }     = useScrollAnimation();

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
                <ActivityStats />
            </motion.div>

            {/* Active Trainings */}
            <motion.div
                ref={trainingsRef}
                initial="hidden"
                animate={trainingsControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <ActiveTrainings />
            </motion.div>

            {/* Recent Validations */}
            <motion.div
                ref={validationsRef}
                initial="hidden"
                animate={validationsControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <RecentValidations />
            </motion.div>

            {/* Participation History */}
            <motion.div
                ref={historyRef}
                initial="hidden"
                animate={historyControls}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.25 }}
            >
                <ParticipationHistory />
            </motion.div>
        </div>
    );
}