'use client';

import React, { useMemo, useState } from 'react';
import { Building24Regular } from '@fluentui/react-icons';
import DataTable, { Column } from '@/components/ui/DataTable';
import PanelCard, { PanelCardBody, PanelCardHeader } from '@/components/ui/PanelCard';
import TableFilterToolbar, { TableEmptyState } from '@/components/ui/TableFilterToolbar';
import AppBadge from '@/components/ui/AppBadge';
import { validationResultTone } from '@/lib/badgeTones';
import { TABLE_ICON_CLASS } from '@/lib/tableUi';
import { recentValidations, Validation } from '../data';
import {
  compareDates,
  matchesDateRange,
  matchesSearch,
  matchesTags,
  type TableSortOption,
} from '@/lib/tableFilters';

const resultOptions = ['Approved', 'Flagged', 'Pending'];
const statusOptions = ['Completed', 'Flagged'];

const validationSortOptions: TableSortOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'project', label: 'Project (A–Z)' },
  { value: 'type', label: 'Type (A–Z)' },
  { value: 'result', label: 'Result (A–Z)' },
  { value: 'status', label: 'Status (A–Z)' },
];

const columns: Column<Validation>[] = [
  {
    columnId: 'project',
    header: 'Project',
    accessor: 'project',
    media: () => <Building24Regular className={TABLE_ICON_CLASS} />,
    className: 'w-[30%] font-normal',
    headerClassName: 'w-[30%]',
  },
  {
    columnId: 'date',
    header: 'Date',
    accessor: 'date',
    className: 'w-[20%]',
    headerClassName: 'w-[20%]',
  },
  {
    columnId: 'type',
    header: 'Type',
    accessor: 'type',
    className: 'w-[20%]',
    headerClassName: 'w-[20%]',
  },
  {
    columnId: 'result',
    header: 'Result',
    accessor: (item) => (
      <AppBadge tone={validationResultTone[item.result] ?? 'neutral'} appearance="tint" size="table">
        {item.result}
      </AppBadge>
    ),
    className: 'w-[15%]',
    headerClassName: 'w-[15%]',
  },
  {
    columnId: 'status',
    header: 'Status',
    accessor: (item) => (
      <AppBadge
        tone={item.status === 'Completed' ? 'success' : 'danger'}
        appearance="tint"
        size="table"
      >
        {item.status}
      </AppBadge>
    ),
    className: 'w-[15%] text-right',
    headerClassName: 'w-[15%] text-right',
  },
];

export default function RecentValidations({ isLoading = false }: { isLoading?: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filtered = useMemo(() => {
    const rows = recentValidations.filter((item) => {
      const matchesResult = matchesTags(selectedResults, item.result);
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.project,
        item.date,
        item.type,
        item.result,
        item.status,
      ]);
      const matchesDates = matchesDateRange(item.date, startDate, endDate);
      return matchesResult && matchesStatus && matchesQuery && matchesDates;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return compareDates(a.date, b.date);
        case 'project':
          return a.project.localeCompare(b.project);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'result':
          return a.result.localeCompare(b.result);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return compareDates(b.date, a.date);
      }
    });
  }, [search, selectedResults, selectedStatuses, sortBy, startDate, endDate]);

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardHeader title="Recent Assessments" description="Project validation outcomes" />
      <PanelCardBody>
        <TableFilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search project, type, result..."
          searchAriaLabel="Search recent assessments"
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={validationSortOptions}
          sortAriaLabel="Sort recent assessments"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          tagOptions={[...resultOptions, ...statusOptions]}
          selectedTags={[...selectedResults, ...selectedStatuses]}
          onTagsChange={(tags) => {
            setSelectedResults(tags.filter((tag) => resultOptions.includes(tag)));
            setSelectedStatuses(tags.filter((tag) => statusOptions.includes(tag)));
          }}
          tagAriaLabel="Selected assessment filters"
          tagButtonAriaLabel="Filter by result or status"
        />

        {isLoading ? (
          <DataTable
            columns={columns}
            data={[]}
            className="table-fixed"
            getRowId={(item) => item.id}
            isLoading
            loadingLabel="Loading recent assessments"
            loadingRowCount={5}
          />
        ) : filtered.length > 0 ? (
          <DataTable
            columns={columns}
            data={filtered}
            className="table-fixed"
            getRowId={(item) => item.id}
          />
        ) : (
          <TableEmptyState message="No assessments found." />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
