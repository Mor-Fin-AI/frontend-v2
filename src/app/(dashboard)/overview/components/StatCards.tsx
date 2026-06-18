"use client";

import { motion, Variants } from "framer-motion";
import Card from "@/components/ui/Card";
import StatCardsSkeleton from "@/components/ui/skeletons/StatCardsSkeleton";
import FramerCountUp from "@/components/ui/FramerCountUp";
import { statCardsData } from "../data";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

export default function StatCards({ isLoading = false }: { isLoading?: boolean }) {
    const { ref } = useScrollAnimation();

    if (isLoading) {
        return <StatCardsSkeleton aria-label="Loading overview stats" />;
    }

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 "
        >
            {statCardsData.map((stat) => (
                <motion.div key={stat.id} variants={itemVariants}>
                    <Card
                        title={stat.title}
                        value={
                            <FramerCountUp
                                to={stat.value}
                                prefix={stat.valuePrefix}
                                suffix={stat.valueSuffix}
                            />
                        }
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        className="h-full"
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
