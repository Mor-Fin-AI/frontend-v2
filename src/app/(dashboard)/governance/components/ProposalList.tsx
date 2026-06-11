'use client';

import React from 'react';
import { Proposal, ProposalStatus, ProposalCategory } from '../data';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const STATUS_STYLES: Record<ProposalStatus, { text: string; bg: string }> = {
  Active: { text: 'text-[#4ADE80]', bg: 'bg-[#22C55E1A]' },
  Executed: { text: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
  Defeated: { text: 'text-[#EF4444]', bg: 'bg-[#EF44441A]' },
};

const CATEGORY_STYLES: Record<ProposalCategory, { text: string; bg: string }> = {
  Infrastructure: { text: 'text-[#F69E23]', bg: 'bg-[#F69E231A]' },
  Education: { text: 'text-[#22C38E]', bg: 'bg-[#22C38E1A]' },
  'Platform Resources': { text: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
  Governance: { text: 'text-[#8C47D1]', bg: 'bg-[#8547D11A]' },
};

function Badge({ label, styles }: { label: string; styles: { text: string; bg: string } }) {
  return (
    <span
      className={clsx(
        'flex items-center px-2 py-1 rounded-full text-[11px] font-medium font-inter',
        styles.bg,
        styles.text
      )}>
      {label}
    </span>
  );
}

function TimeLabel({ timeLeft }: { timeLeft?: string }) {
  return (
    <span className="px-3 py-1.5 rounded-lg bg-[#FFFFFF1A] text-sm font-medium text-white font-inter">
      {timeLeft || 'Closed'}
    </span>
  );
}

function ProposalCard({ proposal, index }: { proposal: Proposal; index: number }) {
  const isActive = proposal.status === 'Active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex flex-col gap-5 p-2 md:p-4 rounded-2xl
      bg-[#A4FFC608]
      border border-[#FFFFFF0D]
      backdrop-blur-md">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs md:text-sm text-[#9CA3AF] font-medium font-inter">{proposal.id}</span>

          <Badge label={proposal.status} styles={STATUS_STYLES[proposal.status]} />

          <Badge label={proposal.category} styles={CATEGORY_STYLES[proposal.category]} />
        </div>

        <TimeLabel timeLeft={proposal.timeLeft} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-medium text-white leading-7 font-inter">
          {proposal.title}
        </h3>

        <p className="text-[12px] text-[#9CA3AF] leading-5 font-inter">{proposal.description}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#4ADE80] text-[12px] font-medium">
            <ThumbsUp size={16} />
            {proposal.votesFor}
          </div>

          <div className="flex-1 h-2.25 bg-[#FFFFFF1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C084FC] rounded-full transition-all duration-700"
              style={{ width: `${proposal.forPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-[#EF4444]  text-xs font-medium">
            <ThumbsDown size={16} />
            {proposal.votesAgainst}
          </div>

          <span className="text-sm font-semibold text-white ml-2">by {proposal.author}</span>
        </div>

        {isActive && (
          <div className="flex items-center gap-3 pt-2">
            <button className="px-4 py-2 rounded-lg bg-[#4ADE80] text-white text-sm font-medium hover:bg-[#39c96c] transition">
              Vote For
            </button>

            <button className="px-4 py-2 rounded-lg bg-[#FFFFFF1A] text-white text-sm font-medium hover:bg-[#FFFFFF26] transition">
              Vote Against
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ProposalList({ proposals }: { proposals: Proposal[] }) {
  return (
    <div className="flex flex-col gap-5">
      {proposals.map((proposal, index) => (
        <ProposalCard key={proposal.id} proposal={proposal} index={index} />
      ))}
    </div>
  );
}
