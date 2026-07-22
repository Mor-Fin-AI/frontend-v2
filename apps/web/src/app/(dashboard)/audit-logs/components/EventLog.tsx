'use client';

import React, { useMemo, useState } from 'react';
import {
  auditLogs,
  categoryFilterOptions,
  activitySortOptions,
  type ActivitySortOption,
  type AuditLog,
  type EventCategory,
} from '../data';
import {
  Flash24Regular,
  DocumentCheckmark24Regular,
  Book24Regular,
  Warning24Regular,
  CalendarCheckmark24Regular,
  Clock24Regular,
} from '@fluentui/react-icons';
import {
  Persona,
  makeStyles,
  presenceAvailableRegular,
  presenceAwayRegular,
  presenceOfflineRegular,
  tokens,
} from '@fluentui/react-components';
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from '@/components/ui/PanelCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import TableFilterToolbar, { TableEmptyState } from '@/components/ui/TableFilterToolbar';
import AppBadge from '@/components/ui/AppBadge';
import { auditCategoryTone, auditStatusTone } from '@/lib/badgeTones';
import { TABLE_ICON_CLASS } from '@/lib/tableUi';
import {
  matchesDateRange,
  matchesSearch,
  matchesTags,
  parseIsoTimestamp,
} from '@/lib/tableFilters';

const ICON_MAP: Record<string, React.ReactNode> = {
  learning: <Book24Regular className={TABLE_ICON_CLASS} />,
  governance: <Flash24Regular className={TABLE_ICON_CLASS} />,
  participation: <DocumentCheckmark24Regular className={TABLE_ICON_CLASS} />,
  training: <Book24Regular className={TABLE_ICON_CLASS} />,
  warning: <Warning24Regular className={TABLE_ICON_CLASS} />,
};

const AwayIcon = presenceAwayRegular.small;
const AvailableIcon = presenceAvailableRegular.small;
const OfflineIcon = presenceOfflineRegular.small;

const usePersonaStyles = makeStyles({
  statusAway: {
    color: tokens.colorPaletteMarigoldBackground3,
  },
  statusOffline: {
    color: tokens.colorNeutralForeground3,
  },
});

function ActorPersona({ name }: { name: string }) {
  const personaStyles = usePersonaStyles();

  if (name === 'System') {
    return (
      <Persona
        size="small"
        name={name}
        presence={{
          status: 'away',
          icon: <AwayIcon />,
          className: personaStyles.statusAway,
        }}
      />
    );
  }

  if (name === 'User') {
    return (
      <Persona
        size="small"
        name={name}
        presence={{
          status: 'available',
          icon: <AvailableIcon />,
        }}
      />
    );
  }

  return (
    <Persona
      size="small"
      name={name}
      presence={{
        status: 'offline',
        icon: <OfflineIcon />,
        className: personaStyles.statusOffline,
      }}
    />
  );
}

const columns: Column<AuditLog>[] = [
  {
    columnId: 'event',
    header: 'Event',
    accessor: 'title',
    description: (log) => log.description,
    media: (log) => ICON_MAP[log.iconType],
  },
  {
    columnId: 'category',
    header: 'Category',
    accessor: (log) => (
      <AppBadge tone={auditCategoryTone[log.category] ?? 'neutral'} appearance="tint" size="table">
        {log.category}
      </AppBadge>
    ),
  },
  {
    columnId: 'status',
    header: 'Status',
    accessor: (log) => (
      <AppBadge tone={auditStatusTone[log.status] ?? 'neutral'} appearance="tint" size="table">
        {log.status}
      </AppBadge>
    ),
  },
  {
    columnId: 'actId',
    header: 'Act ID',
    accessor: (log) => (
      <AppBadge
        tone={log.highlighted ? 'danger' : (auditCategoryTone[log.category] ?? 'neutral')}
        appearance={log.highlighted ? 'outline' : 'tint'}
        size="table"
      >
        {log.actId}
      </AppBadge>
    ),
  },
  {
    columnId: 'timestamp',
    header: 'Last updated',
    accessor: 'timestamp',
    media: () => <Clock24Regular className={TABLE_ICON_CLASS} />,
  },
  {
    columnId: 'actor',
    header: 'Author',
    accessor: (log) => <ActorPersona name={log.actor} />,
  },
];

export default function EventLog({ isLoading = false }: { isLoading?: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [sortBy, setSortBy] = useState<ActivitySortOption>('newest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filtered = useMemo(() => {
    const matches = auditLogs.filter((log) => {
      const matchesCategory = matchesTags(selectedCategories, log.category);
      const matchesQuery = matchesSearch(search, [
        log.title,
        log.actId,
        log.description,
        log.category,
        log.status,
        log.actor,
      ]);
      const matchesDates = matchesDateRange(
        log.timestamp,
        startDate,
        endDate,
        (value) => parseIsoTimestamp(value),
      );

      return matchesCategory && matchesQuery && matchesDates;
    });

    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (
            parseIsoTimestamp(a.timestamp).getTime() -
            parseIsoTimestamp(b.timestamp).getTime()
          );
        case 'category':
          return a.category.localeCompare(b.category);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return (
            parseIsoTimestamp(b.timestamp).getTime() -
            parseIsoTimestamp(a.timestamp).getTime()
          );
      }
    });
  }, [search, selectedCategories, sortBy, startDate, endDate]);

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardTopBar>
        <PanelCardTopIcon>
          <CalendarCheckmark24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />
        </PanelCardTopIcon>
      </PanelCardTopBar>
      <PanelCardHeader
        title="Activity Log"
        description="Platform events, governance, and learning activity"
      />

      <PanelCardBody>
        <TableFilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events, IDs, actions..."
          searchAriaLabel="Search activity log"
          sortBy={sortBy}
          onSortChange={(value) => setSortBy(value as ActivitySortOption)}
          sortOptions={activitySortOptions}
          sortAriaLabel="Sort activity log"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          tagOptions={categoryFilterOptions}
          selectedTags={selectedCategories}
          onTagsChange={(tags) => setSelectedCategories(tags as EventCategory[])}
          tagAriaLabel="Selected categories"
          tagButtonAriaLabel="Filter by category"
        />

        {isLoading ? (
          <DataTable
            aria-label="Audit activity log"
            columns={columns}
            data={[]}
            getRowId={(item) => item.id}
            selectionMode="multiselect"
            isLoading
            loadingLabel="Loading audit activity log"
            loadingRowCount={6}
          />
        ) : filtered.length > 0 ? (
          <DataTable
            aria-label="Audit activity log"
            columns={columns}
            data={filtered}
            getRowId={(item) => item.id}
            selectionMode="multiselect"
          />
        ) : (
          <TableEmptyState message="No events found." />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
