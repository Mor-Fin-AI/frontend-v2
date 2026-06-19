"use client";

import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import DsaAccountStats from "@/components/dsa/DsaAccountStats";
import DsaWalletSection from "@/components/dsa/DsaWalletSection";
import DsaAccountDetails from "@/components/dsa/DsaAccountDetails";
import DsaTransactionHistory from "@/components/dsa/DsaTransactionHistory";
import {
  DsaStat,
  DsaTransaction,
  DsaAccountInfo,
} from "@/components/dsa/data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface DsaAccountPageContentProps {
  variant: "user" | "client";
  stats: DsaStat[];
  transactions: DsaTransaction[];
  accountInfo: DsaAccountInfo;
  walletLabel: string;
  dsaAddress?: string;
  chainId?: number;
}

export default function DsaAccountPageContent({
  stats,
  transactions,
  accountInfo,
  walletLabel,
  dsaAddress,
  chainId = 42161,
}: DsaAccountPageContentProps) {
  const { ref: statsRef, controls: statsControls } = useScrollAnimation();
  const { ref: walletRef, controls: walletControls } = useScrollAnimation();
  const { ref: detailsRef, controls: detailsControls } = useScrollAnimation();
  const { ref: txRef, controls: txControls } = useScrollAnimation();

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        ref={statsRef}
        initial="hidden"
        animate={statsControls}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
      >
        <DsaAccountStats stats={stats} />
      </motion.div>

      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
        <motion.div
          ref={walletRef}
          initial="hidden"
          animate={walletControls}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          <DsaWalletSection
            accountLabel={walletLabel}
            dsaAddress={dsaAddress}
            chainId={chainId}
          />
        </motion.div>

        <motion.div
          ref={detailsRef}
          initial="hidden"
          animate={detailsControls}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="h-full"
        >
          <DsaAccountDetails info={accountInfo} dsaAddress={dsaAddress} />
        </motion.div>
      </div>

      <motion.div
        ref={txRef}
        initial="hidden"
        animate={txControls}
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DsaTransactionHistory
          transactions={transactions}
          emptyMessage="On-chain spell history indexing is not enabled yet. Balances and account metadata are live from Arbitrum."
        />
      </motion.div>
    </div>
  );
}
