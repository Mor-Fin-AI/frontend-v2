'use client';

import React, { useMemo, useState } from 'react';
import { Folder24Regular } from '@fluentui/react-icons';
import DataTable, { Column } from '@/components/ui/DataTable';
import PanelCard, { PanelCardBody, PanelCardHeader } from '@/components/ui/PanelCard';
import TableFilterToolbar, { TableEmptyState } from '@/components/ui/TableFilterToolbar';
import AppProgressBar from '@/components/ui/AppProgressBar';
import AppBadge from '@/components/ui/AppBadge';
import { projectStatusTone } from '@/lib/badgeTones';
import { TABLE_ICON_CLASS } from '@/lib/tableUi';
import { projects, Project, ProjectType } from '../data';
import { matchesSearch, matchesTags, type TableSortOption } from '@/lib/tableFilters';

const PROGRESS_COLORS: Record<ProjectType, string> = {
  Program: '#22C38E',
  Series: '#30ABE8',
  Initiative: '#F69E23',
  Training: '#8C47D1',
  Workshop: '#EAB308',
};

const projectTypeOptions = ['Program', 'Series', 'Initiative', 'Training', 'Workshop'];
const projectStatusOptions = ['Active', 'Completed', 'Planning'];

const projectSortOptions: TableSortOption[] = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'type', label: 'Activity type (A–Z)' },
  { value: 'status', label: 'Status (A–Z)' },
  { value: 'progress-high', label: 'Progress (high to low)' },
  { value: 'progress-low', label: 'Progress (low to high)' },
];

function ProgressCell({ project }: { project: Project }) {
  const color = PROGRESS_COLORS[project.type];
  return (
    <div className="flex max-w-17 flex-col gap-1.5">
      <span className="text-right text-xs text-foreground">{project.progress}%</span>
      <AppProgressBar
        percent={project.progress}
        color={color}
        shape="rounded"
        thickness="large"
      />
    </div>
  );
}

const columns: Column<Project>[] = [
  {
    columnId: 'name',
    header: 'Activity Overview',
    accessor: 'name',
    media: () => <Folder24Regular className={TABLE_ICON_CLASS} />,
    className: 'w-[32%]',
    headerClassName: 'w-[32%]',
  },
  {
    columnId: 'location',
    header: 'Category',
    accessor: 'location',
    className: 'w-[20%]',
    headerClassName: 'w-[20%]',
  },
  {
    columnId: 'type',
    header: 'Activity Type',
    accessor: 'type',
    media: (item) => <Folder24Regular className={TABLE_ICON_CLASS} />,
    className: 'w-[16%]',
    headerClassName: 'w-[16%]',
  },
  {
    columnId: 'progress',
    header: 'Completion Status',
    accessor: (item) => <ProgressCell project={item} />,
    className: 'w-[18%] font-medium  ',
    headerClassName: 'w-[18%]',
  },
  {
    columnId: 'status',
    header: 'Current Status',
    accessor: (item) => (
      <AppBadge tone={projectStatusTone[item.status] ?? 'neutral'} appearance="tint" size="table">
        {item.status}
      </AppBadge>
    ),
    className: 'w-[14%]',
    headerClassName: 'w-[14%]',
  },
];

export default function ProjectsTable({ isLoading = false }: { isLoading?: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    const rows = projects.filter((project) => {
      const matchesType = matchesTags(selectedTypes, project.type);
      const matchesStatus = matchesTags(selectedStatuses, project.status);
      const matchesQuery = matchesSearch(search, [
        project.name,
        project.location,
        project.type,
        project.status,
        project.progress,
      ]);
      return matchesType && matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.type.localeCompare(b.type);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'progress-high':
          return b.progress - a.progress;
        case 'progress-low':
          return a.progress - b.progress;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [search, selectedTypes, selectedStatuses, sortBy]);

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardHeader title="Activity Overview" description="Infrastructure programs and initiatives" />
      <PanelCardBody>
        <TableFilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search programs, categories, types..."
          searchAriaLabel="Search activity overview"
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={projectSortOptions}
          sortAriaLabel="Sort activity overview"
          showDateRange={false}
          tagOptions={[...projectTypeOptions, ...projectStatusOptions]}
          selectedTags={[...selectedTypes, ...selectedStatuses]}
          onTagsChange={(tags) => {
            setSelectedTypes(tags.filter((tag) => projectTypeOptions.includes(tag)));
            setSelectedStatuses(tags.filter((tag) => projectStatusOptions.includes(tag)));
          }}
          tagAriaLabel="Selected activity filters"
          tagButtonAriaLabel="Filter by type or status"
        />

        {isLoading ? (
          <DataTable
            columns={columns}
            data={[]}
            className="table-fixed"
            getRowId={(item) => item.id}
            isLoading
            loadingLabel="Loading projects"
            loadingRowCount={6}
          />
        ) : filtered.length > 0 ? (
          <DataTable
            columns={columns}
            data={filtered}
            className="table-fixed"
            getRowId={(item) => item.id}
          />
        ) : (
          <TableEmptyState message="No projects found." />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
