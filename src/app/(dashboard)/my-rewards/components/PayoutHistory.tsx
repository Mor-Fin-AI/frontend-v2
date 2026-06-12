'use client';

import React from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { participationActivityData, ParticipationActivity } from '../data';
import { ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

const STATUS_STYLES: Record<ParticipationActivity['status'], { dot: string; text: string; bg: string }> = {
  Completed:   { dot: 'bg-[#22C38E]', text: 'text-[#22C38E]', bg: 'bg-[#22C55E1A]' },
  'In Progress': { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-4001A' },
  Pending:     { dot: 'bg-[#F69E23]',  text: 'text-[#F69E23]', bg: 'bg-[#F69E231A]' },
};

export default function PayoutHistorySection() {
  const columns: Column<ParticipationActivity>[] = [
    {
      header: 'Date',
      accessor: 'date',
      className: 'font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[18%]',
      headerClassName: 'w-[18%]',
    },
    {
      header: 'Activity',
      accessor: 'activity',
      className: 'font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[40%]',
      headerClassName: 'w-[40%]',
    },
    {
      header: 'Category',
      accessor: 'category',
      className: 'font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[22%]',
      headerClassName: 'w-[22%]',
    },
    {
      header: 'Status',
      accessor: (item) => {
        const s = STATUS_STYLES[item.status];
        return (
          <div className="flex justify-end">
            <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-full w-fit', s.bg)}>
              <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
              <span className={clsx('text-[11px] font-medium font-inter', s.text)}>
                {item.status}
              </span>
            </div>
          </div>
        );
      },
      className: 'w-[20%]',
      headerClassName: 'w-[20%] text-right',
    },
  ];

  return (
    <div className="bg-[#1E1B2E33] border border-[#FFFFFF0D] rounded-2xl p-3 md:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-7">
        <h3 className="text-white text-lg font-medium font-inter leading-7">Participation History</h3>
        <button className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#16212C] text-[#22C38E] text-sm font-medium leading-6 hover:bg-[#FFFFFF1A] transition-colors">
          Export
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <DataTable columns={columns} data={participationActivityData} className="table-fixed" />
    </div>
  );
}
