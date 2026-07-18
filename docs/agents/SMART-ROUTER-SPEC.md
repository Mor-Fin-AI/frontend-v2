# Smart Router Agent Specification

## Objective

Maximize realized net profit by selecting only arbitrage routes that have the highest probability of remaining profitable from discovery through on-chain execution.

The router prioritizes **execution quality** over the number of opportunities found.

## Architecture

```
Scanner candidates → Smart Router scoring (API) → Agent interpretation → Risk Engine → Execution Engine
```

Agents recommend only. Scoring runs server-side at `GET /api/agents/context` → `smartRouter` and `GET /api/agents/smart-router`.

Implementation: `server/services/smartRouterScoringService.ts`  
Thresholds: `server/data/smartRouterConfig.ts`

## Primary inputs

For every candidate route collect:

- Route path
- Token sequence
- Input trade size
- Expected output
- Gross arbitrage profit
- Expected BPS
- Gas estimate
- Flash loan fee
- Liquidity depth
- Price impact
- Slippage estimate
- Number of DEX hops
- Historical execution success rate
- Historical realized vs quoted profit
- Historical latency for this route
- Historical failure reason (if any)
- Pool TVL
- Pool volatility
- Block timestamp
- Chain congestion

## Route evaluation

Score every candidate using a weighted model.

**Positive factors**

- Higher expected net profit
- Higher BPS
- Deeper liquidity
- Lower slippage
- Lower gas percentage
- High execution success history
- Stable pricing
- Low latency history
- Frequently successful route

**Negative factors**

- Thin liquidity
- Large price impact
- Excessive gas
- Long multi-hop paths
- Historically failing routes
- High MEV exposure
- Highly volatile pools
- Congested blocks

## Route elimination rules

Reject routes when:

- Expected net profit ≤ 0
- Gas exceeds configurable threshold
- Slippage exceeds threshold
- Liquidity insufficient for trade size
- Historical success rate below threshold
- Execution latency historically exceeds profitability window

## Route ranking

Rank routes by:

1. Expected net profit
2. Probability of successful execution
3. Expected realized BPS
4. Gas efficiency
5. Historical consistency

**Never rank solely by quoted spread.**

## Adaptive learning

Continuously update route scores using live execution data.

Track:

- Detection count
- Execution attempts
- Successful executions
- Failed executions
- Average realized profit
- Average realized BPS
- Gas consumed
- Average latency
- ROI

Reduce confidence in routes with repeated failures. Increase confidence in routes with repeated successful executions.

## Output

Return only the highest-confidence routes that satisfy all thresholds.

Each recommendation includes:

- Route
- Expected net profit
- Expected BPS
- Confidence score
- Success probability
- Gas estimate
- Slippage estimate
- Liquidity score
- Recommended trade size
- Risk level
- Execution priority

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents/context` | GET | Full snapshot including `smartRouter` |
| `/api/agents/smart-router` | GET | Smart router evaluation only |
| `/api/agents/smart-router/evaluate` | POST | Evaluate optional `candidates[]` body against historical learning |
| `/api/agents/flashloan-opportunities` | GET | Screen Smart Router output for flashloan viability |
| `/api/agents/flashloan-opportunities/evaluate` | POST | Score optional `candidates[]` for a supported flashloan provider |

## Flashloan Opportunity Engine

The Flashloan Opportunity Engine is a deterministic, recommend-only layer on
top of Smart Router output. By default it consumes **live on-chain DEX quotes**
from `server/services/flashloanLiveQuoteService.ts` (curated 2-hop routes in
`server/data/flashloanQuoteRoutes.ts`), then screens them for flashloan
viability. Historical DSA Casts supply learning priors only.

It:

- quotes Uniswap V3 (QuoterV2) and V2 routers via read-only `eth_call`;
- estimates provider fees against the recommended trade size;
- ranks by expected value after success probability and failed-attempt gas;
- rejects low-confidence, low-success, or poor profit-to-fee candidates;
- returns `OPPORTUNITY`, `WATCH`, or `REJECT` with `dataSource: "live-quotes"`;
- requires Risk Engine approval before any Execution Engine enqueue.

It never signs, submits, or executes a transaction.

Run a manual Slack scan with:

```bash
npm run openclaw:flashloan:scan -- --dry-run
```

The manifest installs `MOR Flashloan Opportunity Scan` every 30 minutes via
`npm run openclaw:cron:install`.

## Agent integration

- Agent ID: `mor-smart-router`
- Prompt: `docs/agents/prompts/smart-router-intelligence.md`
- Output labels: `ROUTE`, `REDUCE SIZE`, `WATCH`, `AVOID`
