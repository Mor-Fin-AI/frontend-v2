"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMorDeployments,
  fetchPlatformStatus,
  type MorDeploymentsResponse,
  type PlatformStatusResponse,
} from "@/lib/dsaApi";
import {
  resolveMorModule,
  type MorModuleDefinition,
} from "@/lib/contracts/moduleRegistry";

type MorContractsContextValue = {
  deployments: MorDeploymentsResponse | undefined;
  platformStatus: PlatformStatusResponse | undefined;
  isLoading: boolean;
  error: string | null;
  currentModule: MorModuleDefinition | null;
  refetch: () => void;
};

const MorContractsContext = createContext<MorContractsContextValue | null>(
  null
);

export function MorContractsProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const currentModule = useMemo(() => resolveMorModule(pathname), [pathname]);

  const deploymentsQuery = useQuery({
    queryKey: ["mor-deployments"],
    queryFn: fetchMorDeployments,
    staleTime: 60_000 * 10,
  });

  const statusQuery = useQuery({
    queryKey: ["mor-platform-status"],
    queryFn: fetchPlatformStatus,
    staleTime: 30_000,
  });

  const value = useMemo(
    (): MorContractsContextValue => ({
      deployments: deploymentsQuery.data,
      platformStatus: statusQuery.data,
      isLoading: deploymentsQuery.isLoading || statusQuery.isLoading,
      error:
        (deploymentsQuery.error instanceof Error
          ? deploymentsQuery.error.message
          : null) ??
        (statusQuery.error instanceof Error ? statusQuery.error.message : null),
      currentModule,
      refetch: () => {
        void deploymentsQuery.refetch();
        void statusQuery.refetch();
      },
    }),
    [
      currentModule,
      deploymentsQuery.data,
      deploymentsQuery.error,
      deploymentsQuery.isLoading,
      statusQuery.data,
      statusQuery.error,
      statusQuery.isLoading,
      deploymentsQuery.refetch,
      statusQuery.refetch,
    ]
  );

  return (
    <MorContractsContext.Provider value={value}>
      {children}
    </MorContractsContext.Provider>
  );
}

export function useMorContracts() {
  const context = useContext(MorContractsContext);
  if (!context) {
    throw new Error("useMorContracts must be used within MorContractsProvider");
  }
  return context;
}

export function useMorContractsOptional() {
  return useContext(MorContractsContext);
}
