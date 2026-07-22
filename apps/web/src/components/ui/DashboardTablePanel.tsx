"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import type { CardHeaderProps, TableRowId } from "@fluentui/react-components";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import TableFilterToolbar, {
  TableEmptyState,
  type TableFilterToolbarProps,
} from "@/components/ui/TableFilterToolbar";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export type DashboardTablePanelProps<T> = {
  title: string;
  description?: string;
  icon: React.ReactNode;
  columns: Column<T>[];
  rows: T[];
  getRowId: (item: T, index: number) => TableRowId;
  ariaLabel: string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingRowCount?: number;
  loadingLabel?: string;
  headerAction?: CardHeaderProps["action"];
  selectionMode?: "none" | "multiselect";
  animate?: boolean;
} & TableFilterToolbarProps;

export default function DashboardTablePanel<T>({
  title,
  description,
  icon,
  columns,
  rows,
  getRowId,
  ariaLabel,
  emptyMessage = "No results found.",
  isLoading = false,
  loadingRowCount = 6,
  loadingLabel,
  headerAction,
  selectionMode = "none",
  animate = true,
  showDateRange = false,
  ...filterProps
}: DashboardTablePanelProps<T>) {
  const { ref, controls } = useScrollAnimation();

  const content = (
    <PanelCard aria-busy={isLoading}>
      <PanelCardTopBar>
        <PanelCardTopIcon>{icon}</PanelCardTopIcon>
      </PanelCardTopBar>

      <PanelCardHeader
        title={title}
        description={description}
        action={headerAction}
      />

      <PanelCardBody>
        <TableFilterToolbar showDateRange={showDateRange} {...filterProps} />

        {isLoading ? (
          <DataTable
            aria-label={ariaLabel}
            columns={columns}
            data={[]}
            getRowId={getRowId}
            selectionMode={selectionMode}
            isLoading
            loadingLabel={loadingLabel ?? `Loading ${title.toLowerCase()}`}
            loadingRowCount={loadingRowCount}
          />
        ) : rows.length > 0 ? (
          <DataTable
            aria-label={ariaLabel}
            columns={columns}
            data={rows}
            getRowId={getRowId}
            selectionMode={selectionMode}
          />
        ) : (
          <TableEmptyState message={emptyMessage} />
        )}
      </PanelCardBody>
    </PanelCard>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className="flex flex-col gap-7"
    >
      {content}
    </motion.div>
  );
}
