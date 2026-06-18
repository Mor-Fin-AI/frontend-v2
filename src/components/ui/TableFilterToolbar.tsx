'use client';

import React from 'react';
import { Search24Regular } from '@fluentui/react-icons';
import {
  Dropdown,
  Input,
  Option,
  Tag,
  TagPicker,
  TagPickerButton,
  TagPickerControl,
  TagPickerGroup,
  TagPickerList,
  TagPickerOption,
  makeStyles,
  tokens,
  type TagPickerProps,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { formatPickerDate, sortLabelFor, type TableSortOption } from '@/lib/tableFilters';

const filterFieldStyles = {
  backgroundColor: 'inherit' as const,
  borderTopColor: tokens.colorNeutralStroke2,
  borderRightColor: tokens.colorNeutralStroke2,
  borderBottomColor: tokens.colorNeutralStroke2,
  borderLeftColor: tokens.colorNeutralStroke2,
  boxShadow: 'none',
  '::after': {
    display: 'none',
  },
  ':hover': {
    backgroundColor: 'inherit',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
  },
  ':focus-within': {
    backgroundColor: 'inherit',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
  },
};

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
    width: '100%',
    backgroundColor: 'inherit',
    '& .fui-Input': filterFieldStyles,
    '& .fui-Input__input': {
      backgroundColor: 'inherit',
    },
    '& .fui-Input:hover::after, & .fui-Input:focus-within::after': {
      display: 'none',
    },
    '& .fui-Dropdown': filterFieldStyles,
    '& .fui-Dropdown__button': {
      backgroundColor: 'inherit',
    },
    '& .fui-Dropdown:hover::after, & .fui-Dropdown:focus-within::after': {
      display: 'none',
    },
    '& .fui-Combobox': filterFieldStyles,
    '& .fui-Combobox__input': {
      backgroundColor: 'inherit',
    },
    '& .fui-Combobox:hover::after, & .fui-Combobox:focus-within::after': {
      display: 'none',
    },
    '& .fui-TagPickerControl': filterFieldStyles,
    '& .fui-TagPickerInput': {
      backgroundColor: 'inherit',
    },
    '& .fui-TagPickerControl:hover::after, & .fui-TagPickerControl:focus-within::after': {
      display: 'none',
    },
  },
  search: {
    flex: '1 1 200px',
    minWidth: '180px',
    maxWidth: '320px',
  },
  control: {
    flex: '0 1 160px',
    minWidth: '140px',
  },
  dateControl: {
    flex: '0 1 150px',
    minWidth: '130px',
  },
  tagPicker: {
    flex: '1 1 220px',
    minWidth: '180px',
    maxWidth: '360px',
  },
  emptyState: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
    textAlign: 'center',
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
  },
});

export type TableFilterToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: TableSortOption[];
  sortAriaLabel?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onStartDateChange?: (date: Date | null) => void;
  onEndDateChange?: (date: Date | null) => void;
  showDateRange?: boolean;
  tagOptions?: string[];
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  tagAriaLabel?: string;
  tagButtonAriaLabel?: string;
};

export default function TableFilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchAriaLabel = 'Search table',
  sortBy,
  onSortChange,
  sortOptions,
  sortAriaLabel = 'Sort table',
  startDate = null,
  endDate = null,
  onStartDateChange,
  onEndDateChange,
  showDateRange = true,
  tagOptions = [],
  selectedTags = [],
  onTagsChange,
  tagAriaLabel = 'Selected filters',
  tagButtonAriaLabel = 'Filter by tag',
}: TableFilterToolbarProps) {
  const styles = useStyles();
  const sortLabel = sortLabelFor(sortBy, sortOptions);

  const onTagSelect: TagPickerProps['onOptionSelect'] = (_, data) => {
    if (data.value === 'no-options' || !onTagsChange) return;
    onTagsChange(data.selectedOptions);
  };

  const availableTags = tagOptions.filter((tag) => !selectedTags.includes(tag));
  const showTagPicker = tagOptions.length > 0 && onTagsChange;

  return (
    <div className={styles.toolbar}>
      <Input
        appearance="outline"
        className={styles.search}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(_, data) => onSearchChange(data.value)}
        contentBefore={<Search24Regular aria-hidden />}
        aria-label={searchAriaLabel}
      />

      <Dropdown
        appearance="outline"
        className={styles.control}
        placeholder="Sort by"
        value={sortLabel}
        selectedOptions={[sortBy]}
        onOptionSelect={(_, data) => {
          if (data.optionValue) {
            onSortChange(data.optionValue);
          }
        }}
        aria-label={sortAriaLabel}
      >
        {sortOptions.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Dropdown>

      {showDateRange && onStartDateChange && onEndDateChange ? (
        <>
          <DatePicker
            appearance="outline"
            className={styles.dateControl}
            placeholder="From date"
            value={startDate}
            onSelectDate={(date) => onStartDateChange(date ?? null)}
            formatDate={formatPickerDate}
            maxDate={endDate ?? undefined}
            aria-label="Filter from date"
          />

          <DatePicker
            appearance="outline"
            className={styles.dateControl}
            placeholder="To date"
            value={endDate}
            onSelectDate={(date) => onEndDateChange(date ?? null)}
            formatDate={formatPickerDate}
            minDate={startDate ?? undefined}
            aria-label="Filter to date"
          />
        </>
      ) : null}

      {showTagPicker ? (
        <div className={styles.tagPicker}>
          <TagPicker onOptionSelect={onTagSelect} selectedOptions={selectedTags}>
            <TagPickerControl>
              <TagPickerGroup aria-label={tagAriaLabel}>
                {selectedTags.map((tag) => (
                  <Tag key={tag} shape="rounded" value={tag}>
                    {tag}
                  </Tag>
                ))}
              </TagPickerGroup>
              <TagPickerButton aria-label={tagButtonAriaLabel} />
            </TagPickerControl>
            <TagPickerList>
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <TagPickerOption key={tag} value={tag}>
                    {tag}
                  </TagPickerOption>
                ))
              ) : (
                <TagPickerOption value="no-options">No options available</TagPickerOption>
              )}
            </TagPickerList>
          </TagPicker>
        </div>
      ) : null}
    </div>
  );
}

export function TableEmptyState({ message = 'No results found.' }: { message?: string }) {
  const styles = useStyles();
  return <p className={styles.emptyState}>{message}</p>;
}
