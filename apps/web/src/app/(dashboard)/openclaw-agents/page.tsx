"use client";

import OpenClawAgentsPanel from "./components/OpenClawAgentsPanel";
import { useOpenClawAgents } from "@/hooks/useOpenClawAgents";

export default function OpenClawAgentsPage() {
  const query = useOpenClawAgents();

  return (
    <div className="mt-2 flex flex-col gap-6">
      <OpenClawAgentsPanel
        snapshot={query.data}
        isLoading={query.isLoading}
        error={query.error}
      />
    </div>
  );
}
