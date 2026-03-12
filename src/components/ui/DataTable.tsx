'use client';

import React from 'react';
import clsx from 'clsx';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    className?: string;
    onRowClick?: (item: T) => void;
}

export default function DataTable<T>({
    columns,
    data,
    className,
    onRowClick,
}: DataTableProps<T>) {
    return (
        <div className={clsx('w-full overflow-x-auto', className)}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-[#FFFFFF1A]">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={clsx(
                                    'py-5 px-4 first:pl-0 last:pr-0 text-left text-base font-medium text-[#6B7280] font-inter whitespace-nowrap',
                                    column.headerClassName
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick?.(item)}
                            className={clsx(
                                ' last:border-0 transition-colors',
                                onRowClick && 'cursor-pointer hover:bg-white/5'
                            )}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={clsx(
                                        'py-6 px-4 first:pl-0 last:pr-0 text-sm text-[#D1D5DB] font-inter whitespace-nowrap',
                                        column.className
                                    )}
                                >
                                    {typeof column.accessor === 'function'
                                        ? column.accessor(item)
                                        : (item[column.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
