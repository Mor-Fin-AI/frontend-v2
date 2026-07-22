'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUp24Regular,
  Book24Regular,
  CheckboxChecked24Regular,
  DocumentText24Regular,
} from '@fluentui/react-icons';
import { recentActivityData, ActivityData } from '../data';
import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardHeaderLink,
} from '@/components/ui/PanelCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import TableFilterToolbar, { TableEmptyState } from '@/components/ui/TableFilterToolbar';
import AppBadge from '@/components/ui/AppBadge';
import { activityTypeTone } from '@/lib/badgeTones';
import { TABLE_ICON_CLASS } from '@/lib/tableUi';
import { matchesSearch, matchesTags, type TableSortOption } from '@/lib/tableFilters';

const activityTypeOptions = ['Learning', 'Vote', 'Training', 'Assessment'] as const;

const activitySortOptions: TableSortOption[] = [
  { value: 'type', label: 'Type (A–Z)' },
  { value: 'activity', label: 'Activity (A–Z)' },
  { value: 'status', label: 'Status (A–Z)' },
];

const typeIcons: Record<ActivityData['type'], React.ReactNode> = {
  Learning: <Book24Regular className={TABLE_ICON_CLASS} />,
  Vote: <CheckboxChecked24Regular className={TABLE_ICON_CLASS} />,
  Training: <Book24Regular className={TABLE_ICON_CLASS} />,
  Assessment: <DocumentText24Regular className={TABLE_ICON_CLASS} />,
};

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const columns: Column<ActivityData>[] = [
  {
    columnId: 'type',
    header: 'Type',
    width: '148px',
    accessor: (item) => (
      <AppBadge tone={activityTypeTone[item.type]} appearance="tint" size="table">
        {item.type}
      </AppBadge>
    ),
    media: (item) => typeIcons[item.type],
    className: 'w-[148px]',
    headerClassName: 'w-[148px]',
  },
  {
    columnId: 'activity',
    header: 'Activity',
    accessor: 'label',
    className: 'text-muted-foreground',
  },
  {
    columnId: 'status',
    header: 'Status',
    width: '112px',
    accessor: (item) => (
      <AppBadge tone="success" appearance="tint" size="table">
        {item.status || '--'}
      </AppBadge>
    ),
    className: 'text-center w-[112px]',
    headerClassName: 'text-center w-[112px]',
  },
  {
    columnId: 'time',
    header: 'Time',
    width: '96px',
    accessor: 'time',
    className: 'text-right text-foreground w-[96px]',
    headerClassName: 'text-right w-[96px]',
  },
];

export default function RecentActivityTable({ isLoading = false }: { isLoading?: boolean }) {
  const { ref, controls } = useScrollAnimation();
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('type');

  const filtered = useMemo(() => {
    const rows = recentActivityData.filter((item) => {
      const matchesType = matchesTags(selectedTypes, item.type);
      const matchesQuery = matchesSearch(search, [item.type, item.label, item.status, item.time]);
      return matchesType && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'activity':
          return a.label.localeCompare(b.label);
        case 'status':
          return (a.status ?? '').localeCompare(b.status ?? '');
        case 'type':
        default:
          return a.type.localeCompare(b.type);
      }
    });
  }, [search, selectedTypes, sortBy]);

  const previewRows = filtered.slice(0, 5);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="flex flex-col gap-7"
    >
      <PanelCard aria-busy={isLoading}>
        <PanelCardHeader
          title="Recent Activity Log"
          description="Latest learning and governance events"
          action={
            <PanelCardHeaderLink>
              View all
              <ArrowUp24Regular className="h-4 w-4 rotate-45" />
            </PanelCardHeaderLink>
          }
        />

        <PanelCardBody>
          <TableFilterToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search activity, type, status..."
            searchAriaLabel="Search recent activity"
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOptions={activitySortOptions}
            sortAriaLabel="Sort recent activity"
            showDateRange={false}
            tagOptions={[...activityTypeOptions]}
            selectedTags={selectedTypes}
            onTagsChange={setSelectedTypes}
            tagAriaLabel="Selected activity types"
            tagButtonAriaLabel="Filter by activity type"
          />

          {isLoading ? (
            <DataTable
              aria-label="Recent activity log"
              columns={columns}
              data={[]}
              getRowId={(item) => item.id}
              isLoading
              loadingLabel="Loading recent activity"
              loadingRowCount={5}
            />
          ) : previewRows.length > 0 ? (
            <DataTable
              aria-label="Recent activity log"
              columns={columns}
              data={previewRows}
              getRowId={(item) => item.id}
            />
          ) : (
            <TableEmptyState message="No activity found." />
          )}
        </PanelCardBody>
      </PanelCard>
    </motion.div>
  );
}
