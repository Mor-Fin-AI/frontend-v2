'use client';

import React from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { projects, Project, ProjectStatus, ProjectType } from '../data';
import clsx from 'clsx';

const STATUS_STYLES: Record<ProjectStatus, { dot: string; label: string; bg: string }> = {
    Active:    { dot: 'bg-[#30ABE8]', label: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
    Completed: { dot: 'bg-[#F69E23]', label: 'text-[#F69E23]', bg: 'bg-[#F69E231A]' },
    Planning:  { dot: 'bg-[#F69E23]', label: 'text-[#F69E23]', bg: 'bg-[#F69E231A]' },
};

const PROGRESS_COLORS: Record<ProjectType, string> = {
    Road:     '#22C38E',
    Drainage: '#30ABE8',
    Hub:      '#F69E23',
};

function StatusBadge({ status }: { status: ProjectStatus }) {
    const s = STATUS_STYLES[status];
    return (
        <div className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit', s.bg)}>
            <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
            <span className={clsx('text-[10.2px] font-medium font-inter', s.label)}>{status}</span>
        </div>
    );
}

function ProgressCell({ project }: { project: Project }) {
    const color = PROGRESS_COLORS[project.type];
    return (
        <div className="flex flex-col gap-1.5 max-w-17">
            <span className="text-[#6B7280] text-xs font-inter text-right">{project.progress}%</span>
            <div className="w-full h-1.5 rounded-full bg-[#FFFFFF1A]">
                <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${project.progress}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

const columns: Column<Project>[] = [
    {
        header: 'Project',
        accessor: 'name',
        className: 'w-[28%] font-medium text-[#D1D5DB] font-normal text-sm leading-5',
        headerClassName: 'w-[28%]',
    },
    {
        header: 'Location',
        accessor: 'location',
        className: 'w-[18%] text-[#D1D5DB] font-normal text-sm leading-5',
        headerClassName: 'w-[18%]',
    },
    {
        header: 'Type',
        accessor: 'type',
        className: 'w-[12%] text-[#D1D5DB] font-normal text-sm leading-5',
        headerClassName: 'w-[12%]',
    },
    {
        header: 'Progress',
        accessor: (item) => <ProgressCell project={item} />,
        className: 'w-[15%]  ',
        headerClassName: 'w-[15%]',
    },
    {
        header: 'Status',
        accessor: (item) => <StatusBadge status={item.status} />,
        className: 'w-[12%]',
        headerClassName: 'w-[12%]',
    },
    {
        header: 'Budget',
        accessor: (item) => (
            <span className="text-[#22C38E] font-normal font-inter text-sm">
                ${item.budget.toLocaleString()}
            </span>
        ),
        className: 'w-[8%] text-right',
        headerClassName: 'w-[8%] text-right',
    },
];

export default function ProjectsTable() {
    return (
        <div className="bg-[#1E1B2E66] rounded-2xl p-4 md:p-6 flex flex-col">
            <h3 className="text-white text-lg font-bold font-inter mb-4">Projects</h3>
            <DataTable columns={columns} data={projects} className="table-fixed" />
        </div>
    );
}
