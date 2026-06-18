"use client";

import { useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export const useScrollAnimation = (threshold = 0.1) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  useEffect(() => {
    if (isInView) {
      void controls.start("visible");
      return;
    }

    const timer = window.setTimeout(() => {
      void controls.start("visible");
    }, 150);

    return () => window.clearTimeout(timer);
  }, [controls, isInView]);

  return { ref, controls };
};
