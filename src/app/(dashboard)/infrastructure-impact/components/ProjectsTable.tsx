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
    Program:    '#22C38E',
    Series:     '#30ABE8',
    Initiative: '#F69E23',
    Training:   '#8C47D1',
    Workshop:   '#EAB308',
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
            <span className="text-white text-xs font-inter text-right">{project.progress}%</span>
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
        header: 'Activity Overview',
        accessor: 'name',
        className: 'w-[32%] font-medium text-[#D1D5DB] font-normal text-sm leading-5',
        headerClassName: 'w-[32%]',
    },
    {
        header: 'Category',
        accessor: 'location',
        className: 'w-[20%] text-[#D1D5DB] font-normal text-sm leading-5',
        headerClassName: 'w-[20%]',
    },
    {
        header: 'Activity Type',
        accessor: 'type',
        className: 'w-[16%] text-[#D1D5DB] font-normal text-sm leading-5',
        headerClassName: 'w-[16%]',
    },
    {
        header: 'Completion Status',
        accessor: (item) => <ProgressCell project={item} />,
        className: 'w-[18%] font-medium  ',
        headerClassName: 'w-[18%]',
    },
    {
        header: 'Current Status',
        accessor: (item) => <StatusBadge status={item.status} />,
        className: 'w-[14%]',
        headerClassName: 'w-[14%]',
    },
];

export default function ProjectsTable() {
    return (
        <div className="bg-[#1E1B2E66] rounded-2xl p-4 md:p-6 flex flex-col">
            <h3 className="text-white text-lg font-bold font-inter mb-4">Activity Overview</h3>
            <DataTable columns={columns} data={projects} className="table-fixed" />
        </div>
    );
}
