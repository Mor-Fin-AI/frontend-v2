"use client";

import PanelCard, { PanelCardBody, PanelCardHeader } from "@/components/ui/PanelCard";
import AppBadge from "@/components/ui/AppBadge";
import { dsaAccountStatusTone } from "@/lib/badgeTones";
import { DsaAccountInfo } from "./data";
import { useAccount } from "wagmi";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DsaAccountDetails({
  info,
  dsaAddress,
}: {
  info: DsaAccountInfo;
  dsaAddress?: string;
}) {
  const { address, isConnected } = useAccount();

  const rows = [
    { label: "MorDSA Address", value: dsaAddress ? truncateAddress(dsaAddress) : "—" },
    { label: "Account ID", value: info.accountId },
    { label: "Account Type", value: info.accountType },
    {
      label: "Status",
      value: (
        <AppBadge
          tone={dsaAccountStatusTone[info.status] ?? "neutral"}
          appearance="tint"
          size="small"
        >
          {info.status}
        </AppBadge>
      ),
    },
    {
      label: "Linked Wallet",
      value: isConnected && address ? truncateAddress(address) : info.linkedWallet,
    },
    { label: "Created", value: info.createdAt },
    { label: "Last Activity", value: info.lastActivity },
  ];

  return (
    <PanelCard className="h-full">
      <PanelCardHeader title="Account Details" headingAs="h4" description="DSA account metadata" />
      <PanelCardBody className="flex-1">
      <dl className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-border py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      </PanelCardBody>
    </PanelCard>
  );
}
