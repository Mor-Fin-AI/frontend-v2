"use client";

import { useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export const useScrollAnimation = (threshold = 0.1) => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: threshold });

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [controls, isInView]);

    return { ref, controls };
};
