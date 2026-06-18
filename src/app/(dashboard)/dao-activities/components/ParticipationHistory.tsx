'use client';

import React, { useMemo, useState } from 'react';
import {
  Book24Regular,
  CalendarLtr24Regular,
  CheckboxChecked24Regular,
  DocumentCheckmark24Regular,
  PeopleTeam24Regular,
} from '@fluentui/react-icons';
import DataTable, { Column } from '@/components/ui/DataTable';
import { participationHistory, ParticipationEvent } from '../data';
import PanelCard, { PanelCardBody, PanelCardHeader } from '@/components/ui/PanelCard';
import TableFilterToolbar, { TableEmptyState } from '@/components/ui/TableFilterToolbar';
import AppBadge from '@/components/ui/AppBadge';
import { participationStatusTone } from '@/lib/badgeTones';
import { TABLE_ICON_CLASS } from '@/lib/tableUi';
import {
  compareDates,
  matchesDateRange,
  matchesSearch,
  matchesTags,
  type TableSortOption,
} from '@/lib/tableFilters';

const categoryOptions = ['Meeting', 'Governance', 'Ceremony', 'Validation'];
const statusOptions = ['Attended', 'Voted', 'Participated'];

const participationSortOptions: TableSortOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'category', label: 'Category (A–Z)' },
  { value: 'event', label: 'Event (A–Z)' },
  { value: 'status', label: 'Status (A–Z)' },
];

const CATEGORY_ICONS = {
  Meeting: <PeopleTeam24Regular className={TABLE_ICON_CLASS} />,
  Governance: <CheckboxChecked24Regular className={TABLE_ICON_CLASS} />,
  Ceremony: <Book24Regular className={TABLE_ICON_CLASS} />,
  Validation: <DocumentCheckmark24Regular className={TABLE_ICON_CLASS} />,
} as const;

const columns: Column<ParticipationEvent>[] = [
  {
    columnId: 'category',
    header: 'Category',
    accessor: 'category',
    media: (item) => CATEGORY_ICONS[item.category],
    className: 'w-[18%]',
  },
  {
    columnId: 'title',
    header: 'Event',
    accessor: 'title',
  },
  {
    columnId: 'date',
    header: 'Date',
    accessor: 'date',
    media: () => <CalendarLtr24Regular className={TABLE_ICON_CLASS} />,
    className: 'w-[22%]',
  },
  {
    columnId: 'status',
    header: 'Status',
    accessor: (item) => (
      <AppBadge tone={participationStatusTone[item.status] ?? 'neutral'} appearance="tint" size="table">
        {item.status}
      </AppBadge>
    ),
    className: 'w-[20%] text-right',
    headerClassName: 'w-[20%] text-right',
  },
];

export default function ParticipationHistory({ isLoading = false }: { isLoading?: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filtered = useMemo(() => {
    const rows = participationHistory.filter((item) => {
      const matchesCategory = matchesTags(selectedCategories, item.category);
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [item.category, item.title, item.date, item.status]);
      const matchesDates = matchesDateRange(item.date, startDate, endDate);
      return matchesCategory && matchesStatus && matchesQuery && matchesDates;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return compareDates(a.date, b.date);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'event':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return compareDates(b.date, a.date);
      }
    });
  }, [search, selectedCategories, selectedStatuses, sortBy, startDate, endDate]);

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardHeader title="Participation History" description="Meetings, governance, and ceremonies" />
      <PanelCardBody>
        <TableFilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events, categories, status..."
          searchAriaLabel="Search participation history"
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={participationSortOptions}
          sortAriaLabel="Sort participation history"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          tagOptions={[...categoryOptions, ...statusOptions]}
          selectedTags={[...selectedCategories, ...selectedStatuses]}
          onTagsChange={(tags) => {
            setSelectedCategories(tags.filter((tag) => categoryOptions.includes(tag)));
            setSelectedStatuses(tags.filter((tag) => statusOptions.includes(tag)));
          }}
          tagAriaLabel="Selected participation filters"
          tagButtonAriaLabel="Filter by category or status"
        />

        {isLoading ? (
          <DataTable
            columns={columns}
            data={[]}
            getRowId={(item) => item.id}
            aria-label="Participation history"
            isLoading
            loadingLabel="Loading participation history"
            loadingRowCount={6}
          />
        ) : filtered.length > 0 ? (
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(item) => item.id}
            aria-label="Participation history"
          />
        ) : (
          <TableEmptyState message="No participation events found." />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
