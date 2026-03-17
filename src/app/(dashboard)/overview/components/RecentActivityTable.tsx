
'use client';

import { ArrowUp } from 'lucide-react';
import { recentActivityData } from '../data';
import clsx from 'clsx';
import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const badgeStyles = {
    Reward: 'bg-[#0F292D] text-[#22C38E]',
    Vote: 'bg-[#1B3448] text-[#30ABCE]',
    Training: 'bg-[#231238] text-[#8C47D1]',
    Validation: 'bg-[#312515] text-[#F69E23]',
};

const variants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export default function RecentActivityTable() {
    const { ref, controls } = useScrollAnimation();

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={controls}
            className="bg-[#1E1B2E66] rounded-2xl p-3 md:p-6 flex flex-col gap-7">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-medium text-white">Recent Activity</h3>

                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4ADE801A] text-[#22C38E] text-sm font-medium">
                    View all
                    <span className="rotate-45">
                        <ArrowUp className="w-4 h-4" />
                    </span>
                </button>
            </div>

            {/* List */}
            <div className="flex flex-col">
                {recentActivityData.slice(0, 5).map((activity, index) => (
                    <div key={activity.id}>
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-1 md:gap-20 ">
                                <div className="min-w-[80px] md:min-w-[100px] flex-shrink-0 flex justify-start">
                                    <span
                                        className={clsx(
                                            'px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold inline-flex justify-center flex-shrink-0',
                                            badgeStyles[activity.type]
                                        )}>
                                        {activity.type}
                                    </span>
                                </div>

                                <span className="text-xs md:text-base text-[#A5A5A5]">{activity.label}</span>
                            </div>

                            <div className="flex items-center gap-6">
                                <span
                                    className={clsx(
                                        'text-xs md:text-sm',
                                        activity.value?.includes('+') ? 'text-[#22C38E]' : 'text-[#6B7280]'
                                    )}>
                                    {activity.value || '--'}
                                </span>

                                <span className="text-xs md:text-sm text-white">{activity.time}</span>
                            </div>
                        </div>

                        {index !== 4 && <div className="border-t border-[#50505066]" />}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
