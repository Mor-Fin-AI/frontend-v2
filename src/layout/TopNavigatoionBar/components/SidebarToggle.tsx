"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export default function SidebarToggle() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
      aria-label="Toggle sidebar"
    >
      <Menu size={20} />
    </button>
  );
}
