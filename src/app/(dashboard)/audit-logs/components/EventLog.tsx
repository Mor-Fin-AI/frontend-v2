'use client';

import React, { useState } from 'react';
import { auditLogs, filterTabs, AuditLog, EventCategory, EventStatus, FilterTab } from '../data';
import { Search, Wallet, Zap, FileText, AlertTriangle, MoreHorizontal, Clock, CalendarCheck, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// ─── Style maps ───────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<EventCategory, { label: string; bg: string }> = {
    Reward: { label: 'text-[#8C47D1]', bg: 'bg-[#8C47D11A]' },
    Governance: { label: 'text-[#F97316]', bg: 'bg-[#F973161A]' },
    DAO: { label: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
};

const STATUS_STYLES: Record<EventStatus, { dot: string; label: string }> = {
    Success: { dot: 'bg-[#22C38E]', label: 'text-[#22C38E]' },
    Flagged: { dot: 'bg-[#EF4444]', label: 'text-[#EF4444]' },
    Pending: { dot: 'bg-[#F69E23]', label: 'text-[#F69E23]' },
};

const ICON_MAP: Record<string, React.ReactNode> = {
    reward: <Wallet className="w-4 h-4 text-[#8C47D1]" />,
    governance: <Zap className="w-4 h-4 text-[#F97316]" />,
    dao: <FileText className="w-4 h-4 text-[#30ABE8]" />,
    training: <BookOpen className="w-4 h-4 text-[#F69E23]" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#EF4444]" />,
};

const ICON_BG: Record<string, string> = {
    reward: 'bg-[#8C47D11A] ',
    governance: 'bg-[#F973161A]',
    dao: 'bg-[#30ABE81A] ',
    training: 'bg-[#F69E231A] ',
    warning: 'bg-[#EF44441A] ',
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: EventCategory }) {
    const s = CATEGORY_STYLES[category];
    return (
        <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium font-inter leading-4', s.bg, s.label)}>
            {category}
        </span>
    );
}

function StatusBadge({ status }: { status: EventStatus }) {
    const s = STATUS_STYLES[status];
    return (
        <div className="flex items-center gap-1">
            <div className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', s.dot)} />
            <span className={clsx('text-[10px] font-medium font-inter', s.label)}>{status}</span>
        </div>
    );
}

// ─── TXN Badge ────────────────────────────────────────────────────────────────

function TxnBadge({ txnId, category, flagged }: { txnId: string; category: EventCategory; flagged?: boolean }) {
    const s = CATEGORY_STYLES[category];
    return (
        <span className={clsx(
            'px-2 py-0.5 rounded-full text-[10px] font-medium font-inter ',
            flagged
                ? 'bg-[#EF44441A] border-[#EF444433] text-[#EF4444]'
                : clsx(s.bg, 'border-[#FFFFFF0D]', s.label)
        )}>
            {txnId}
        </span>
    );
}

// ─── Single log row 

function LogRow({ log, index }: { log: AuditLog; index: number }) {
    const hasAmount = !!log.amount;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            className={clsx(
                'flex items-start gap-3 p-2 md:p-4 rounded-xl border transition-colors',
                log.highlighted
                    ? 'bg-[#EF444424] border-[#EF444480]'
                    : 'bg-[#1E1B2E33] border-[#FFFFFF0D]'
            )}
        >
            {/* Icon */}
            <div className={clsx(
                'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5',
                ICON_BG[log.iconType]
            )}>
                {ICON_MAP[log.iconType]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Title + Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white text-sm md:text-base font-medium font-inter">{log.title}</span>
                    <CategoryBadge category={log.category} />
                    <StatusBadge status={log.status} />
                </div>

                {/* Description */}
                <p className="text-[#D1D5DB] font-normal text-xs font-inter leading-5 mb-3.5">{log.description}</p>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <TxnBadge txnId={log.txnId} category={log.category} flagged={log.highlighted} />
                    <div className="flex items-center gap-1.5 text-[#6B7280] font-normal text-xs font-inter">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                    </div>
                    <span className="text-[#6B7280] text-xs font-inter font-normal">
                        By: <span className="text-white font-normal text-xs">{log.actor}</span>
                    </span>
                </div>
            </div>

            {/* Right: Amount or actions */}
            <div className="flex-shrink-0 flex items-center self-center">
                {hasAmount ? (
                    <span className={clsx(
                        'text-sm font-medium font-inter',
                        log.amountColor === 'green' ? 'text-[#4ADE80]' : 'text-[#EF4444]'
                    )}>
                        {log.amount}
                    </span>
                ) : (
                    <button className="text-[#6B7280] hover:text-white transition-colors p-1">
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
            log.category.toLowerCase() === activeFilter.toLowerCase();
        const matchesSearch =
            search === '' ||
            log.title.toLowerCase().includes(search.toLowerCase()) ||
            log.txnId.toLowerCase().includes(search.toLowerCase()) ||
            log.description.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="bg-[#1E1B2E1A] border border-[#FFFFFF0D] rounded-2xl p-3 md:p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded  flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-white" />
                </div>
                <p className="text-white text-base md:text-lg font-medium font-inter">Immutable Event Log</p>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4.5 bg-[#1E1B2E33] border border-[#FFFFFF1A] rounded-lg">
                {/* Search */}
                <div className="relative flex-1 w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E8E]" />
                    <input
                        type="text"
                        placeholder="Search events, IDs, actions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#58585833]  text-white text-sm font-inter placeholder-[#6B7280] focus:outline-none focus:border-[#22C38E] transition-colors"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveFilter(tab)}
                            className={clsx(
                                'px-4.5 py-2 rounded-full text-[10px] font-normal font-inter transition-colors',
                                activeFilter === tab
                                    ? 'bg-[#1FACC61A] text-white'
                                    : 'bg-[#9797971A] hover:text-[#6B7280] hover:bg-[#FFFFFF1A] text-white'
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