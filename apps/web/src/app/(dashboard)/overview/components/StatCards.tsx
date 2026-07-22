"use client";

import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Card from "@/components/ui/Card";
import StatCardsSkeleton from "@/components/ui/skeletons/StatCardsSkeleton";
import FramerCountUp from "@/components/ui/FramerCountUp";
import { statCardsData } from "../data";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLiveDsaWalletData } from "@/hooks/useLiveDsaWalletData";
import { getDashboardStatCards } from "@/lib/liveWalletData";

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
    const live = useLiveDsaWalletData();

    const cards = useMemo(() => {
        const liveCards = getDashboardStatCards(
            live.activeDsa,
            live.platformStatus,
            live.isPlatformOwner,
            live.isLive
        );
        return liveCards ?? statCardsData;
    }, [
        live.activeDsa,
        live.platformStatus,
        live.isPlatformOwner,
        live.isLive,
    ]);

    const loading = isLoading || (live.isConnected && live.isLoading);

    if (loading) {
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
            {cards.map((stat) => (
                <motion.div key={stat.id} variants={itemVariants}>
                    <Card
                        title={stat.title}
                        value={
                            <FramerCountUp
                                to={stat.value}
                                prefix={stat.valuePrefix}
                                suffix={stat.valueSuffix}
                                decimals={live.isLive ? 4 : undefined}
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
