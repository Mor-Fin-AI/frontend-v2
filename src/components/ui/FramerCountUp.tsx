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
    className?: string;
}

export default function FramerCountUp({
    to,
    from = 0,
    duration = 2,
    delay = 0,
    prefix = "",
    suffix = "",
    className = "",
}: FramerCountUpProps) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => {
        return prefix + Math.round(latest).toLocaleString() + suffix;
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
