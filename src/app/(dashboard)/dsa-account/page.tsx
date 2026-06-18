"use client";

import DsaAccountPageContent from "@/components/dsa/DsaAccountPageContent";
import {
  userDsaStats,
  userDsaTransactions,
  userDsaAccountInfo,
} from "@/components/dsa/data";

export default function UserDsaAccountPage() {
  return (
    <DsaAccountPageContent
      variant="user"
      stats={userDsaStats}
      transactions={userDsaTransactions}
      accountInfo={userDsaAccountInfo}
      walletLabel="your DSA account"
    />
  );
}
