"use client";

import { useMemo, useState } from "react";
import { ReceiptMoney24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import {
  treasuryLedgerRows,
  type TreasuryLedgerRow,
} from "../treasuryData";

const typeOptions = [
  "Fee Inflow",
  "Borrowing",
  "Discharge",
  "Recycling",
  "Distribution",
] as const;

const sortOptions: TableSortOption[] = [
  { value: "timestamp", label: "Most recent" },
  { value: "amount", label: "Amount (high–low)" },
  { value: "type", label: "Type (A–Z)" },
];

function typeTone(
  type: TreasuryLedgerRow["type"]
): "success" | "brand" | "warning" | "info" | "neutral" {
  switch (type) {
    case "Fee Inflow":
      return "success";
    case "Borrowing":
      return "brand";
    case "Discharge":
      return "warning";
    case "Recycling":
      return "info";
    default:
      return "neutral";
  }
}

function statusTone(
  status: TreasuryLedgerRow["status"]
): "success" | "warning" | "neutral" {
  if (status === "Settled") return "success";
  if (status === "Processing") return "warning";
  return "neutral";
}

const columns: Column<TreasuryLedgerRow>[] = [
  {
    columnId: "timestamp",
    header: "Time",
    width: "120px",
    accessor: "timestamp",
    className: "text-muted-foreground w-[120px]",
    headerClassName: "w-[120px]",
  },
  {
    columnId: "type",
    header: "Type",
    width: "140px",
    accessor: (item) => (
      <AppBadge tone={typeTone(item.type)} appearance="tint" size="table">
        {item.type}
      </AppBadge>
    ),
    className: "w-[140px]",
    headerClassName: "w-[140px]",
  },
  {
    columnId: "flow",
    header: "Flow",
    accessor: (item) => (
      <span className="text-muted-foreground">
        {item.source} → {item.destination}
      </span>
    ),
  },
  {
    columnId: "amount",
    header: "Amount",
    width: "120px",
    accessor: (item) => (
      <span className="font-semibold text-foreground">
        ${item.amountUsd.toLocaleString()}
      </span>
    ),
    className: "text-right w-[120px]",
    headerClassName: "text-right w-[120px]",
  },
  {
    columnId: "status",
    header: "Status",
    width: "112px",
    accessor: (item) => (
      <AppBadge tone={statusTone(item.status)} appearance="tint" size="table">
        {item.status}
      </AppBadge>
    ),
    className: "text-center w-[112px]",
    headerClassName: "text-center w-[112px]",
  },
];

export default function TreasuryLedgerTable({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("timestamp");

  const filtered = useMemo(() => {
    const rows = treasuryLedgerRows.filter((item) => {
      const matchesType = matchesTags(selectedTypes, item.type);
      const matchesQuery = matchesSearch(search, [
        item.type,
        item.source,
        item.destination,
        item.status,
        item.timestamp,
        String(item.amountUsd),
      ]);
      return matchesType && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amountUsd - a.amountUsd;
        case "type":
          return a.type.localeCompare(b.type);
        case "timestamp":
        default:
          return a.id.localeCompare(b.id);
      }
    });
  }, [search, selectedTypes, sortBy]);

  return (
    <DashboardTablePanel
      title="Treasury Movement Ledger"
      description="Recent inflows, borrowings, discharges, and capital recycling events"
      icon={<ReceiptMoney24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Treasury movement ledger"
      emptyMessage="No ledger entries match your filters."
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search ledger entries..."
      searchAriaLabel="Search treasury ledger"
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      sortAriaLabel="Sort treasury ledger"
      tagOptions={[...typeOptions]}
      selectedTags={selectedTypes}
      onTagsChange={setSelectedTypes}
      tagAriaLabel="Selected ledger types"
      tagButtonAriaLabel="Filter by ledger type"
    />
  );
}
