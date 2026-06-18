"use client";

import { useRef } from "react";

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/** Always visible on mount — avoids blank pages after client-side navigation. */
export const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  return { ref, controls: "visible" as const };
};

export const pageEnterMotion = {
  variants: fadeUpVariants,
  initial: "hidden" as const,
  animate: "visible" as const,
};
