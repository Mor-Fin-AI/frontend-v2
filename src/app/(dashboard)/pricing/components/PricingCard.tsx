"use client";

import { motion, Variants } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import type { PricingTier } from "../data";
import { FeatureItem } from "./FeatureItem";

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function PricingCard({ tier }: { tier: PricingTier }) {
  const { ref, controls } = useScrollAnimation(0.15);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={cardVariant}
      className="relative flex flex-col rounded-2xl border border-white/10 bg-[#0d1117] p-7 overflow-hidden
                 hover:border-white/20 transition-colors duration-300 group"
      style={{ boxShadow: `0 0 40px 0 ${tier.accentColor}18` }}
    >

      <div
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 blur-3xl
                   group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: tier.accentColor }}
      />

      {/* Badge + icon */}
      <div className="flex items-center justify-between mb-5">
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full
                      ${tier.badgeBg} ${tier.badgeText}`}
        >
          • {tier.badge}
        </span>
        <div
          className="w-9 h-9 flex items-center justify-center rounded-lg text-lg"
          style={{ background: `${tier.accentColor}22` }}
        >
          {tier.icon}
        </div>
      </div>

      {/* Title + description */}
      <h2 className="text-3xl font-bold text-white mb-2">{tier.label}</h2>
      <p className="text-sm text-white/50 mb-6 leading-relaxed">{tier.description}</p>

      {/* Price */}
      <div className="flex items-end gap-1 mb-2">
        <span className="text-5xl font-extrabold" style={{ color: tier.accentColor }}>
          ${tier.price}
        </span>
        <span className="text-white/40 mb-2 text-sm">{tier.priceSuffix}</span>
      </div>

      {/* Highlight */}
      <p className={`text-xs font-medium mb-6 flex items-center gap-1 ${tier.highlightColor}`}>
        <span>↑</span>
        {tier.highlight}
      </p>

      {/* Divider */}
      <div className="border-t border-white/10 mb-5" />

      {/* Features section label */}
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">
        {tier.sectionLabel}
      </p>

      {/* Features */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-8 flex-1">
        {tier.features.map((f) => (
          <FeatureItem key={f.text} text={f.text} accentColor={tier.accentColor} />
        ))}
      </ul>

      {/* CTA */}
      <a
        href={tier.ctaHref}
        className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold
                   border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-auto"
        style={{
          borderColor: tier.accentColor,
          color: tier.accentColor,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = `${tier.accentColor}18`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        {tier.ctaLabel} →
      </a>
    </motion.div>
  );
}
