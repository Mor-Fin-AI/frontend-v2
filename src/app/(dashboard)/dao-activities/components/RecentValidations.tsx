'use client';

import React from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { recentValidations, Validation, ValidationResult } from '../data';
import clsx from 'clsx';

const RESULT_STYLES: Record<ValidationResult, { dot: string; label: string; bg: string }> = {
    Approved:  { dot: 'bg-[#4ADE80]', label: 'text-[#4ADE80]', bg: 'bg-[#22C55E1A]' },
    Flagged:   { dot: 'bg-[#EF4444]', label: 'text-[#EF4444]', bg: 'bg-[#EF44441A]' },
    Pending:   { dot: 'bg-[#F69E23]', label: 'text-[#F69E23]', bg: 'bg-[#F69E231A]' },
};

function ResultBadge({ result }: { result: ValidationResult }) {
    const s = RESULT_STYLES[result];
    return (
        <div className={clsx('flex items-center justify-center gap-1.5 max-w-24 px-2.5 py-1 rounded-full', s.bg)}>
            <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
            <span className={clsx('text-[11px] font-medium font-inter', s.label)}>{result}</span>
        </div>
    );
}

const columns: Column<Validation>[] = [
    {
        header: 'Project',
        accessor: 'project',
        className: 'w-[30%] font-normal',
        headerClassName: 'w-[30%]',
    },
    {
        header: 'Date',
        accessor: 'date',
        className: 'w-[20%]',
        headerClassName: 'w-[20%]',
    },
    {
        header: 'Type',
        accessor: 'type',
        className: 'w-[20%]',
        headerClassName: 'w-[20%]',
    },
    {
        header: 'Result',
        accessor: (item) => <ResultBadge result={item.result} />,
        className: 'w-[15%]',
        headerClassName: 'w-[15%]',
    },
    {
        header: 'Status',
        accessor: (item) => (
            <span className={item.status === 'Completed' ? 'text-[#4ADE80] font-normal' : 'text-[#EF4444]'}>
                {item.status}
            </span>
        ),
        className: 'w-[15%] text-right',
        headerClassName: 'w-[15%] text-right',
    },
];

export default function RecentValidations() {
    return (
        <div className="bg-[#1E1B2E33] border border-[#FFFFFF0D] rounded-2xl p-3 md:p-6 flex flex-col">
            <h3 className="text-white text-lg font-medium font-inter mb-6">Recent Assessments</h3>
            <DataTable columns={columns} data={recentValidations} className="table-fixed" />
        </div>
    );
}
