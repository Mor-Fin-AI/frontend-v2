"use client";

import { useMemo, useState } from "react";
import { ArrowSwap24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import ChainIcon from "@/components/evm/ChainIcon";
import DexRouteDisplay from "@/components/evm/DexRouteDisplay";
import { getL2ChainBySlug } from "@/lib/l2EvmChains";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import {
  arbitrageExecutionLog,
  type ArbitrageExecutionRow,
} from "../data";

const statusOptions = ["Executed", "Skipped", "Failed"] as const;

const sortOptions: TableSortOption[] = [
  { value: "time", label: "Most recent" },
  { value: "profit", label: "Profit (high–low)" },
  { value: "pair", label: "Pair (A–Z)" },
];

function statusTone(
  status: ArbitrageExecutionRow["status"]
): "success" | "warning" | "danger" {
  if (status === "Executed") return "success";
  if (status === "Skipped") return "warning";
  return "danger";
}

const columns: Column<ArbitrageExecutionRow>[] = [
  {
    columnId: "time",
    header: "Time",
    width: "88px",
    accessor: "executedAt",
    className: "text-muted-foreground w-[88px]",
    headerClassName: "w-[88px]",
  },
  {
    columnId: "pair",
    header: "Pair",
    width: "148px",
    accessor: (item) => (
      <span className="inline-flex items-center gap-2">
        <ChainIcon
          chain={item.chain}
          size={18}
          title={getL2ChainBySlug(item.chain)?.name}
        />
        <span className="font-medium">{item.pair}</span>
      </span>
    ),
    className: "w-[148px]",
    headerClassName: "w-[148px]",
  },
  {
    columnId: "route",
    header: "Route",
    accessor: (item) => (
      <DexRouteDisplay route={item.route} dexes={[...item.routeDexes]} />
    ),
    className: "text-muted-foreground",
  },
  {
    columnId: "profit",
    header: "Profit",
    width: "100px",
    accessor: (item) => (
      <span
        className={
          item.profitUsd > 0
            ? "font-semibold text-[var(--action-green)]"
            : "text-muted-foreground"
        }
      >
        ${item.profitUsd.toFixed(2)}
      </span>
    ),
    className: "text-right w-[100px]",
    headerClassName: "text-right w-[100px]",
  },
  {
    columnId: "gas",
    header: "Gas",
    width: "88px",
    accessor: (item) => `$${item.gasUsd.toFixed(2)}`,
    className: "text-right text-muted-foreground w-[88px]",
    headerClassName: "text-right w-[88px]",
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

export default function ExecutionLogTable() {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("time");

  const filtered = useMemo(() => {
    const rows = arbitrageExecutionLog.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.pair,
        item.route,
        item.status,
        item.executedAt,
        String(item.profitUsd),
      ]);
      return matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "profit":
          return b.profitUsd - a.profitUsd;
        case "pair":
          return a.pair.localeCompare(b.pair);
        case "time":
        default:
          return a.id.localeCompare(b.id);
      }
    });
  }, [search, selectedStatuses, sortBy]);

  return (
    <DashboardTablePanel
      title="Execution Log"
      description="Recent arbitrage attempts with route, profit, and gas details"
      icon={<ArrowSwap24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Arbitrage execution log"
      emptyMessage="No executions match your filters."
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search executions..."
      searchAriaLabel="Search arbitrage executions"
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      sortAriaLabel="Sort arbitrage executions"
      tagOptions={[...statusOptions]}
      selectedTags={selectedStatuses}
      onTagsChange={setSelectedStatuses}
      tagAriaLabel="Selected execution statuses"
      tagButtonAriaLabel="Filter by execution status"
    />
  );
}
