"use client";

import React, { useCallback, useMemo, useState } from "react";
import DataTableSkeleton from "@/components/ui/skeletons/DataTableSkeleton";
import AppSpinner from "@/components/ui/AppSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  createTableColumn,
  useTableFeatures,
  useTableSelection,
  makeStyles,
  mergeClasses,
  tokens,
  tableClassNames,
  tableHeaderCellClassNames,
  tableCellClassNames,
  tableRowClassNames,
  type TableColumnDefinition,
  type TableRowId,
} from "@fluentui/react-components";

export interface Column<T> {
  columnId?: string;
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  media?: (item: T) => React.ReactNode;
  description?: (item: T) => string | undefined;
  className?: string;
  headerClassName?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
  getRowId?: (item: T, index: number) => TableRowId;
  selectionMode?: "none" | "multiselect";
  defaultSelectedRows?: Iterable<TableRowId>;
  selectedRows?: Set<TableRowId>;
  onSelectionChange?: (selectedItems: Set<TableRowId>) => void;
  isLoading?: boolean;
  loadingRowCount?: number;
  loadingLabel?: string;
  loadingMode?: "skeleton" | "spinner";
  "aria-label"?: string;
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    width: "100%",
    minWidth: 0,
    flexDirection: "column",
  },
  headerWrapper: {
    width: "100%",
    minWidth: 0,
    overflowX: "hidden",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    marginBottom: tokens.spacingVerticalXS,
  },
  wrapper: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflowX: "auto",
    overflowY: "visible",
    WebkitOverflowScrolling: "touch",
  },
  table: {
    width: "100%",
    tableLayout: "fixed",
    minWidth: "100%",
    backgroundColor: "transparent",
    boxShadow: "none",
    border: "none",
    [`& .${tableClassNames.root}`]: {
      border: "none",
      boxShadow: "none",
    },
    [`& .${tableHeaderCellClassNames.root}`]: {
      border: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
    },
    [`& .${tableCellClassNames.root}`]: {
      border: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
    },
    [`& .${tableRowClassNames.root}`]: {
      transitionProperty: "background-color",
      transitionDuration: "150ms",
      backgroundColor: "transparent",
      ":hover": {
        backgroundColor: "var(--table-row-hover)",
      },
    },
    [`& .${tableRowClassNames.root}[aria-selected="true"]`]: {
      backgroundColor: "var(--table-row-selected)",
      ":hover": {
        backgroundColor: "var(--table-row-selected)",
      },
    },
  },
  headerRow: {
    borderTop: "none",
    borderBottom: "none",
    backgroundColor: "transparent",
    ":hover": {
      backgroundColor: "transparent",
    },
  },
  headerCell: {
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightMedium,
    fontSize: tokens.fontSizeBase200,
    border: "none",
    backgroundColor: "transparent",
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: 0,
    paddingRight: tokens.spacingHorizontalM,
    ":last-child": {
      paddingRight: 0,
    },
  },
  rowInteractive: {
    cursor: "pointer",
  },
  cell: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    border: "none",
    backgroundColor: "transparent",
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: 0,
    paddingRight: tokens.spacingHorizontalM,
    verticalAlign: "middle",
    ":last-child": {
      paddingRight: 0,
    },
    "& [data-slot='badge']": {
      fontSize: tokens.fontSizeBase200,
      lineHeight: tokens.lineHeightBase200,
      fontWeight: tokens.fontWeightRegular,
      minHeight: "20px",
      height: "20px",
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: tokens.spacingHorizontalXS,
      paddingRight: tokens.spacingHorizontalXS,
      borderRadius: tokens.borderRadiusSmall,
      verticalAlign: "middle",
    },
    "& [data-slot='badge'] svg": {
      width: "10px",
      height: "10px",
    },
  },
  mediaIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorNeutralForeground3,
    "& svg": {
      width: "20px",
      height: "20px",
      color: "inherit",
    },
  },
});

function getCellContent<T>(column: Column<T>, item: T) {
  return typeof column.accessor === "function"
    ? column.accessor(item)
    : (item[column.accessor] as React.ReactNode);
}

function renderCellContent<T>(
  column: Column<T>,
  item: T,
  mediaIconClass?: string
) {
  const content = getCellContent(column, item);
  const media = column.media?.(item);
  const description = column.description?.(item);
  const wrappedMedia =
    media && mediaIconClass ? (
      <span className={mediaIconClass}>{media}</span>
    ) : (
      media
    );

  if (wrappedMedia || description) {
    const label =
      typeof content === "string" || typeof content === "number"
        ? content
        : (content as React.ReactElement);

    return (
      <TableCellLayout
        media={wrappedMedia as React.ReactElement | undefined}
        description={description}
      >
        {label}
      </TableCellLayout>
    );
  }

  if (typeof content === "string" || typeof content === "number") {
    return <TableCellLayout>{content}</TableCellLayout>;
  }

  return content;
}

