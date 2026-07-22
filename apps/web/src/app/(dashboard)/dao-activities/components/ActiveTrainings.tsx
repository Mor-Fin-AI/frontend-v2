'use client';

import { activeTrainings, Training, TrainingStatus } from '../data';
import { motion } from 'framer-motion';
import { ArrowUpRight24Regular } from '@fluentui/react-icons';
import PanelCard, { PanelCardBody, PanelCardHeader, PanelCardHeaderLink } from '@/components/ui/PanelCard';
import AppProgressBar from '@/components/ui/AppProgressBar';
import AppBadge from '@/components/ui/AppBadge';
import { trainingStatusTone } from '@/lib/badgeTones';

function TrainingProgress({
  completed,
  total,
  status,
}: {
  completed: number;
  total: number;
  status: TrainingStatus;
}) {
  const percent = total > 0 ? (completed / total) * 100 : 0;

  const barColor =
    status === 'Completed'
      ? '#4ADE80'
      : status === 'InProgress'
        ? '#30ABE8'
        : '#6B7280';

  return (
    <div className="flex max-w-34.75 flex-col items-end gap-1">
      <span className="text-right text-[12px] font-medium leading-7 text-muted-foreground">
        {completed}/{total} modules
      </span>

      <AppProgressBar
        className="w-34.75"
        percent={percent}
        color={barColor}
        shape="rounded"
        thickness="large"
      />
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
      className="flex items-center justify-between gap-2 border-b border-border py-4.5 last:border-0 md:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium leading-5 text-foreground">
          {training.title}
        </span>

        <AppBadge
          tone={trainingStatusTone[training.status] ?? 'neutral'}
          appearance="tint"
          size="table"
          className="font-medium"
        >
          {training.status}
        </AppBadge>
      </div>

      <TrainingProgress
        completed={training.modulesCompleted}
        total={training.totalModules}
        status={training.status}
      />
    </motion.div>
  );
}

export default function ActiveTrainings() {
  return (
    <PanelCard>
      <PanelCardHeader
        title="Active Trainings"
        action={
          <PanelCardHeaderLink>
            Browse All
            <ArrowUpRight24Regular className="h-4 w-4" />
          </PanelCardHeaderLink>
        }
      />
      
      <PanelCardBody>
      <div className="flex flex-col">
        {activeTrainings.map((training, index) => (
          <TrainingRow key={training.id} training={training} index={index} />
        ))}
      </div>
      </PanelCardBody>
    </PanelCard>
  );
}
