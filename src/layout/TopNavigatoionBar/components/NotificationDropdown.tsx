
'use client';

import { Bell } from 'lucide-react';

export default function NotificationButton() {
  return (
    <div className="relative w-8 h-8 ">
      <div className="absolute w-8 h-8 rounded-lg bg-[#A855F733] hover:bg-[#A855F766] transition-colors flex items-center justify-center">
        <Bell className="w-4 h-4 text-[#D8B4FE]" />
      </div>
      {/* Notification Badge */}
      <div className="absolute w-4 h-4 left-5 -top-0.75 bg-[#EF4444] border border-[#1A0B2E] rounded-full flex items-center justify-center">
        <span className="text-[8.5px] font-bold leading-3.75 text-white">1</span>
      </div>
    </div>
  );
}