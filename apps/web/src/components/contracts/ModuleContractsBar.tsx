"use client";

import { useMemo, useState } from "react";
import {
  Caption1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronDown16Regular,
  Link16Regular,
  PlugConnected16Regular,
} from "@fluentui/react-icons";
import { useMorContractsOptional } from "@/context/MorContractsContext";
import { getArbitrumExplorerAddressUrl } from "@/lib/dsaApi";
import morDeployments from "@/lib/contracts/deployments.arbitrum.json";
import AppSpinner from "@/components/ui/AppSpinner";

const useStyles = makeStyles({
  root: {
    marginBottom: tokens.spacingVerticalL,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    border: "none",
    backgroundColor: "transparent",
    color: "var(--foreground)",
    cursor: "pointer",
    textAlign: "left",
  },
  headerOpen: {
    borderBottom: "1px solid var(--border)",
  },
  chevron: {
    marginLeft: "auto",
    transitionProperty: "transform",
    transitionDuration: tokens.durationFaster,
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  body: {
    display: "grid",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
  },
  item: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalXS,
    borderBottom: "1px solid var(--border)",
    ":last-child": {
      borderBottom: "none",
    },
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
    color: "var(--primary)",
    textDecoration: "none",
    fontSize: tokens.fontSizeBase200,
    ":hover": {
      textDecoration: "underline",
    },
  },
  badge: {
    fontSize: tokens.fontSizeBase100,
    padding: "2px 8px",
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
    textTransform: "capitalize",
  },
  live: {
    color: "#22C38E",
  },
});

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ModuleContractsBar() {
  const styles = useStyles();
  const context = useMorContractsOptional();
  const [open, setOpen] = useState(false);

  const moduleContracts = useMemo(() => {
    if (!context?.currentModule) return [];

    const flat = morDeployments as unknown as Record<string, string>;

    return context.currentModule.contracts.map((contract) => {
      const address = flat[contract.deploymentKey] ?? null;
      const connectorStatus = context.platformStatus?.connectors.find(
        (item) => item.key === contract.deploymentKey
      );

      return {
        ...contract,
        address,
        enabled: connectorStatus?.enabled,
      };
    });
  }, [context?.currentModule, context?.platformStatus]);

  if (!context?.currentModule) {
    return null;
  }

  const connectedCount = moduleContracts.filter((item) => item.address).length;

  return (
    <section className={styles.root} aria-label="Connected MorFinance contracts">
      <button
        type="button"
        className={mergeClasses(styles.header, open && styles.headerOpen)}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <PlugConnected16Regular className={styles.live} />
        <div>
          <Text weight="semibold" size={300}>
            On-chain contracts · {context.currentModule.title}
          </Text>
          <Caption1 block className="text-muted-foreground">
            Arbitrum One · {connectedCount}/{moduleContracts.length} addresses
            wired
          </Caption1>
        </div>
        {context.isLoading ? (
          <AppSpinner size="extra-tiny" label="Loading contracts" />
        ) : null}
        <ChevronDown16Regular
          className={mergeClasses(styles.chevron, open && styles.chevronOpen)}
        />
      </button>

      {open ? (
        <div className={styles.body}>
          {context.platformStatus ? (
            <div className={styles.item}>
              <div>
                <Text size={200} weight="semibold">
                  Live platform DSA
                </Text>
                <Caption1 block className="text-muted-foreground">
                  {context.platformStatus.platformEthBalanceFormatted} ETH +{" "}
                  {context.platformStatus.platformWethBalanceFormatted} WETH
                </Caption1>
              </div>
              {context.platformStatus.platformDsa ? (
                <a
                  href={getArbitrumExplorerAddressUrl(
                    context.platformStatus.platformDsa
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {truncateAddress(context.platformStatus.platformDsa)}
                  <Link16Regular />
                </a>
              ) : null}
            </div>
          ) : null}

          {moduleContracts.map((contract) => (
            <div key={contract.deploymentKey} className={styles.item}>
              <div>
                <Text size={200} weight="semibold">
                  {contract.label}
                </Text>
                <Caption1 block className="text-muted-foreground">
                  {contract.deploymentKey}
                  {contract.enabled === true ? " · enabled" : ""}
                  {contract.enabled === false ? " · disabled" : ""}
                </Caption1>
              </div>
              <div className="flex items-center gap-2">
                <span className={styles.badge}>{contract.group}</span>
                {contract.address ? (
                  <a
                    href={getArbitrumExplorerAddressUrl(contract.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {truncateAddress(contract.address)}
                    <Link16Regular />
                  </a>
                ) : (
                  <Caption1>Not deployed</Caption1>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
