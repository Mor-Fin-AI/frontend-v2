'use client';

import React from 'react';
import { participationHistory, ParticipationEvent, EventCategory, ParticipationStatus } from '../data';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const CATEGORY_STYLES: Record<EventCategory, { label: string; bg: string }> = {
    Meeting: { label: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
    Governance: { label: 'text-[#8C47D1]', bg: 'bg-[#8547D11A]' },
    Ceremony: { label: 'text-[#F69E23]', bg: 'bg-[#F69E231A]' },
    Validation: { label: 'text-[#4ADE80]', bg: 'bg-[#4ADE801A]' },
};

const STATUS_STYLES: Record<ParticipationStatus, { dot: string; label: string; bg: string }> = {
    Attended: { dot: 'bg-[#4ADE80]', label: 'text-[#4ADE80]', bg: 'bg-[#4ADE801A]' },
    Voted: { dot: 'bg-[#8C47D1]', label: 'text-[#8C47D1]', bg: 'bg-[#8547D11A]' },
    Participated: { dot: 'bg-[#30ABE8]', label: 'text-[#30ABE8]', bg: 'bg-[#30ABE81A]' },
};

function CategoryBadge({ category }: { category: EventCategory }) {
    const s = CATEGORY_STYLES[category];
    return (
        <div className={clsx('py-1 rounded-sm w-14.5 md:w-22 flex items-center justify-center', s.bg)}>
            <span className={clsx('text-[9px] md:text-xs font-medium font-inter text-center', s.label)}>{category}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: ParticipationStatus }) {
    const s = STATUS_STYLES[status];
    return (
        <div className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit', s.bg)}>
            <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
            <span className={clsx('text-[11px] font-medium font-inter', s.label)}>{status}</span>
        </div>
    );
}

function ParticipationRow({ event, index }: { event: ParticipationEvent; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="flex items-center justify-between py-5 "
        >
            <div className="flex items-center gap-1 md:gap-4 flex-1 min-w-0">
                <div className="shrink-0">
                    <CategoryBadge category={event.category} />
                </div>
                <span className="text-[#D1D5DB] text-left text-xs md:text-sm font-inter font-normal leading-5 truncate">{event.title}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0 ">
                <span className="text-[#D1D5DB] text-xs md:text-sm font-inter font-normal leading-4">{event.date}</span>
                <StatusBadge status={event.status} />
            </div>
        </motion.div>
    );
}

export default function ParticipationHistory() {
    return (
        <div className="bg-[#1E1B2E66] border border-[#FFFFFF0D] rounded-2xl p-2 md:p-6 flex flex-col">
            <h3 className="text-white text-lg font-bold font-inter mb-2">Participation History</h3>
            <div className="flex flex-col">
                {participationHistory.map((event, index) => (
                    <ParticipationRow key={event.id} event={event} index={index} />
                ))}
            </div>
        </div>
    );
}
