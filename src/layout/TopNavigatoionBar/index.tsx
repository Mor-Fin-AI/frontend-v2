'use client';

import SidebarToggle from './components/SidebarToggle';
import NotificationDropdown from './components/NotificationDropdown';
import ProfileDropdown from './components/ProfileDropdown';
// import LiveNetworkDropdown from './components/LiveNetworkDropdown';

// import { Mail, Cloud, Shield } from 'lucide-react';

export default function TopNavigationBar() {
  return (
    <header
      className="h-20 px-5 flex items-center justify-between border-b border-zinc-800
      bg-background
     text-white"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <SidebarToggle />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-8">
        {/* LIVE NETWORK */}
        {/* <LiveNetworkDropdown /> */}

        {/* ICONS */}
        {/* <div className="flex items-center gap-4 ml-2">
          <button className="relative text-white/80 hover:text-white transition-colors">
            <Mail size={18} />
          </button>
          <button className="relative text-white/80 hover:text-white transition-colors">
            <Shield size={18} />
          </button>
          <button className="relative text-white/80 hover:text-white transition-colors">
            <Cloud size={18} />
          </button>
        </div> */}

        <NotificationDropdown />

        {/* PROFILE */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
