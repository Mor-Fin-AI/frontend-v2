'use client';

import Card from '@/components/ui/Card';
import StatCardsSkeleton from '@/components/ui/skeletons/StatCardsSkeleton';
import { auditStats } from '../data';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AuditStats({ isLoading = false }: { isLoading?: boolean }) {
    if (isLoading) {
        return <StatCardsSkeleton aria-label="Loading audit stats" />;
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
            {auditStats.map((stat, index) => (
                <motion.div key={index} variants={item}>
                    <Card
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        prefix={stat.prefix}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
