"use client";

import DsaAccountPageContent from "@/components/dsa/DsaAccountPageContent";
import {
  clientDsaStats,
  clientDsaTransactions,
  clientDsaAccountInfo,
} from "@/components/dsa/data";

export default function ClientDsaAccountPage() {
  return (
    <DsaAccountPageContent
      variant="client"
      stats={clientDsaStats}
      transactions={clientDsaTransactions}
      accountInfo={clientDsaAccountInfo}
      walletLabel="your client DSA treasury"
    />
  );
}
