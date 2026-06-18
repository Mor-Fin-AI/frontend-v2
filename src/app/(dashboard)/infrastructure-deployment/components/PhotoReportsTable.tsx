"use client";

import { useMemo, useState } from "react";
import { Image24Regular } from "@fluentui/react-icons";
import DashboardTablePanel from "@/components/ui/DashboardTablePanel";
import AppBadge from "@/components/ui/AppBadge";
import { TABLE_ICON_CLASS } from "@/lib/tableUi";
import { matchesSearch, matchesTags, type TableSortOption } from "@/lib/tableFilters";
import type { Column } from "@/components/ui/DataTable";
import {
  infrastructureDeploymentMetrics,
  photoReportStatusTone,
  type PhotoUpdateReport,
} from "../data";

const statusOptions = ["Published", "Pending Review"] as const;

const sortOptions: TableSortOption[] = [
  { value: "title", label: "Title (A–Z)" },
  { value: "region", label: "Region (A–Z)" },
  { value: "photos", label: "Photos (high–low)" },
];

const columns: Column<PhotoUpdateReport>[] = [
  {
    columnId: "title",
    header: "Report",
    accessor: "title",
    className: "font-medium",
  },
  {
    columnId: "region",
    header: "Region",
    width: "160px",
    accessor: "region",
    className: "w-[160px] text-muted-foreground",
    headerClassName: "w-[160px]",
  },
  {
    columnId: "photos",
    header: "Photos",
    width: "88px",
    accessor: (item) => item.photoCount,
    className: "w-[88px] text-center",
    headerClassName: "w-[88px] text-center",
  },
  {
    columnId: "uploaded",
    header: "Uploaded",
    width: "120px",
    accessor: "uploadedAt",
    className: "w-[120px] text-muted-foreground",
    headerClassName: "w-[120px]",
  },
  {
    columnId: "status",
    header: "Status",
    width: "140px",
    accessor: (item) => (
      <AppBadge
        tone={photoReportStatusTone(item.status)}
        appearance="tint"
        size="table"
      >
        {item.status}
      </AppBadge>
    ),
    className: "w-[140px] text-center",
    headerClassName: "w-[140px] text-center",
  },
];

export default function PhotoReportsTable() {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("title");

  const reports = infrastructureDeploymentMetrics.recentPhotoReports;

  const filtered = useMemo(() => {
    const rows = reports.filter((item) => {
      const matchesStatus = matchesTags(selectedStatuses, item.status);
      const matchesQuery = matchesSearch(search, [
        item.title,
        item.region,
        item.status,
        item.uploadedAt,
        String(item.photoCount),
      ]);
      return matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case "region":
          return a.region.localeCompare(b.region);
        case "photos":
          return b.photoCount - a.photoCount;
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [reports, search, selectedStatuses, sortBy]);

  return (
    <DashboardTablePanel
      title="Photo Update Reports"
      description="Field documentation submitted by site teams with review status"
      icon={<Image24Regular className={`h-5 w-5 ${TABLE_ICON_CLASS}`} />}
      columns={columns}
      rows={filtered}
      getRowId={(item) => item.id}
      ariaLabel="Photo update reports table"
      emptyMessage="No photo reports match your filters."
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search photo reports..."
      searchAriaLabel="Search photo reports"
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      sortAriaLabel="Sort photo reports"
      tagOptions={[...statusOptions]}
      selectedTags={selectedStatuses}
      onTagsChange={setSelectedStatuses}
      tagAriaLabel="Selected report statuses"
      tagButtonAriaLabel="Filter by report status"
    />
  );
}
