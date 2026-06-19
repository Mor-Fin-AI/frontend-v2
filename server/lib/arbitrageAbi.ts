export const morDsaCastAbi = [
  {
    type: "event",
    name: "Cast",
    inputs: [
      { name: "origin", type: "address", indexed: true },
      { name: "spellCount", type: "uint256", indexed: false },
      { name: "nonce", type: "uint256", indexed: false },
    ],
  },
] as const;

export const swapExecutedAbi = [
  {
    type: "event",
    name: "SwapExecuted",
    inputs: [
      { name: "tokenIn", type: "address", indexed: true },
      { name: "tokenOut", type: "address", indexed: true },
      { name: "amountIn", type: "uint256", indexed: false },
      { name: "amountOut", type: "uint256", indexed: false },
    ],
  },
] as const;

export const flashloanExecutedAbi = [
  {
    type: "event",
    name: "FlashloanExecuted",
    inputs: [
      { name: "provider", type: "uint8", indexed: true },
      { name: "asset", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const erc20TransferTopic =
  "0xddf252ad1e2da4ebecd4a213702a6c035c2e1ebaef9c9e1c4976da4251a8d55";

export const uniswapV3SwapTopic =
  "0xc42079f94265775334d6561140e0d612c7059524f4753a6ef95ff878292769d6";

export const uniswapV2SwapTopic =
  "0xd78ad95fa46d05ddcc70454c0191e838dce9cbd7d74c4a50230cc8b7a94795be";
