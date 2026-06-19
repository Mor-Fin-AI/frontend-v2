"use client";

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Caption1,
  Dropdown,
  Field,
  Input,
  Option,
  Text,
  Textarea,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft24Regular } from "@fluentui/react-icons";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { arbitrum } from "wagmi/chains";
import NeuButton from "@/components/ui/NeuButton";
import PanelCard, { PanelCardBody, PanelCardHeader } from "@/components/ui/PanelCard";
import AppSpinner from "@/components/ui/AppSpinner";
import ConnectWallet from "@/components/wallet/ConnectWallet";
import { morContractAddresses, morGovernorAbi } from "@/lib/contracts";
import {
  formatProposalDescription,
  GOVERNANCE_CATEGORIES,
} from "@/lib/governanceFormat";
import type { ProposalCategory } from "../data";
import { useGovernanceStatus } from "@/hooks/useGovernance";

const useStyles = makeStyles({
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalM,
    color: "var(--muted-foreground)",
    textDecoration: "none",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    ":hover": { color: "var(--foreground)" },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    justifyContent: "flex-end",
  },
});

export default function CreateProposalPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { address, isConnected, chainId } = useAccount();
  const statusQuery = useGovernanceStatus();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProposalCategory>("Governance");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending, error: txError } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const wrongNetwork = isConnected && chainId !== arbitrum.id;
  const threshold = statusQuery.data?.proposalThresholdFormatted ?? "—";

  const descriptionPreview = useMemo(
    () => formatProposalDescription({ title: title || "Untitled", category, body }),
    [title, category, body]
  );

  const onSubmit = () => {
    setError(null);
    if (!address) {
      setError("Connect your wallet to submit a proposal.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (wrongNetwork) {
      setError("Switch to Arbitrum One in MetaMask.");
      return;
    }

    writeContract({
      chainId: arbitrum.id,
      address: morContractAddresses.morGovernor,
      abi: morGovernorAbi,
      functionName: "propose",
      args: [
        [morContractAddresses.morGovernanceHub],
        [0n],
        ["0x"],
        formatProposalDescription({ title, category, body }),
      ],
    });
  };

  if (isSuccess) {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <PanelCard>
          <PanelCardHeader
            title="Proposal submitted"
            description="Your transaction was confirmed on Arbitrum. It may take a moment to appear in the proposal list."
          />
          <PanelCardBody className="flex flex-wrap gap-3">
            <NeuButton variant="primary" size="sm" onClick={() => navigate("/governance")}>
              View proposals
            </NeuButton>
            <NeuButton variant="secondary" size="sm" onClick={() => navigate("/governance/create")}>
              Create another
            </NeuButton>
          </PanelCardBody>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <Link to="/governance" className={styles.backLink}>
        <ArrowLeft24Regular className="h-4 w-4" />
        Back to Governance
      </Link>

      <PanelCard>
        <PanelCardHeader
          title="Create Governance Proposal"
          description="Submit a proposal to MorGovernorTimeLocked on Arbitrum One"
        />
        <PanelCardBody className={styles.form}>
          {!isConnected ? (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <Caption1>Connect a wallet with enough MOR voting power to meet the proposal threshold.</Caption1>
              <ConnectWallet compact />
            </div>
          ) : wrongNetwork ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <Text weight="semibold">Switch to Arbitrum One</Text>
              <Caption1 block className="mt-1 text-muted-foreground">
                Governance transactions must be sent on Arbitrum (chain ID 42161).
              </Caption1>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-3">
            <div>
              <Caption1 className="text-muted-foreground">Proposal threshold</Caption1>
              <Text block weight="semibold" className="mt-1 tabular-nums">
                {threshold} MOR
              </Text>
            </div>
            <div>
              <Caption1 className="text-muted-foreground">Voting delay</Caption1>
              <Text block weight="semibold" className="mt-1 tabular-nums">
                {statusQuery.data?.votingDelay ?? "—"} blocks
              </Text>
            </div>
            <div>
              <Caption1 className="text-muted-foreground">Voting period</Caption1>
              <Text block weight="semibold" className="mt-1 tabular-nums">
                {statusQuery.data?.votingPeriod ?? "—"} blocks
              </Text>
            </div>
          </div>

          <Field label="Proposal title" required>
            <Input
              value={title}
              onChange={(_e, data) => setTitle(data.value)}
              placeholder="e.g. Expand Infrastructure Learning Program"
            />
          </Field>

          <Field label="Category" required>
            <Dropdown
              value={category}
              selectedOptions={[category]}
              onOptionSelect={(_e, data) => {
                if (data.optionValue) {
                  setCategory(data.optionValue as ProposalCategory);
                }
              }}
            >
              {GOVERNANCE_CATEGORIES.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Dropdown>
          </Field>

          <Field label="Description" required>
            <Textarea
              value={body}
              onChange={(_e, data) => setBody(data.value)}
              placeholder="Describe the proposal rationale, scope, and expected outcomes…"
              rows={8}
            />
          </Field>

          <Field label="On-chain description preview">
            <Textarea value={descriptionPreview} readOnly rows={6} />
          </Field>

          <Caption1 className="text-muted-foreground">
            Default action targets MorGovernanceHub with an empty call (governance signal). Execution can be wired through spells in a follow-up proposal.
          </Caption1>

          {error ? (
            <Caption1 className="text-destructive">{error}</Caption1>
          ) : null}
          {txError ? (
            <Caption1 className="text-destructive">{txError.message}</Caption1>
          ) : null}

          <div className={styles.actions}>
            {(isPending || isConfirming) && (
              <AppSpinner size="tiny" label="Submitting proposal on Arbitrum" />
            )}
            <NeuButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/governance")}
              disabled={isPending || isConfirming}
            >
              Cancel
            </NeuButton>
            <NeuButton
              variant="primary"
              size="sm"
              onClick={onSubmit}
              disabled={!isConnected || wrongNetwork || isPending || isConfirming}
            >
              Submit proposal
            </NeuButton>
          </div>
        </PanelCardBody>
      </PanelCard>
    </div>
  );
}
