export type TableSortOption = {
  value: string;
  label: string;
};

export const defaultTableSortOptions: TableSortOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'status', label: 'Status (A–Z)' },
];

export function formatPickerDate(date?: Date): string {
  if (!date) return '';
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function parseIsoTimestamp(timestamp: string): Date {
  const [datePart, timePart = '0:0'] = timestamp.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function parseDisplayDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  return null;
}

export function matchesSearch(
  query: string,
  fields: Array<string | number | undefined | null>,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return fields.some((field) =>
    String(field ?? '')
      .toLowerCase()
      .includes(normalized),
  );
}

export function matchesTags(selectedTags: string[], value: string | string[]): boolean {
  if (selectedTags.length === 0) return true;

  if (Array.isArray(value)) {
    return value.some((item) => selectedTags.includes(item));
  }

  return selectedTags.includes(value);
}

export function matchesDateRange(
  value: string,
  startDate: Date | null,
  endDate: Date | null,
  parser: (input: string) => Date | null = parseDisplayDate,
): boolean {
  if (!startDate && !endDate) return true;

  const parsed = parser(value);
  if (!parsed) return !startDate && !endDate;

  if (startDate && parsed < startOfDay(startDate)) return false;
  if (endDate && parsed > endOfDay(endDate)) return false;
  return true;
}

export function compareDates(
  left: string,
  right: string,
  parser: (input: string) => Date | null = parseDisplayDate,
): number {
  const leftDate = parser(left);
  const rightDate = parser(right);

  if (!leftDate && !rightDate) return 0;
  if (!leftDate) return 1;
  if (!rightDate) return -1;
  return leftDate.getTime() - rightDate.getTime();
}

export function sortLabelFor(
  sortBy: string,
  options: TableSortOption[],
  fallback = 'Newest first',
): string {
  return options.find((option) => option.value === sortBy)?.label ?? fallback;
}
