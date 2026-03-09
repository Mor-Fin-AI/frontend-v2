"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
// import { MenuItem } from "@/types";
import { useSidebar } from "@/context/SidebarContext";

import {
     
  Landmark,     
  Zap,          
  BarChart3,      
  Server,       
  FileText,      
  Vote,
  Gavel,
  LayoutDashboard,
  Boxes,
  Crown,
  BarChart3Icon
} from "lucide-react";
import { MenuItem } from "../menu";
import { RewardIcon } from "../../../../public/Svg/sidebar/RewardIcon";
import { DaoIcon } from "../../../../public/Svg/sidebar/DaoIcon";
import { InfrastructureIcon } from "../../../../public/Svg/sidebar/InfrastructureIcon";

const iconMap = {
  dashboard: LayoutDashboard,
  rewards: RewardIcon,
  dao: DaoIcon,
  infrastructure: Boxes,
  gift: Vote,
  server: Server,
  bank: Gavel,
  file: FileText,
};

export default function AppMenu({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();
  const { close } = useSidebar();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon
          ? iconMap[item.icon as keyof typeof iconMap]
          : null;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={close}
            className={clsx(
              "flex items-center gap-3 px-1 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
              isActive
                ? "text-white"
                : "text-sidebar-primary hover:text-white hover:bg-white/5"
            )}
          >
            {Icon && (
              <Icon
                size={20}
                className={clsx(isActive ? "text-[#C084FC]" : "text-current")}
              />
            )}
            <span>{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#a855f7]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
