"use client";

import {
  type RefObject,
  type ReactNode,
  type SVGProps,
  useState,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { cn } from "@/lib/utils";

type StickyBannerProps = {
  className?: string;
  children: ReactNode;
  hideOnScroll?: boolean;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

export function StickyBanner({
  className,
  children,
  hideOnScroll = false,
  scrollContainerRef,
}: StickyBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(true);
  const { scrollY } = useScroll(
    scrollContainerRef ? { container: scrollContainerRef } : undefined
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hideOnScroll || dismissed) return;

    if (latest > 40) {
      setScrollOpen(false);
    } else {
      setScrollOpen(true);
    }
  });

  const isOpen = !dismissed && (!hideOnScroll || scrollOpen);

  if (dismissed) {
    return null;
  }

  return (
    <motion.div
      className="overflow-hidden"
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        className={cn(
          "relative z-50 flex min-h-11 w-full shrink-0 items-center justify-center",
          "border-b border-primary-foreground/15 px-10 py-2",
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
          "bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_oklch,var(--primary)_82%,var(--sidebar-primary))_55%,var(--primary)_100%)]",
          className
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isOpen ? 0 : -100,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-center px-8 text-center">
        {children}
      </div>

      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        aria-label="Dismiss banner"
        className={cn(
          "absolute top-1/2 right-3 z-20 -translate-y-1/2 cursor-pointer rounded-md p-1",
          "text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        )}
        onClick={() => setDismissed(true)}
      >
        <CloseIcon className="h-4 w-4" />
      </motion.button>
      </motion.div>
    </motion.div>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
