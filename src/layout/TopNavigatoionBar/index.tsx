'use client';

import SidebarToggle from './components/SidebarToggle';
import NotificationDropdown from './components/NotificationDropdown';
import ProfileDropdown from './components/ProfileDropdown';
import ConnectWallet from '@/components/wallet/ConnectWallet';
// import LiveNetworkDropdown from './components/LiveNetworkDropdown';

// import { Mail, Cloud, Shield } from 'lucide-react';

export default function TopNavigationBar() {
  return (
    <header
      className="flex h-20 items-center justify-between border-b border-border bg-background px-5 text-foreground"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <SidebarToggle />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 md:gap-6">
        <NotificationDropdown />

        <ConnectWallet />

        {/* PROFILE */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
