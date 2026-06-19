"use client";

import { useMemo, useState } from "react";
import {
  ArrowSwap24Regular,
  DocumentText24Regular,
  Wallet24Regular,
} from "@fluentui/react-icons";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard, { PanelCardBody, PanelCardHeader } from "@/components/ui/PanelCard";
import TableFilterToolbar, { TableEmptyState } from "@/components/ui/TableFilterToolbar";
import AppBadge from "@/components/ui/AppBadge";
import { dsaTransactionStatusTone } from "@/lib/badgeTones";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { DsaTransaction } from "./data";
import clsx from "clsx";
import {
  compareDates,
  matchesDateRange,
  matchesSearch,
  matchesTags,
  type TableSortOption,
} from "@/lib/tableFilters";

const statusOptions = ["Completed", "Pending"];
const typeOptions = [
  "Reward Credit",
  "Stake Deposit",
  "Membership Fee",
  "Project Disbursement",
  "Treasury Deposit",
  "Escrow Release",
  "Team Allocation",
];

const transactionSortOptions: TableSortOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "type", label: "Type (A–Z)" },
  { value: "status", label: "Status (A–Z)" },
  { value: "amount-high", label: "Amount (high to low)" },
  { value: "amount-low", label: "Amount (low to high)" },
];

const typeIcon = (type: string) => {
  if (type.toLowerCase().includes("reward")) {
    return <DocumentText24Regular className={TABLE_ICON_CLASS} />;
  }
  if (type.toLowerCase().includes("deposit") || type.toLowerCase().includes("treasury")) {
    return <Wallet24Regular className={TABLE_ICON_CLASS} />;
  }
  return <ArrowSwap24Regular className={TABLE_ICON_CLASS} />;
};

function parseAmount(amount: string): number {
  const normalized = amount.replace(/[^0-9.-]/g, "");
  return Number.parseFloat(normalized) || 0;
}

const columns: Column<DsaTransaction>[] = [
  {
    columnId: "id",
    header: "Transaction ID",
    accessor: "id",
    media: () => <DocumentText24Regular className={TABLE_ICON_CLASS} />,
  },
  { columnId: "date", header: "Date", accessor: "date" },
  {
    columnId: "type",
    header: "Type",
    accessor: "type",
    media: (row) => typeIcon(row.type),
  },
  {
    columnId: "amount",
    header: "Amount",
    accessor: (row) => (
      <span
        className={clsx(
          "font-medium",
          row.amount.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
        )}
      >
        {row.amount}
      </span>
    ),
  },
  {
    columnId: "status",
    header: "Status",
    accessor: (row) => (
      <AppBadge
        tone={dsaTransactionStatusTone[row.status] ?? "neutral"}
        appearance="tint"
        size="table"
      >
        {row.status}
      </AppBadge>
    ),
  },
  {
    columnId: "reference",
    header: "Reference",
    accessor: "reference",
    className: "max-w-[200px] truncate",
  },
];

export default function DsaTransactionHistory({
  transactions,
  isLoading = false,
  emptyMessage = "No transactions found.",
}: {
  transactions: DsaTransaction[];
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const availableTypeOptions = useMemo(
    () => [...new Set([...typeOptions, ...transactions.map((item) => item.type)])],
    [transactions],
  );

  const filtered = useMemo(() => {
    const rows = transactions.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesType = matchesTags(selectedTypes, item.type);
      const matchesQuery = matchesSearch(search, [
        item.id,
        item.date,
        item.type,
        item.amount,
        item.status,
        item.reference,
      ]);
      const matchesDates = matchesDateRange(item.date, startDate, endDate);
      return matchesStatus && matchesType && matchesQuery && matchesDates;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return compareDates(a.date, b.date);
        case "type":
          return a.type.localeCompare(b.type);
        case "status":
          return a.status.localeCompare(b.status);
        case "amount-high":
          return parseAmount(b.amount) - parseAmount(a.amount);
        case "amount-low":
          return parseAmount(a.amount) - parseAmount(b.amount);
        case "newest":
        default:
          return compareDates(b.date, a.date);
      }
    });
  }, [transactions, search, selectedStatuses, selectedTypes, sortBy, startDate, endDate]);

  return (
    <PanelCard aria-busy={isLoading}>
      <PanelCardHeader title="Transaction History" headingAs="h4" description="Recent DSA wallet activity" />
      <PanelCardBody>
        <TableFilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search ID, type, amount, reference..."
          searchAriaLabel="Search transaction history"
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={transactionSortOptions}
          sortAriaLabel="Sort transaction history"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          tagOptions={[...availableTypeOptions, ...statusOptions]}
          selectedTags={[...selectedTypes, ...selectedStatuses]}
          onTagsChange={(tags) => {
            setSelectedTypes(tags.filter((tag) => availableTypeOptions.includes(tag)));
            setSelectedStatuses(tags.filter((tag) => statusOptions.includes(tag)));
          }}
          tagAriaLabel="Selected transaction filters"
          tagButtonAriaLabel="Filter by type or status"
        />

        {isLoading ? (
          <DataTable
            columns={columns}
            data={[]}
            getRowId={(item) => item.id}
            selectionMode="multiselect"
            aria-label="DSA transaction history"
            isLoading
            loadingLabel="Loading transaction history"
            loadingRowCount={6}
          />
        ) : filtered.length > 0 ? (
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(item) => item.id}
            selectionMode="multiselect"
            aria-label="DSA transaction history"
          />
        ) : (
          <TableEmptyState message={emptyMessage} />
        )}
      </PanelCardBody>
    </PanelCard>
  );
}
