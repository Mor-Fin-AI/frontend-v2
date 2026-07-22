"use client";

import { useEffect } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

interface FramerCountUpProps {
    to: number;
    from?: number;
    duration?: number;
    delay?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export default function FramerCountUp({
    to,
    from = 0,
    duration = 2,
    delay = 0,
    prefix = "",
    suffix = "",
    decimals = 0,
    className = "",
}: FramerCountUpProps) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => {
        const formatted =
            decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString();
        return prefix + formatted + suffix;
    });

    useEffect(() => {
        const animation = animate(count, to, {
            duration,
            delay,
            ease: "easeOut",
        });

        return animation.stop;
    }, [count, to, duration, delay]);

    return <motion.span className={className}>{rounded}</motion.span>;
}
