'use client';

import { activeTrainings, Training, TrainingStatus } from '../data';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';

const STATUS_STYLES: Record<TrainingStatus, { dot: string; label: string; bg: string }> = {
  InProgress: {
    dot: 'bg-[#30ABE8]',
    label: 'text-[#30ABE8]',
    bg: 'bg-[#30ABE81A]',
  },
  Completed: {
    dot: 'bg-[#4ADE80]',
    label: 'text-[#4ADE80]',
    bg: 'bg-[#4ADE801A]',
  },
  'Not Started': {
    dot: 'bg-[#F69E23]',
    label: 'text-[#F69E23]',
    bg: 'bg-[#F69E231A]',
  },
};

function StatusBadge({ status }: { status: TrainingStatus }) {
  const s = STATUS_STYLES[status];

  return (
    <div className={clsx('flex items-center gap-1.5 px-2.5 h-6 rounded-full', s.bg)}>
      <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
      <span className={clsx('text-[10.2px] leading-4 font-medium font-inter', s.label)}>
        {status}
      </span>
    </div>
  );
}

function ProgressBar({
  completed,
  total,
  status,
}: {
  completed: number;
  total: number;
  status: TrainingStatus;
}) {
  const progress = (completed / total) * 100;

  const barColor =
    status === 'Completed'
      ? 'bg-[#4ADE80]'
      : status === 'InProgress'
        ? 'bg-[#30ABE8]'
        : 'bg-[#6B7280]';

  return (
    <div className="flex flex-col items-end gap-1 max-w-34.75">
      <span className="text-white text-[12px] leading-7 font-medium text-right">
        {completed}/{total} modules
      </span>

      <div className="flex w-34.75 h-1.5 rounded-full bg-[#D9D9D91A] overflow-hidden">
        <div className={clsx('h-full rounded-full', barColor)} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function TrainingRow({ training, index }: { training: Training; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      viewport={{ once: true }}
      className="flex items-center justify-between gap-2 md:gap-6 py-4.5 border-b border-[#FFFFFF0A] last:border-0">
      {/* Title */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white text-xs font-inter leading-7 font-medium">
          {training.title}
        </span>

        <StatusBadge status={training.status} />
      </div>

      {/* Progress */}
      <ProgressBar
        completed={training.modulesCompleted}
        total={training.totalModules}
        status={training.status}
      />
    </motion.div>
  );
}

export default function ActiveTrainings() {
  return (
    <div
      className="
      w-full
      bg-[#1E1B2E1A]
      border-[1.4px] border-[#FFFFFF0D]
      rounded-2xl
      px-3 md:px-6 py-7
      flex flex-col gap-6
    ">
      <div className="flex items-center justify-between">
        <p className="text-white text-base md:text-lg leading-7 font-medium font-inter">
          Active Trainings
        </p>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#16212C] text-[#4ADE80] text-sm font-medium hover:bg-[#1F2A36] transition">
          Browse All{' '}
          <span>
            <ArrowUpRight size={16} />
          </span>
        </button>
      </div>
      
      <div className="flex flex-col">
        {activeTrainings.map((training, index) => (
          <TrainingRow key={training.id} training={training} index={index} />
        ))}
      </div>
    </div>
  );
}
