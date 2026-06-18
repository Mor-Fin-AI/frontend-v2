export const actionGreenButtonClassName =
  'inline-flex max-w-full items-center justify-center gap-1 border-none bg-[var(--action-green)] font-semibold text-[var(--action-green-foreground)] shadow-[var(--action-green-shadow)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-[var(--action-green-hover)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--action-green)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-80';

export const actionGreenButtonSizeClassName = {
  default: 'min-h-9 rounded-md px-3 text-sm',
  compact: 'min-h-9 rounded-md px-3 text-xs',
} as const;