function useTableColumns<T>(columns: Column<T>[]) {
  return useMemo<TableColumnDefinition<T>[]>(
    () =>
      columns.map((column, index) =>
        createTableColumn<T>({
          columnId: column.columnId ?? `col-${index}`,
        })
      ),
    [columns]
  );
}

function defaultGetRowId<T>(item: T, index: number): TableRowId {
  const record = item as { id?: string | number };
  return record.id ?? index;
}

function TableColGroup<T>({
  columns,
  hasSelection = false,
}: {
  columns: Column<T>[];
  hasSelection?: boolean;
}) {
  return (
    <colgroup>
      {hasSelection ? <col style={{ width: "44px" }} /> : null}
      {columns.map((column, index) => (
        <col
          key={column.columnId ?? `col-${index}`}
          style={column.width ? { width: column.width } : undefined}
        />
      ))}
    </colgroup>
  );
}

function renderHeaderCell<T>(
  column: Column<T>,
  styles: ReturnType<typeof useStyles>
) {
  if (column.media) {
    return (
      <TableCellLayout
        media={
          <span className={styles.mediaIcon} aria-hidden>
            <span className="inline-block h-5 w-5" />
          </span>
        }
      >
        {column.header}
      </TableCellLayout>
    );
  }

  return column.header;
}

type DataTableLayoutProps<T> = {
  columns: Column<T>[];
  styles: ReturnType<typeof useStyles>;
  className?: string;
  ariaLabel?: string;
  selectionHeader?: React.ReactNode;
  body: React.ReactNode;
  wrapBodyInTable?: boolean;
};

