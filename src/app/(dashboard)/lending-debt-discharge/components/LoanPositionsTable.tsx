"use client";

import { useMemo, useState } from "react";
import { BuildingBank24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import { loanPositionRows, type LoanPositionRow } from "../data";

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
    width: "120px",
    accessor: (item) => `$${item.collateralUsd.toLocaleString()}`,
    className: "w-[120px] text-right",
    headerClassName: "w-[120px] text-right",
  },
  {
    columnId: "borrowed",
    header: "Borrowed",
    width: "120px",
    accessor: (item) => `$${item.borrowedUsd.toLocaleString()}`,
    className: "w-[120px] text-right font-semibold",
    headerClassName: "w-[120px] text-right",
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
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("borrower");

  const filtered = useMemo(() => {
    const rows = loanPositionRows.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.borrower,
        item.status,
        item.dischargeDate,
        String(item.borrowedUsd),
      ]);
      return matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
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
  }, [search, selectedStatuses, sortBy]);

  return (
    <DashboardTablePanel
      title="Loan Positions"
      description="Active collateral positions, LTV ratios, and discharge timelines"
      icon={<BuildingBank24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Loan positions table"
      emptyMessage="No loan positions match your filters."
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
