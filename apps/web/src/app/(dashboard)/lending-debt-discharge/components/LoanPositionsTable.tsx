"use client";

import { useMemo, useState } from "react";
import { BuildingBank24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import { useLendingDischargeData } from "@/hooks/useLendingDischarge";
import { mapLiveLoanPositions } from "@/lib/lendingApi";
import type { LoanPositionRow } from "../data";

const statusOptions = ["Active", "Discharging", "Repaid"] as const;

const sortOptions: TableSortOption[] = [
  { value: "borrower", label: "Borrower (A–Z)" },
  { value: "borrowed", label: "Borrowed (high–low)" },
  { value: "repayment", label: "Repayment % (high–low)" },
];

function statusTone(
  status: LoanPositionRow["status"]
): "success" | "warning" | "brand" {
  if (status === "Repaid") return "success";
  if (status === "Discharging") return "warning";
  return "brand";
}

function formatAmount(item: LoanPositionRow, field: "collateral" | "borrowed") {
  if (item.isLive) {
    return field === "collateral"
      ? (item.collateralLabel ?? `${item.collateralUsd} ETH`)
      : (item.borrowedLabel ?? `${item.borrowedUsd} WETH`);
  }
  return field === "collateral"
    ? `$${item.collateralUsd.toLocaleString()}`
    : `$${item.borrowedUsd.toLocaleString()}`;
}

const columns: Column<LoanPositionRow>[] = [
  {
    columnId: "borrower",
    header: "Borrower",
    accessor: "borrower",
    className: "font-medium",
  },
  {
    columnId: "collateral",
    header: "Collateral",
    width: "140px",
    accessor: (item) => formatAmount(item, "collateral"),
    className: "w-[140px] text-right",
    headerClassName: "w-[140px] text-right",
  },
  {
    columnId: "borrowed",
    header: "Borrowed",
    width: "160px",
    accessor: (item) => formatAmount(item, "borrowed"),
    className: "w-[160px] text-right font-semibold",
    headerClassName: "w-[160px] text-right",
  },
  {
    columnId: "ltv",
    header: "LTV",
    width: "72px",
    accessor: (item) => `${item.ltvPercent}%`,
    className: "w-[72px] text-center text-muted-foreground",
    headerClassName: "w-[72px] text-center",
  },
  {
    columnId: "repayment",
    header: "Repaid",
    width: "88px",
    accessor: (item) => `${item.repaymentPercent}%`,
    className: "w-[88px] text-center font-semibold text-[var(--action-green)]",
    headerClassName: "w-[88px] text-center",
  },
  {
    columnId: "discharge",
    header: "Discharge",
    width: "120px",
    accessor: "dischargeDate",
    className: "w-[120px] text-muted-foreground",
    headerClassName: "w-[120px]",
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
    className: "w-[112px] text-center",
    headerClassName: "w-[112px] text-center",
  },
];

export default function LoanPositionsTable() {
  const liveQuery = useLendingDischargeData();
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("borrower");

  const rows = useMemo(() => {
    if (!liveQuery.data?.loanPositions) return [];
    return mapLiveLoanPositions(liveQuery.data.loanPositions);
  }, [liveQuery.data?.loanPositions]);

  const filtered = useMemo(() => {
    const filteredRows = rows.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.borrower,
        item.status,
        item.dischargeDate,
        String(item.borrowedUsd),
        item.borrowedLabel ?? "",
      ]);
      return matchesStatus && matchesQuery;
    });

    return [...filteredRows].sort((a, b) => {
      switch (sortBy) {
        case "borrowed":
          return b.borrowedUsd - a.borrowedUsd;
        case "repayment":
          return b.repaymentPercent - a.repaymentPercent;
        case "borrower":
        default:
          return a.borrower.localeCompare(b.borrower);
      }
    });
  }, [rows, search, selectedStatuses, sortBy]);

  const description = liveQuery.isError
    ? "Could not load loan positions from chain"
    : liveQuery.isLoading
      ? "Loading MorDSA positions from MorTreasuryFlowPanel…"
      : "Live collateral positions, LTV ratios, and discharge timelines";

  return (
    <DashboardTablePanel
      title="Loan Positions"
      description={description}
      icon={<BuildingBank24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Loan positions table"
      emptyMessage={
        liveQuery.isLoading
          ? "Loading loan positions…"
          : liveQuery.isError
            ? "Failed to load loan positions."
            : "No loan positions on-chain yet."
      }
      isLoading={liveQuery.isLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search loan positions..."
      searchAriaLabel="Search loan positions"
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      sortAriaLabel="Sort loan positions"
      tagOptions={[...statusOptions]}
      selectedTags={selectedStatuses}
      onTagsChange={setSelectedStatuses}
      tagAriaLabel="Selected loan statuses"
      tagButtonAriaLabel="Filter by loan status"
    />
  );
}
