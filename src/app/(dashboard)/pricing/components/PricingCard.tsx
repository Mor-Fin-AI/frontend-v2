'use client';

import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { PricingTier } from '../data';
import { FeatureItem } from './FeatureItem';
import { ArrowRight, TrendingUp } from 'lucide-react';

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
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
      className="relative flex flex-col rounded-2xl border border-[#FFFFFF33] bg-[#1E1B2E4D] p-6 overflow-hidden
                 hover:border-white/20 transition-colors duration-300 group"
      style={{ boxShadow: `0 0 0px 0 ${tier.accentColor}18` }}>
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -top-26 right-46 w-46 h-36 rounded-full opacity-20 blur-3xl
                   group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: tier.accentColor }}
      />
      {/* Badge + icon */}
      <div className="flex flex-col gap-4 w-full mb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-3">
            <span
              className={`flex items-center gap-2 text-[10px] font-medium uppercase px-2 py-1 rounded-full border
                ${tier.badgeBg} ${tier.badgeText}`}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: tier.accentColor,
                boxShadow: `0 0 8px ${tier.accentColor}`,
              }}
            />
              {tier.badge}
            </span>
            {/* Title */}
            <h2 className="text-[28px] md:text-[38px] leading-[1.2] font-bold text-white">
              {tier.label}
            </h2>
          </div>

          <div
            className="flex items-center justify-center rounded-xl border shrink-0"
            style={{
              width: '60px',
              height: '60px',
              background: `${tier.accentColor}1A`,
              borderColor: tier.accentColor,
            }}>
            <div className="w-8 h-8 flex items-center justify-center">
              {typeof tier.icon === 'string' ? (
                tier.icon
              ) : (
                <tier.icon size={32} strokeWidth={1.5} color={tier.accentColor} />
              )}
            </div>
          </div>
        </div>

        <p className="text-sm leading-6 text-[#7880A4] max-w-120">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="flex items-end  mb-2">
        <span className="text-5xl md:text-7xl font-extrabold" style={{ color: tier.accentColor }}>
          ${tier.price}
        </span>
        <span className="text-[#7880A4] text-sm">{tier.priceSuffix}</span>
      </div>

      {/* Highlight */}
      <p
        className={`text-xs font-medium py-2 px-3 mb-7 flex items-center rounded-[10px] gap-1 max-w-64 ${tier.highlightColor}`}
        style={{ background: `${tier.accentColor}1A` }}>
        <span><TrendingUp size={16} /></span>
        {tier.highlight}
      </p>

      {/* Divider */}
      <div className="border-t border-[#3C2F58] mb-7" />

      {/* Features section label */}
      <p className="text-[10px] font-inter font-medium uppercase leading-5 text-[#7880A4] mb-4">
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
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; 
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =`${tier.accentColor}18` ;
        }}>
        {tier.ctaLabel} <ArrowRight size={16} />
      </a>
    </motion.div>
  );
}
