"use client";

import { useMemo, useState } from "react";
import { People24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import {
  cohortCertificationRows,
  type CohortCertificationRow,
} from "../data";

const statusOptions = ["Active", "Graduated", "Pending"] as const;

const sortOptions: TableSortOption[] = [
  { value: "cohort", label: "Cohort (A–Z)" },
  { value: "learners", label: "Learners (high–low)" },
  { value: "certs", label: "Certifications (high–low)" },
];

function statusTone(
  status: CohortCertificationRow["status"]
): "success" | "brand" | "warning" {
  if (status === "Graduated") return "success";
  if (status === "Pending") return "warning";
  return "brand";
}

const columns: Column<CohortCertificationRow>[] = [
  {
    columnId: "cohort",
    header: "Cohort",
    accessor: "cohort",
    className: "font-medium",
  },
  {
    columnId: "learners",
    header: "Learners",
    width: "96px",
    accessor: "learners",
    className: "w-[96px] text-center",
    headerClassName: "w-[96px] text-center",
  },
  {
    columnId: "modules",
    header: "Modules",
    width: "96px",
    accessor: "modulesCompleted",
    className: "w-[96px] text-center text-muted-foreground",
    headerClassName: "w-[96px] text-center",
  },
  {
    columnId: "certs",
    header: "Certs",
    width: "88px",
    accessor: "certifications",
    className: "w-[88px] text-center font-semibold text-[var(--action-green)]",
    headerClassName: "w-[88px] text-center",
  },
  {
    columnId: "nfts",
    header: "NFTs",
    width: "80px",
    accessor: "nftsMinted",
    className: "w-[80px] text-center",
    headerClassName: "w-[80px] text-center",
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

export default function CohortCertificationTable() {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("cohort");

  const filtered = useMemo(() => {
    const rows = cohortCertificationRows.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.cohort,
        item.status,
        String(item.learners),
        String(item.certifications),
      ]);
      return matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "learners":
          return b.learners - a.learners;
        case "certs":
          return b.certifications - a.certifications;
        case "cohort":
        default:
          return a.cohort.localeCompare(b.cohort);
      }
    });
  }, [search, selectedStatuses, sortBy]);

  return (
    <DashboardTablePanel
      title="Cohort & Certification Registry"
      description="Active cohorts with module completion, certifications, and NFT issuance"
      icon={<People24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Cohort certification registry"
      emptyMessage="No cohorts match your filters."
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search cohorts..."
      searchAriaLabel="Search cohort registry"
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      sortAriaLabel="Sort cohort registry"
      tagOptions={[...statusOptions]}
      selectedTags={selectedStatuses}
      onTagsChange={setSelectedStatuses}
      tagAriaLabel="Selected cohort statuses"
      tagButtonAriaLabel="Filter by cohort status"
    />
  );
}
