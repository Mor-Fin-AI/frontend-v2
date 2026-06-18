"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ResponsiveContainer,
  type ResponsiveChildProps,
} from "@fluentui/react-charts";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import ChartSkeleton from "@/components/ui/skeletons/ChartSkeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { mergeClasses } from "@fluentui/react-components";

const variants: Variants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

interface FluentChartCardProps {
  title: string;
  description?: string;
  height?: number;
  isLoading?: boolean;
  children: React.ReactElement<ResponsiveChildProps>;
  className?: string;
  animate?: boolean;
}

export default function FluentChartCard({
  title,
  description,
  height = 320,
  isLoading = false,
  children,
  className,
  animate = true,
}: FluentChartCardProps) {
  const { ref, controls } = useScrollAnimation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = chartContainerRef.current;
    if (!element) return;

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setChartSize({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [height]);

  const canRenderChart = chartSize.width >= 120 && chartSize.height >= 120;

  const content = (
    <PanelCard
      aria-busy={isLoading}
      className={mergeClasses(
        className,
        className?.includes("h-full") && "flex h-full min-h-0 flex-col"
      )}
    >
      <PanelCardHeader
        title={title}
        description={description}
        className={className?.includes("h-full") ? "min-h-[4.75rem]" : undefined}
      />

      <PanelCardBody className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <ChartSkeleton minHeight={height} aria-label={`Loading ${title}`} />
        ) : (
          <>
            <div
              ref={chartContainerRef}
              className="w-full min-w-0 shrink-0 focus:outline-none [&_*]:focus:outline-none"
              style={{ height, minHeight: height }}
            >
              {canRenderChart ? (
                <ResponsiveContainer
                  width={Math.max(chartSize.width, 120)}
                  height={Math.max(chartSize.height, 120)}
                >
                  {React.cloneElement(children, {
                    width: Math.max(chartSize.width, 120),
                    height: Math.max(chartSize.height, 120),
                  })}
                </ResponsiveContainer>
              ) : (
                <ChartSkeleton minHeight={height} aria-label={`Loading ${title}`} />
              )}
            </div>
            {className?.includes("h-full") ? (
              <div className="min-h-0 flex-1" aria-hidden />
            ) : null}
          </>
        )}
      </PanelCardBody>
    </PanelCard>
  );

  if (!animate) {
    return (
      <div className={mergeClasses(className?.includes("h-full") && "h-full min-h-0")}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="h-full min-h-0"
    >
      {content}
    </motion.div>
  );
}
