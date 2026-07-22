"use client";

import { useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { arbitrum } from "wagmi/chains";
import DsaAccountPageContent from "@/components/dsa/DsaAccountPageContent";
import AppSpinner from "@/components/ui/AppSpinner";
import { morDsaFactoryAbi, morContractAddresses } from "@/lib/contracts";
import { useDsaAccounts } from "@/hooks/useDsaAccount";
import {
  buildLiveDsaAccountInfo,
  buildLiveDsaStats,
} from "@/lib/dsaLiveData";
import { Caption1, Text } from "@fluentui/react-components";
import NeuButton from "@/components/ui/NeuButton";

export default function UserDsaAccountPage() {
  const { address, isConnected, chainId } = useAccount();
  const { data, isLoading, error, refetch } = useDsaAccounts();
  const primaryAccount = data?.accounts[0] ?? null;

  const stats = useMemo(
    () => buildLiveDsaStats(primaryAccount, !!primaryAccount),
    [primaryAccount]
  );
  const accountInfo = useMemo(
    () => buildLiveDsaAccountInfo(primaryAccount, address),
    [primaryAccount, address]
  );

  const {
    writeContract,
    data: txHash,
    isPending: isCreating,
    error: createError,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const onCreateDsa = () => {
    if (!address) return;

    writeContract({
      chainId: arbitrum.id,
      address: morContractAddresses.morDsaFactory,
      abi: morDsaFactoryAbi,
      functionName: "createDSA",
      args: [address],
    });
  };

  const wrongNetwork = isConnected && chainId !== arbitrum.id;
  const showCreate =
    isConnected &&
    !isLoading &&
    !primaryAccount &&
    !wrongNetwork;

  if (isLoading && isConnected) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <AppSpinner size="small" label="Loading MorDSA account from Arbitrum" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load DSA data."}
        </div>
      ) : null}

      {wrongNetwork ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <Text weight="semibold">Switch to Arbitrum One</Text>
          <Caption1 className="mt-1 block text-muted-foreground">
            MorFinance contracts are deployed on Arbitrum (chain ID 42161). Switch
            your wallet network to view and create a DSA account.
          </Caption1>
        </div>
      ) : null}

      {showCreate ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div>
            <Text weight="semibold">No MorDSA account yet</Text>
            <Caption1 className="mt-1 block text-muted-foreground">
              Deploy a smart account from the on-chain factory (
              {morContractAddresses.morDsaFactory.slice(0, 10)}…).
            </Caption1>
          </div>
          <NeuButton
            variant="primary"
            onClick={onCreateDsa}
            disabled={isCreating || isConfirming}
          >
            {isCreating || isConfirming ? "Creating…" : "Create MorDSA"}
          </NeuButton>
          {createError ? (
            <Caption1 className="w-full text-destructive">
              {createError.message}
            </Caption1>
          ) : null}
          {txHash && !isConfirming ? (
            <Caption1 className="w-full text-muted-foreground">
              Transaction submitted.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => void refetch()}
              >
                Refresh account
              </button>
            </Caption1>
          ) : null}
        </div>
      ) : null}

      <DsaAccountPageContent
        variant="user"
        stats={stats}
        transactions={[]}
        accountInfo={accountInfo}
        walletLabel="your MorDSA account"
        dsaAddress={primaryAccount?.address}
        chainId={data?.chainId ?? 42161}
      />
    </div>
  );
}
