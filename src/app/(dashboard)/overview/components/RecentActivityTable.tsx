// "use client";

// import { recentActivityData } from "../data";
// import clsx from "clsx";

// const badgeStyles = {
//     Reward: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
//     Vote: "bg-blue-500/10 text-blue-500 border-blue-500/20",
//     Training: "bg-purple-500/10 text-purple-500 border-purple-500/20",
//     Validation: "bg-amber-500/10 text-amber-500 border-amber-500/20",
// };

// export default function RecentActivityTable() {
//     return (
//         <div className="bg-[#110C1D] border border-white/5 rounded-2xl p-6">
//             <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
//                 <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 transition-colors">
//                     View all <span className="rotate-45">↑</span>
//                 </button>
//             </div>
//             <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                     <tbody className="divide-y divide-white/5">
//                         {recentActivityData.map((activity) => (
//                             <tr key={activity.id} className="group hover:bg-white/[0.02] transition-colors">
//                                 <td className="py-4 pr-4">
//                                     <span className={clsx(
//                                         "inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
//                                         badgeStyles[activity.type]
//                                     )}>
//                                         {activity.type}
//                                     </span>
//                                 </td>
//                                 <td className="py-4 px-4 flex-1">
//                                     <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
//                                         {activity.label}
//                                     </span>
//                                 </td>
//                                 <td className="py-4 px-4 text-right">
//                                     <span className={clsx(
//                                         "text-sm font-semibold",
//                                         activity.value?.includes("+") ? "text-emerald-500" : "text-zinc-500"
//                                     )}>
//                                         {activity.value || "--"}
//                                     </span>
//                                 </td>
//                                 <td className="py-4 pl-4 text-right">
//                                     <span className="text-xs text-zinc-500">
//                                         {activity.time}
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

'use client';

import { ArrowUp } from 'lucide-react';
import { recentActivityData } from '../data';
import clsx from 'clsx';

const badgeStyles = {
  Reward: 'bg-[#0F292D] text-[#22C38E]',
  Vote: 'bg-[#1B3448] text-[#30ABCE]',
  Training: 'bg-[#231238] text-[#8C47D1]',
  Validation: 'bg-[#312515] text-[#F69E23]',
};

export default function RecentActivityTable() {
  return (
    <div className="bg-[#1E1B2E66] rounded-2xl p-3 md:p-6 flex flex-col gap-7">
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
                <span
                  className={clsx(
                    'px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold',
                    badgeStyles[activity.type]
                  )}>
                  {activity.type}
                </span>

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
    </div>
  );
}
