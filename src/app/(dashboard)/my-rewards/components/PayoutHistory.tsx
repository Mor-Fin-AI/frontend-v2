'use client';

import React, { useMemo, useState } from 'react';
import { CalendarLtr24Regular, DocumentText24Regular, ArrowUpRight24Regular } from '@fluentui/react-icons';
import DataTable, { Column } from '@/components/ui/DataTable';
import { participationActivityData, ParticipationActivity } from '../data';
import NeuButton from '@/components/ui/NeuButton';
import PanelCard, { PanelCardBody, PanelCardHeader } from '@/components/ui/PanelCard';
import TableFilterToolbar, { TableEmptyState } from '@/components/ui/TableFilterToolbar';
import AppBadge from '@/components/ui/AppBadge';
import { payoutStatusTone } from '@/lib/badgeTones';
import { TABLE_ICON_CLASS } from '@/lib/tableUi';
import {
  compareDates,
  matchesDateRange,
  matchesSearch,
  matchesTags,
  type TableSortOption,
} from '@/lib/tableFilters';

const categoryOptions = ['Learning Module', 'Governance', 'Training', 'Participation'];

const payoutSortOptions: TableSortOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'activity', label: 'Activity (A–Z)' },
  { value: 'category', label: 'Category (A–Z)' },
  { value: 'status', label: 'Status (A–Z)' },
];

export default function PayoutHistorySection({ isLoading = false }: { isLoading?: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const columns: Column<ParticipationActivity>[] = [
    {
      columnId: 'date',
      header: 'Date',
      accessor: 'date',
      media: () => <CalendarLtr24Regular className={TABLE_ICON_CLASS} />,
      className: 'w-[18%]',
      headerClassName: 'w-[18%]',
    },
    {
      columnId: 'activity',
      header: 'Activity',
      accessor: 'activity',
      media: () => <DocumentText24Regular className={TABLE_ICON_CLASS} />,
      className: 'w-[40%]',
      headerClassName: 'w-[40%]',
    },
    {
      columnId: 'category',
      header: 'Category',
      accessor: 'category',
      className: 'w-[22%]',
      headerClassName: 'w-[22%]',
    },
    {
      columnId: 'status',
      header: 'Status',
      accessor: (item) => (
        <div className="flex justify-end">
          <AppBadge tone={payoutStatusTone[item.status] ?? 'neutral'} appearance="tint" size="table">
            {item.status}
          </AppBadge>
        </div>
      ),
      className: 'w-[20%]',
      headerClassName: 'w-[20%] text-right',
    },
  ];

  const filtered = useMemo(() => {
    const rows = participationActivityData.filter((item) => {
      const matchesCategory = matchesTags(selectedCategories, item.category);
      const matchesQuery = matchesSearch(search, [
        item.id,
        item.date,
        item.activity,
        item.category,
        item.status,
      ]);
      const matchesDates = matchesDateRange(item.date, startDate, endDate);
      return matchesCategory && matchesQuery && matchesDates;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return compareDates(a.date, b.date);
        case 'activity':
          return a.activity.localeCompare(b.activity);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return compareDates(b.date, a.date);
      }
    });
  }, [search, selectedCategories, sortBy, startDate, endDate]);

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardHeader
        title="Participation History"
        action={
          <NeuButton variant="secondary" size="sm">
            Export
            <ArrowUpRight24Regular className="w-4 h-4" />
          </NeuButton>
        }
      />

      <PanelCardBody>
        <TableFilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search activity, category, status..."
          searchAriaLabel="Search participation history"
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={payoutSortOptions}
          sortAriaLabel="Sort participation history"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          tagOptions={categoryOptions}
          selectedTags={selectedCategories}
          onTagsChange={setSelectedCategories}
          tagAriaLabel="Selected categories"
          tagButtonAriaLabel="Filter by category"
        />

        {isLoading ? (
          <DataTable
            columns={columns}
            data={[]}
            className="table-fixed"
            getRowId={(item) => item.id}
            isLoading
            loadingLabel="Loading payout history"
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
          <TableEmptyState message="No participation history found." />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
