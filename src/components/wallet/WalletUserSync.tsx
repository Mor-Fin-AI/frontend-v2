"use client";

import { useSyncWalletUser } from "@/hooks/useSyncWalletUser";

export default function WalletUserSync() {
  useSyncWalletUser();
  return null;
}
