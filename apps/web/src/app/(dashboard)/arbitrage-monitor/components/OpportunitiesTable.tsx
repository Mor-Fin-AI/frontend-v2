"use client";

import { useEffect, useMemo, useState } from "react";
import { Lightbulb24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import ChainIcon from "@/components/evm/ChainIcon";
import TablePagination from "@/components/ui/TablePagination";
import { getL2ChainBySlug, type L2ChainSlug } from "@/lib/l2EvmChains";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { useFlashloanOpportunities } from "@/hooks/useFlashloanOpportunities";
import type { FlashloanOpportunityRow } from "@/lib/flashloanOpportunitiesApi";
import type { Column } from "@/components/ui/DataTable";

const actionOptions = ["OPPORTUNITY", "WATCH"] as const;

const sortOptions = [
  { value: "priority", label: "Priority" },
  { value: "profit", label: "Net profit (high–low)" },
  { value: "bps", label: "BPS (high–low)" },
  { value: "confidence", label: "Confidence" },
];

type OpportunityTableRow = FlashloanOpportunityRow & { id: string };

function actionTone(
  action: FlashloanOpportunityRow["action"],
): "success" | "warning" | "danger" | "info" {
  if (action === "OPPORTUNITY") return "success";
  if (action === "WATCH") return "warning";
  return "danger";
}

function riskTone(
  risk: FlashloanOpportunityRow["riskLevel"],
): "success" | "warning" | "danger" {
  if (risk === "LOW") return "success";
  if (risk === "MEDIUM") return "warning";
  return "danger";
}

function topRejectionReasons(rejected: FlashloanOpportunityRow[], limit = 3) {
  const counts = new Map<string, number>();
  for (const row of rejected) {
    for (const reason of row.rejectionReasons) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([reason, count]) => `${reason} (${count})`);
}

const columns: Column<OpportunityTableRow>[] = [
  {
    columnId: "priority",
    header: "#",
    width: "56px",
    accessor: (item) => item.executionPriority || "—",
    className: "text-muted-foreground w-[56px]",
    headerClassName: "w-[56px]",
  },
  {
    columnId: "pair",
    header: "Pair",
    width: "148px",
    accessor: (item) => {
      const chainMeta = getL2ChainBySlug(item.chain);
      const chainSlug = chainMeta?.slug as L2ChainSlug | undefined;
      return (
        <span className="inline-flex items-center gap-2">
          {chainSlug ? (
            <ChainIcon chain={chainSlug} size={18} title={chainMeta?.name} />
          ) : null}
          <span className="font-medium">{item.pair}</span>
        </span>
      );
    },
    className: "w-[148px]",
    headerClassName: "w-[148px]",
  },
  {
    columnId: "route",
    header: "Route",
    accessor: (item) => (
      <span className="text-sm">
        {item.routeDexes[0]} → {item.routeDexes[1]}
      </span>
    ),
    className: "text-muted-foreground",
  },
  {
    columnId: "profit",
    header: "Net profit",
    width: "110px",
    accessor: (item) => (
      <span
        className={
          item.expectedNetProfitUsd > 0
            ? "font-semibold text-[var(--action-green)]"
            : "text-muted-foreground"
        }
      >
        ${item.expectedNetProfitUsd.toFixed(2)}
      </span>
    ),
    className: "text-right w-[110px]",
    headerClassName: "text-right w-[110px]",
  },
  {
    columnId: "bps",
    header: "BPS",
    width: "88px",
    accessor: (item) => (
      <span
        className={
          item.expectedBps > 0
            ? "font-medium text-[var(--action-green)]"
            : "text-muted-foreground"
        }
      >
        {item.expectedBps.toFixed(1)}
      </span>
    ),
    className: "text-right w-[88px]",
    headerClassName: "text-right w-[88px]",
  },
  {
    columnId: "size",
    header: "Size",
    width: "100px",
    accessor: (item) => `$${item.recommendedTradeSizeUsd.toLocaleString()}`,
    className: "text-right text-muted-foreground w-[100px]",
    headerClassName: "text-right w-[100px]",
  },
  {
    columnId: "confidence",
    header: "Conf.",
    width: "72px",
    accessor: (item) => `${Math.round(item.confidenceScore)}`,
    className: "text-right text-muted-foreground w-[72px]",
    headerClassName: "text-right w-[72px]",
  },
  {
    columnId: "risk",
    header: "Risk",
    width: "96px",
    accessor: (item) => (
      <AppBadge tone={riskTone(item.riskLevel)} appearance="tint" size="table">
        {item.riskLevel}
      </AppBadge>
    ),
    className: "text-center w-[96px]",
    headerClassName: "text-center w-[96px]",
  },
  {
    columnId: "action",
    header: "Action",
    width: "128px",
    accessor: (item) => (
      <AppBadge tone={actionTone(item.action)} appearance="tint" size="table">
        {item.action}
      </AppBadge>
    ),
    className: "text-center w-[128px]",
    headerClassName: "text-center w-[128px]",
  },
];

export default function OpportunitiesTable() {
  const [search, setSearch] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("priority");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRejected, setShowRejected] = useState(false);

  const query = useFlashloanOpportunities({ refresh: true });

  const allRows = useMemo(() => {
    const source = showRejected
      ? [...(query.data?.opportunities ?? []), ...(query.data?.rejected ?? [])]
      : (query.data?.opportunities ?? []);

    const mapped: OpportunityTableRow[] = source.map((row, index) => ({
      ...row,
      id: `${row.action}-${row.chain}-${row.pair}-${row.route}-${index}`,
    }));

    const q = search.trim().toLowerCase();
    let filtered = mapped;
    if (q) {
      filtered = filtered.filter(
        (row) =>
          row.pair.toLowerCase().includes(q) ||
          row.route.toLowerCase().includes(q) ||
          row.routeDexes.some((dex) => dex.toLowerCase().includes(q)) ||
          row.chain.toLowerCase().includes(q) ||
          row.action.toLowerCase().includes(q),
      );
    }
    if (selectedActions.length > 0) {
      filtered = filtered.filter((row) => selectedActions.includes(row.action));
    }

    const sorted = [...filtered];
    if (sortBy === "profit") {
      sorted.sort((a, b) => b.expectedNetProfitUsd - a.expectedNetProfitUsd);
    } else if (sortBy === "bps") {
      sorted.sort((a, b) => b.expectedBps - a.expectedBps);
    } else if (sortBy === "confidence") {
      sorted.sort((a, b) => b.confidenceScore - a.confidenceScore);
    } else {
      sorted.sort((a, b) => {
        if (a.action === "REJECT" && b.action !== "REJECT") return 1;
        if (b.action === "REJECT" && a.action !== "REJECT") return -1;
        return a.executionPriority - b.executionPriority;
      });
    }
    return sorted;
  }, [
    query.data?.opportunities,
    query.data?.rejected,
    search,
    selectedActions,
    sortBy,
    showRejected,
  ]);

  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const rows = allRows.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pageSize, selectedActions, showRejected]);

  const scan = query.data?.liveQuoteScan;
  const rejectionHints = topRejectionReasons(query.data?.rejected ?? []);
  const description = query.isError
    ? "Could not load live flashloan opportunities"
    : query.isLoading && !query.data
      ? "Scanning live DEX quotes across Arbitrum, Base, and Optimism…"
      : [
          "Recommend-only live flashloan opportunities (Smart Router + fee gates)",
          scan
            ? `· quotes ${scan.quotesSucceeded}/${scan.quotesAttempted}`
            : null,
          query.data
            ? `· ${query.data.opportunitiesFound} qualified / ${query.data.candidatesEvaluated} evaluated`
            : null,
        ]
          .filter(Boolean)
          .join(" ");

  const emptyMessage = query.isLoading
    ? "Scanning opportunities…"
    : query.isError
      ? "Failed to load opportunities. Check VITE_API_URL and API health."
      : showRejected
        ? "No candidates matched your filters."
        : rejectionHints.length > 0
          ? `No qualified opportunities yet. Top reject reasons: ${rejectionHints.join(", ")}. Toggle “Show rejected” to inspect.`
          : "No qualified opportunities right now. Live quotes may be flat after gas + flashloan fees.";

  return (
    <div className="flex flex-col gap-0">
      <DashboardTablePanel
        title="Opportunities"
        description={description}
        icon={<Lightbulb24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
        columns={columns}
        rows={rows}
        getRowId={(item) => item.id}
        ariaLabel="Flashloan opportunities"
        emptyMessage={emptyMessage}
        isLoading={query.isLoading && !query.data}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search pairs, routes, chains..."
        searchAriaLabel="Search flashloan opportunities"
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
        sortAriaLabel="Sort flashloan opportunities"
        tagOptions={[...actionOptions, ...(showRejected ? (["REJECT"] as const) : [])]}
        selectedTags={selectedActions}
        onTagsChange={setSelectedActions}
        tagAriaLabel="Selected opportunity actions"
        tagButtonAriaLabel="Filter by opportunity action"
        headerAction={
          <button
            type="button"
            onClick={() => setShowRejected((value) => !value)}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/60"
          >
            {showRejected ? "Hide rejected" : "Show rejected"}
          </button>
        }
        animate={false}
      />

      <div className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4">
        <TablePagination
          page={pageSafe}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={query.isFetching}
        />
      </div>
    </div>
  );
}
