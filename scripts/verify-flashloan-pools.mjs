#!/usr/bin/env node
/**
 * Verify every configured flashloan quote pool/pair on-chain via RPC.
 * Read-only: pool token0/token1/fee, liquidity presence, and a live quote per leg.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPublicClient, formatUnits, http, parseUnits } from "viem";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
for (const envPath of [
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, ".env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const { FLASHLOAN_CHAIN_CONFIGS, resolveChainRpcUrl } = await import(
  "../server/data/flashloanQuoteRoutes.ts"
);

const poolAbi = [
  { type: "function", name: "token0", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "token1", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "fee", stateMutability: "view", inputs: [], outputs: [{ type: "uint24" }] },
  { type: "function", name: "liquidity", stateMutability: "view", inputs: [], outputs: [{ type: "uint128" }] },
];

const quoterV1Abi = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "amountIn", type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
];

const quoterV2Abi = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
];

const v2RouterAbi = [
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function quoteLeg(client, chainCfg, leg, amountIn) {
  const tokenIn = chainCfg.tokens[leg.tokenIn];
  const tokenOut = chainCfg.tokens[leg.tokenOut];
  if (leg.type === "v3") {
    if (chainCfg.quoterStyle === "v2") {
      const result = await client.simulateContract({
        address: chainCfg.quoter,
        abi: quoterV2Abi,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            amountIn,
            fee: leg.fee,
            sqrtPriceLimitX96: 0n,
          },
        ],
      });
      return result.result[0];
    }
    const result = await client.simulateContract({
      address: chainCfg.quoter,
      abi: quoterV1Abi,
      functionName: "quoteExactInputSingle",
      args: [tokenIn.address, tokenOut.address, leg.fee, amountIn, 0n],
    });
    return result.result;
  }
  const amounts = await client.readContract({
    address: leg.router,
    abi: v2RouterAbi,
    functionName: "getAmountsOut",
    args: [amountIn, [tokenIn.address, tokenOut.address]],
  });
  return amounts[amounts.length - 1];
}

let pass = 0;
let fail = 0;

for (const chainCfg of Object.values(FLASHLOAN_CHAIN_CONFIGS)) {
  const rpc = resolveChainRpcUrl(chainCfg);
  const client = createPublicClient({ chain: chainCfg.viemChain, transport: http(rpc) });
  console.log(`\n=== ${chainCfg.name} (chainId ${chainCfg.chainId}) ===`);
  console.log(`RPC: ${rpc}`);
  try {
    const block = await client.getBlockNumber();
    console.log(`Latest block: ${block}`);
  } catch (error) {
    console.log(`RPC UNREACHABLE: ${error.shortMessage ?? error.message}`);
    fail++;
    continue;
  }

  const seenPools = new Map();
  for (const route of chainCfg.routes) {
    for (const leg of route.legs) {
      if (leg.type !== "v3" || seenPools.has(leg.pool)) continue;
      seenPools.set(leg.pool, leg);
    }
  }

  for (const [pool, leg] of seenPools) {
    try {
      const [t0, t1, fee, liquidity] = await Promise.all([
        client.readContract({ address: pool, abi: poolAbi, functionName: "token0" }),
        client.readContract({ address: pool, abi: poolAbi, functionName: "token1" }),
        client.readContract({ address: pool, abi: poolAbi, functionName: "fee" }),
        client.readContract({ address: pool, abi: poolAbi, functionName: "liquidity" }),
      ]);
      const expected = [
        chainCfg.tokens[leg.tokenIn].address.toLowerCase(),
        chainCfg.tokens[leg.tokenOut].address.toLowerCase(),
      ].sort();
      const actual = [t0.toLowerCase(), t1.toLowerCase()].sort();
      const tokensOk = expected[0] === actual[0] && expected[1] === actual[1];
      const feeOk = Number(fee) === leg.fee;
      const hasLiquidity = liquidity > 0n;
      const ok = tokensOk && feeOk && hasLiquidity;
      ok ? pass++ : fail++;
      console.log(
        `${ok ? "PASS" : "FAIL"}  pool ${pool} (${leg.label} ${leg.tokenIn}/${leg.tokenOut})` +
          ` fee=${Number(fee)}${feeOk ? "" : `≠${leg.fee}!`}` +
          ` tokens=${tokensOk ? "match" : "MISMATCH"}` +
          ` liquidity=${hasLiquidity ? liquidity.toString() : "ZERO"}`,
      );
    } catch (error) {
      fail++;
      console.log(`FAIL  pool ${pool}: ${error.shortMessage ?? error.message?.slice(0, 100)}`);
    }
    await sleep(150);
  }

  for (const route of chainCfg.routes) {
    const flash = chainCfg.tokens[route.flashToken];
    const size = route.sizesFlashToken[0];
    const amountIn = parseUnits(String(size), flash.decimals);
    try {
      const mid = await quoteLeg(client, chainCfg, route.legs[0], amountIn);
      const out = await quoteLeg(client, chainCfg, route.legs[1], mid);
      const outHuman = Number(formatUnits(out, flash.decimals));
      const bps = ((outHuman - size) / size) * 10_000;
      pass++;
      console.log(
        `PASS  quote ${route.id} (${route.pair}) ${size} ${route.flashToken} → ${outHuman.toFixed(6)} (${bps.toFixed(1)} bps)`,
      );
    } catch (error) {
      fail++;
      console.log(
        `FAIL  quote ${route.id}: ${error.shortMessage ?? error.message?.slice(0, 100)}`,
      );
    }
    await sleep(250);
  }
}

console.log(`\n=== Summary: ${pass} passed, ${fail} failed ===`);
process.exit(fail > 0 ? 1 : 0);
