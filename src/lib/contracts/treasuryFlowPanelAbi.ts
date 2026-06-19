export const morTreasuryFlowPanelAbi = [
  {
    type: "event",
    name: "DischargeStatusUpdated",
    inputs: [
      { name: "dischargeId", type: "bytes32", indexed: true },
      { name: "status", type: "uint8", indexed: false },
      { name: "dsa", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
    ],
  },
  {
    type: "function",
    name: "getGlobalFlowPanel",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "treasuryBalanceSum", type: "uint256" },
          { name: "totalFeesCollectedSum", type: "uint256" },
          { name: "borrowCapitalActiveSum", type: "uint256" },
          { name: "netCapitalRecycledSum", type: "uint256" },
          { name: "dischargesPending", type: "uint256" },
          { name: "dischargesActive", type: "uint256" },
          { name: "dischargesCompleted", type: "uint256" },
          { name: "dischargesFailed", type: "uint256" },
          { name: "lastUpdatedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getTokenFlowPanel",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      {
        type: "tuple",
        name: "panel",
        components: [
          { name: "treasuryBalance", type: "uint256" },
          { name: "totalFeesCollected", type: "uint256" },
          { name: "borrowCapitalActive", type: "uint256" },
          { name: "netCapitalRecycled", type: "uint256" },
          { name: "lastUpdatedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getDischarge",
    stateMutability: "view",
    inputs: [{ name: "dischargeId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "dischargeId", type: "bytes32" },
          { name: "dsa", type: "address" },
          { name: "token", type: "address" },
          { name: "status", type: "uint8" },
          { name: "capitalDeployed", type: "uint256" },
          { name: "capitalReturned", type: "uint256" },
          { name: "startedAt", type: "uint64" },
          { name: "completedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "dsaBorrowActive",
    stateMutability: "view",
    inputs: [
      { name: "dsa", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const DISCHARGE_STATUS_LABELS = [
  "Pending",
  "Active",
  "Completed",
  "Failed",
] as const;

export function dischargeStatusLabel(status: number) {
  return DISCHARGE_STATUS_LABELS[status] ?? "Unknown";
}

export function mapDischargeToLoanStatus(
  status: number
): "Active" | "Discharging" | "Repaid" {
  if (status === 2) return "Repaid";
  if (status === 1) return "Discharging";
  return "Active";
}
