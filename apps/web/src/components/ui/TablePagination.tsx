"use client";

import {
  Button,
  Caption1,
  Dropdown,
  Option,
  Text,
} from "@fluentui/react-components";
import {
  ChevronLeft16Regular,
  ChevronRight16Regular,
} from "@fluentui/react-icons";

export type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  itemLabel?: string;
};

export default function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  isLoading = false,
  itemLabel = "rows",
}: TablePaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Text size={200} className="text-muted-foreground">
          {total === 0
            ? `No ${itemLabel}`
            : `Showing ${start}–${end} of ${total} ${itemLabel}`}
        </Text>
        {totalPages > 1 ? (
          <Caption1 block className="mt-1 text-muted-foreground">
            Page {page} of {totalPages}
          </Caption1>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <Dropdown
            aria-label="Rows per page"
            selectedOptions={[String(pageSize)]}
            value={`${pageSize} / page`}
            onOptionSelect={(_, data) => {
              const next = Number(data.optionValue);
              if (Number.isFinite(next) && next > 0) {
                onPageSizeChange(next);
              }
            }}
            disabled={isLoading}
            size="small"
          >
            {pageSizeOptions.map((option) => (
              <Option key={option} value={String(option)} text={`${option} / page`}>
                {option} / page
              </Option>
            ))}
          </Dropdown>
        ) : null}

        <Button
          appearance="secondary"
          size="small"
          icon={<ChevronLeft16Regular />}
          disabled={isLoading || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          appearance="secondary"
          size="small"
          icon={<ChevronRight16Regular />}
          iconPosition="after"
          disabled={isLoading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