function DataTableLayout<T>({
  columns,
  styles,
  className,
  ariaLabel = "Data table",
  selectionHeader,
  body,
  wrapBodyInTable = true,
}: DataTableLayoutProps<T>) {
  const headerScrollRef = React.useRef<HTMLDivElement>(null);
  const bodyScrollRef = React.useRef<HTMLDivElement>(null);

  const handleBodyScroll = useCallback(() => {
    const header = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (header && bodyEl) {
      header.scrollLeft = bodyEl.scrollLeft;
    }
  }, []);

  return (
    <div className={styles.root}>
      <div ref={headerScrollRef} className={styles.headerWrapper}>
        <Table className={styles.table}>
          <TableColGroup columns={columns} hasSelection={Boolean(selectionHeader)} />
          <TableHeader>
            <TableRow className={styles.headerRow}>
              {selectionHeader}
              {columns.map((column, index) => (
                <TableHeaderCell
                  key={column.columnId ?? `header-${index}`}
                  className={mergeClasses(styles.headerCell, column.headerClassName)}
                >
                  {renderHeaderCell(column, styles)}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      <div
        ref={bodyScrollRef}
        onScroll={handleBodyScroll}
        className={mergeClasses(styles.wrapper, "custom-scrollbar", className)}
      >
        {wrapBodyInTable ? (
          <Table aria-label={ariaLabel} className={styles.table}>
            <TableColGroup columns={columns} hasSelection={Boolean(selectionHeader)} />
            {body}
          </Table>
        ) : (
          body
        )}
      </div>
    </div>
  );
}

type TableBodyProps<T> = DataTableProps<T> & {
  tableColumns: TableColumnDefinition<T>[];
  styles: ReturnType<typeof useStyles>;
};

function DataTableBody<T>({
  columns,
  data,
  tableColumns,
  styles,
  className,
  onRowClick,
  getRowId = defaultGetRowId,
  selectionMode = "none",
  "aria-label": ariaLabel = "Data table",
}: TableBodyProps<T>) {
  const { getRows } = useTableFeatures({ columns: tableColumns, items: data }, []);

  const rows = getRows();

  return (
    <DataTableLayout
      columns={columns}
      styles={styles}
      className={className}
      ariaLabel={ariaLabel}
      body={
        <TableBody>
          {rows.map(({ item }, rowIndex) => (
            <TableRow
              key={String(getRowId(item, rowIndex))}
              className={onRowClick ? styles.rowInteractive : undefined}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.columnId ?? `cell-${rowIndex}-${colIndex}`}
                  className={mergeClasses(styles.cell, column.className)}
                >
                  {renderCellContent(column, item, styles.mediaIcon)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      }
    />
  );
}

function SelectableDataTableBody<T>({
  columns,
  data,
  tableColumns,
  styles,
  className,
  onRowClick,
  getRowId = defaultGetRowId,
  defaultSelectedRows,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  "aria-label": ariaLabel = "Data table",
}: TableBodyProps<T>) {
  const [uncontrolledSelectedRows, setUncontrolledSelectedRows] = useState(
    () => new Set<TableRowId>(defaultSelectedRows ?? [])
  );

  const selectedRows = controlledSelectedRows ?? uncontrolledSelectedRows;

  const handleSelectionChange = useCallback(
    (_event: unknown, selectionData: { selectedItems: Set<TableRowId> }) => {
      if (!controlledSelectedRows) {
        setUncontrolledSelectedRows(selectionData.selectedItems);
      }
      onSelectionChange?.(selectionData.selectedItems);
    },
    [controlledSelectedRows, onSelectionChange]
  );

  const {
    getRows,
    selection: {
      allRowsSelected,
      someRowsSelected,
      toggleAllRows,
      toggleRow,
      isRowSelected,
    },
  } = useTableFeatures(
    { columns: tableColumns, items: data, getRowId: (item) => getRowId(item, data.indexOf(item)) },
    [
      useTableSelection({
        selectionMode: "multiselect",
        selectedItems: selectedRows,
        onSelectionChange: handleSelectionChange,
      }),
    ]
  );

  const toggleAllKeydown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === " ") {
        toggleAllRows(event);
        event.preventDefault();
      }
    },
    [toggleAllRows]
  );

  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);

    return {
      ...row,
      onClick: (event: React.MouseEvent) => {
        toggleRow(event, row.rowId);
        onRowClick?.(row.item);
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === " ") {
          event.preventDefault();
          toggleRow(event, row.rowId);
        }
      },
      selected,
      appearance: "none" as const,
    };
  });

  return (
    <DataTableLayout
      columns={columns}
      styles={styles}
      className={className}
      ariaLabel={ariaLabel}
      selectionHeader={
        <TableSelectionCell
          checked={allRowsSelected ? true : someRowsSelected ? "mixed" : false}
          onClick={toggleAllRows}
          onKeyDown={toggleAllKeydown}
          checkboxIndicator={{ "aria-label": "Select all rows" }}
        />
      }
      body={
        <TableBody>
          {rows.map(({ item, rowId, selected, onClick, onKeyDown, appearance }, rowIndex) => (
            <TableRow
              key={String(rowId ?? getRowId(item, rowIndex))}
              onClick={onClick}
              onKeyDown={onKeyDown}
              aria-selected={selected}
              appearance={appearance}
              className={styles.rowInteractive}
            >
              <TableSelectionCell
                checked={selected}
                checkboxIndicator={{ "aria-label": "Select row" }}
              />
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.columnId ?? `cell-${rowIndex}-${colIndex}`}
                  className={mergeClasses(styles.cell, column.className)}
                >
                  {renderCellContent(column, item, styles.mediaIcon)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      }
    />
  );
}

export default function DataTable<T>(props: DataTableProps<T>) {
  const styles = useStyles();
  const tableColumns = useTableColumns(props.columns);

  if (props.isLoading) {
    const label = props.loadingLabel ?? props["aria-label"] ?? "Loading table";

    if (props.loadingMode === "spinner") {
      return (
        <DataTableLayout
          columns={props.columns}
          styles={styles}
          className={props.className}
          ariaLabel={label}
          wrapBodyInTable={false}
          body={
            <div aria-busy="true" aria-label={label}>
              <AppSpinner layout="centered" size="small" label={label} />
            </div>
          }
        />
      );
    }

    const hasMedia = props.columns.some((column) => Boolean(column.media));

    return (
      <DataTableLayout
        columns={props.columns}
        styles={styles}
        className={props.className}
        ariaLabel={label}
        wrapBodyInTable={false}
        body={
          <DataTableSkeleton
            rows={props.loadingRowCount ?? 5}
            columns={props.columns.length}
            hasMedia={hasMedia}
            hideHeader
            aria-label={label}
          />
        }
      />
    );
  }

  if (props.selectionMode === "multiselect") {
    return <SelectableDataTableBody {...props} tableColumns={tableColumns} styles={styles} />;
  }

  return <DataTableBody {...props} tableColumns={tableColumns} styles={styles} />;
}
