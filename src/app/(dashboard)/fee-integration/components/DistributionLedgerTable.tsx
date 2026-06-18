"use client";

import { useMemo, useState } from "react";
import { Money24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import {
  bucketStatusTone,
  feeDistributionLedger,
  type FeeDistributionLedgerRow,
} from "../data";

const statusOptions = ["Distributed", "Pending", "Queued"] as const;

const sortOptions: TableSortOption[] = [
  { value: "time", label: "Most recent" },
  { value: "fee", label: "Fee (high–low)" },
  { value: "bucket", label: "Bucket (A–Z)" },
];

const columns: Column<FeeDistributionLedgerRow>[] = [
  {
    columnId: "time",
    header: "Time",
    width: "120px",
    accessor: "timestamp",
    className: "w-[120px] text-muted-foreground",
    headerClassName: "w-[120px]",
  },
  {
    columnId: "source",
    header: "Source",
    accessor: "source",
    className: "font-medium",
  },
  {
    columnId: "bucket",
    header: "Bucket",
    width: "160px",
    accessor: "bucket",
    className: "w-[160px] text-muted-foreground",
    headerClassName: "w-[160px]",
  },
  {
    columnId: "volume",
    header: "Volume",
    width: "120px",
    accessor: (item) => `$${item.volumeUsd.toLocaleString()}`,
    className: "w-[120px] text-right",
    headerClassName: "w-[120px] text-right",
  },
  {
    columnId: "fee",
    header: "Fee",
    width: "100px",
    accessor: (item) => (
      <span className="font-semibold text-[var(--action-green)]">
        ${item.feeUsd.toLocaleString()}
      </span>
    ),
    className: "w-[100px] text-right",
    headerClassName: "w-[100px] text-right",
  },
  {
    columnId: "status",
    header: "Status",
    width: "112px",
    accessor: (item) => (
      <AppBadge tone={bucketStatusTone(item.status)} appearance="tint" size="table">
        {item.status}
      </AppBadge>
    ),
    className: "w-[112px] text-center",
    headerClassName: "w-[112px] text-center",
  },
];

export default function DistributionLedgerTable() {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("time");

  const filtered = useMemo(() => {
    const rows = feeDistributionLedger.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.source,
        item.bucket,
        item.status,
        item.timestamp,
        String(item.feeUsd),
        String(item.volumeUsd),
      ]);
      return matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "fee":
          return b.feeUsd - a.feeUsd;
        case "bucket":
          return a.bucket.localeCompare(b.bucket);
        case "time":
        default:
          return a.id.localeCompare(b.id);
      }
    });
  }, [search, selectedStatuses, sortBy]);

  return (
    <DashboardTablePanel
      title="Fee Distribution Ledger"
      description="Captured volume and routed fees by source and destination bucket"
      icon={<Money24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Fee distribution ledger"
      emptyMessage="No distribution entries match your filters."
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search distribution entries..."
      searchAriaLabel="Search fee distribution ledger"
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      sortAriaLabel="Sort fee distribution ledger"
      tagOptions={[...statusOptions]}
      selectedTags={selectedStatuses}
      onTagsChange={setSelectedStatuses}
      tagAriaLabel="Selected distribution statuses"
      tagButtonAriaLabel="Filter by distribution status"
    />
  );
}
