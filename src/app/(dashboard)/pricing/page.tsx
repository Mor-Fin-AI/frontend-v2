'use client';

import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { pricingStats, pricingTiers } from './data';
import { StatItem } from './components/StatItem';
import { PricingCard } from './components/PricingCard';

// ─── Animation Variants

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Page

export default function PricingPage() {
  const heroAnim = useScrollAnimation(0.1);
  const statsAnim = useScrollAnimation(0.1);

  return (
    <main className="min-h-screen  py-16 sm:py-24">
      {/* Hero */}
      <motion.section
        ref={heroAnim.ref}
        initial="hidden"
        animate={heroAnim.controls}
        variants={stagger}
        className="mx-auto max-w-3xl text-center mb-12 ">
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-medium uppercase leading-4
                     text-[#22C38E] border-[0.3px] border-[#4ADE80] rounded-full px-4 py-2 mb-6 bg-[#22C55E1A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] " />
          Do-Nou Infrastructure · Mombasa · March 2026
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl xl:text-6xl font-normal text-white uppercase leading-14 mb-4">
          Choose Your <span className="text-[#22C38E] font-bold">Membership</span>{' '}
          <span className="text-[#8C47D1] font-bold">Tier</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-[#7880A4] text-sm sm:text-base leading-7">
          Join the Do-Nou Infrastructure Project in Mombasa. Pick the role that matches your
          contribution — all fees flow back to the MorFinance Treasury to fund real infrastructure.
        </motion.p>
      </motion.section>

      {/* Stats bar */}
      <motion.section
        ref={statsAnim.ref}
        initial="hidden"
        animate={statsAnim.controls}
        variants={fadeUp}
        className="mx-auto max-w-5xl mb-14 ">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl 
               border border-[#FFFFFF1A] bg-[#1E1B2E66] 
               divide-y sm:divide-y-0 sm:divide-x divide-[#2C293D] 
               overflow-hidden">
          {pricingStats.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      </motion.section>

      {/* Pricing cards grid */}
      <section className="mx-auto max-w-6xl grid grid-cols-1 xl:grid-cols-2 gap-6">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.id} tier={tier} />
        ))}
      </section>
    </main>
  );
}
