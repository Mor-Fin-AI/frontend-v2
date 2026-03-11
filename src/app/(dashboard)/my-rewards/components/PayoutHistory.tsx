'use client';

import React from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { payoutHistoryData, PayoutHistory } from '../data';
import { ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

export default function PayoutHistorySection() {
  const columns: Column<PayoutHistory>[] = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[20%]',
      headerClassName: 'w-[20%]',
    },
    {
      header: 'Date',
      accessor: 'date',
      className: 'font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[20%]',
      headerClassName: 'w-[20%]',
    },
    {
      header: 'Amount',
      accessor: (item) => (
        <span className="text-[#22C38E] font-inter font-normal text-sm leading-5 ">
          ${item.amount.toLocaleString()}
        </span>
      ),
      className: 'font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[20%]',
      headerClassName: 'w-[20%] ',
    },
    {
      header: 'Method',
      accessor: 'method',
      className: 'w-[20%] font-inter font-normal text-sm leading-5 text-[#D1D5DB] w-[20%] ',
      headerClassName: 'w-[20%]',
    },
    {
      header: 'Status',
      accessor: (item) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E1A]  w-fit">
            <div
              className={clsx(
                'w-1.5 h-1.5 rounded-full',
                item.status === 'Completed' ? 'bg-[#22C38E] ' :
                  item.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-400'
              )}
            />
            <span className={clsx(
              'text-[11px] font-medium font-inter',
              item.status === 'Completed' ? 'text-[#22C38E]' :
                item.status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
            )}>
              {item.status}
            </span>
          </div>
        </div>
      ),
      className: 'w-[20%]',
      headerClassName: 'w-[0%] text-right',
    },
  ];

  return (
    <div className="bg-[#1E1B2E33] border border-[#FFFFFF0D] rounded-2xl p-3 md:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-7">
        <h3 className="text-white text-lg font-medium font-inter leading-7">Payout History</h3>
        <button className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#16212C]  text-[#22C38E] text-sm font-medium leading-6 hover:bg-[#FFFFFF1A] transition-colors">
          Export
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <DataTable columns={columns} data={payoutHistoryData} className="table-fixed" />
    </div>
  );
}
