'use client';

import React, { useState } from 'react';
import { auditLogs, filterTabs, AuditLog, EventCategory, EventStatus, FilterTab } from '../data';
import { Search, Wallet, Zap, FileText, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<EventCategory, { label: string; bg: string }> = {
    Reward:     { label: 'text-[#22C38E]', bg: 'bg-[#22C38E1A]' },
    Governance: { label: 'text-[#8C47D1]', bg: 'bg-[#8547D11A]' },
    DAO:        { label: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
};

const STATUS_STYLES: Record<EventStatus, { dot: string; label: string }> = {
    Success: { dot: 'bg-[#22C38E]', label: 'text-[#22C38E]' },
    Flagged: { dot: 'bg-[#EF4444]', label: 'text-[#EF4444]' },
    Pending: { dot: 'bg-[#F69E23]', label: 'text-[#F69E23]' },
};

const ICON_MAP: Record<string, React.ReactNode> = {
    reward:     <Wallet    className="w-4 h-4 text-[#22C38E]" />,
    governance: <Zap       className="w-4 h-4 text-[#8C47D1]" />,
    dao:        <FileText  className="w-4 h-4 text-[#30ABE8]" />,
    warning:    <AlertTriangle className="w-4 h-4 text-[#EF4444]" />,
};

const ICON_BG: Record<string, string> = {
    reward:     'bg-[#22C38E1A]',
    governance: 'bg-[#8547D11A]',
    dao:        'bg-[#30ABE81A]',
    warning:    'bg-[#EF44441A]',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: EventCategory }) {
    const s = CATEGORY_STYLES[category];
    return (
        <span className={clsx('px-2.5 py-0.5 rounded-full text-[11px] font-medium font-inter', s.bg, s.label)}>
            {category}
        </span>
    );
}

function StatusBadge({ status }: { status: EventStatus }) {
    const s = STATUS_STYLES[status];
    return (
        <div className="flex items-center gap-1.5">
            <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
            <span className={clsx('text-[11px] font-medium font-inter', s.label)}>{status}</span>
        </div>
    );
}

// ─── Single log row ───────────────────────────────────────────────────────────

function LogRow({ log, index }: { log: AuditLog; index: number }) {
    const hasAmount = !!log.amount;
    const isAction = log.status === 'Success' && !hasAmount;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            className={clsx(
                'flex items-start gap-4 p-4 md:p-5 rounded-xl border transition-colors',
                log.highlighted
                    ? 'bg-[#EF44440A] border-[#EF444433]'
                    : 'bg-transparent border-[#FFFFFF0D]'
            )}
        >
            {/* Icon */}
            <div className={clsx('flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5', ICON_BG[log.iconType])}>
                {ICON_MAP[log.iconType]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white text-sm font-bold font-inter">{log.title}</span>
                    <CategoryBadge category={log.category} />
                    <StatusBadge status={log.status} />
                </div>

                {/* Description */}
                <p className="text-[#6B7280] text-xs font-inter leading-5 mb-2">{log.description}</p>

                {/* Meta row */}
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#FFFFFF0D] text-[#6B7280] text-[10px] font-inter font-medium">
                        {log.txnId}
                    </span>
                    <div className="flex items-center gap-1 text-[#6B7280] text-xs font-inter">
                        <span>🕐</span>
                        <span>{log.timestamp}</span>
                    </div>
                    <span className="text-[#6B7280] text-xs font-inter">
                        By: <span className="text-white font-medium">{log.actor}</span>
                    </span>
                </div>
            </div>

            {/* Right: Amount or actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
                {hasAmount ? (
                    <span className={clsx(
                        'text-sm font-bold font-inter',
                        log.amountColor === 'green' ? 'text-[#22C38E]' : 'text-[#EF4444]'
                    )}>
                        {log.amount}
                    </span>
                ) : (
                    <button className="text-[#6B7280] hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main EventLog component ──────────────────────────────────────────────────

export default function EventLog() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
    const [search, setSearch] = useState('');

    const filtered = auditLogs.filter((log) => {
        const matchesFilter =
            activeFilter === 'All' ||
            log.category.toLowerCase() === activeFilter.toLowerCase() ||
            (activeFilter === 'Governance' && log.category === 'Governance');
        const matchesSearch =
            search === '' ||
            log.title.toLowerCase().includes(search.toLowerCase()) ||
            log.txnId.toLowerCase().includes(search.toLowerCase()) ||
            log.description.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="bg-[#1E1B2E66] rounded-2xl p-4 md:p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#22C38E1A] flex items-center justify-center">
                    <FileText className="w-3 h-3 text-[#22C38E]" />
                </div>
                <h3 className="text-white text-base font-bold font-inter">Immutable Event Log</h3>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                        type="text"
                        placeholder="Search events, IDs, actions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#FFFFFF0D] border border-[#FFFFFF1A] text-white text-sm font-inter placeholder-[#6B7280] focus:outline-none focus:border-[#22C38E] transition-colors"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveFilter(tab)}
                            className={clsx(
                                'px-3 py-1.5 rounded-lg text-xs font-medium font-inter transition-colors',
                                activeFilter === tab
                                    ? 'bg-[#22C38E] text-white'
                                    : 'bg-[#FFFFFF0D] text-[#6B7280] hover:bg-[#FFFFFF1A] hover:text-white'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log entries */}
            <div className="flex flex-col gap-3">
                {filtered.length > 0 ? (
                    filtered.map((log, index) => (
                        <LogRow key={log.id} log={log} index={index} />
                    ))
                ) : (
                    <p className="text-[#6B7280] text-sm font-inter text-center py-8">No events found.</p>
                )}
            </div>
        </div>
    );
}
