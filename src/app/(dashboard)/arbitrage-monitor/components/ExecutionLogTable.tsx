"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowSwap24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import ChainIcon from "@/components/evm/ChainIcon";
import DexRouteDisplay from "@/components/evm/DexRouteDisplay";
import TablePagination from "@/components/ui/TablePagination";
import { getL2ChainBySlug } from "@/lib/l2EvmChains";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { useArbitrageExecutions } from "@/hooks/useArbitrageExecutions";
import { mapLiveArbitrageExecutions } from "@/lib/arbitrageApi";
import type { Column } from "@/components/ui/DataTable";
import type { ArbitrageExecutionRow } from "../data";

const statusOptions = ["Executed", "Skipped", "Failed"] as const;

const sortOptions = [
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
    width: "140px",
    accessor: "executedAt",
    className: "text-muted-foreground w-[140px]",
    headerClassName: "w-[140px]",
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const liveQuery = useArbitrageExecutions({
    page,
    pageSize,
    search,
    sortBy,
  });

  const rows = useMemo(() => {
    if (!liveQuery.data?.executions) return [];
    const mapped = mapLiveArbitrageExecutions(liveQuery.data.executions);
    if (selectedStatuses.length === 0) return mapped;
    return mapped.filter((row) => selectedStatuses.includes(row.status));
  }, [liveQuery.data?.executions, selectedStatuses]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pageSize]);

  const description = liveQuery.isError
    ? "Could not load on-chain MorDSA cast transactions"
    : liveQuery.isLoading && !liveQuery.data
      ? "Loading live MorDSA spell casts from Arbitrum…"
      : "Live MorDSA cast transactions with route, profit, and gas details";

  return (
    <div className="flex flex-col gap-0">
      <DashboardTablePanel
        title="Execution Log"
        description={description}
        icon={<ArrowSwap24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
        columns={columns}
        rows={rows}
        getRowId={(item) => item.id}
        ariaLabel="Arbitrage execution log"
        emptyMessage={
          liveQuery.isLoading
            ? "Loading executions…"
            : liveQuery.isError
              ? "Failed to load live executions."
              : "No on-chain executions match your filters."
        }
        isLoading={liveQuery.isLoading && !liveQuery.data}
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
        animate={false}
      />

      <div className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4">
        <TablePagination
          page={liveQuery.data?.page ?? page}
          pageSize={liveQuery.data?.pageSize ?? pageSize}
          total={liveQuery.data?.total ?? 0}
          totalPages={liveQuery.data?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={liveQuery.isFetching}
          itemLabel="executions"
        />
      </div>
    </div>
  );
}
