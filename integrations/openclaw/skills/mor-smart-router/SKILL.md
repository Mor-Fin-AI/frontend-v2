---
name: mor-smart-router
description: Direct chat with MOR Smart Router — execution-quality route ranking (ROUTE / AVOID)
user-invocable: false
metadata:
  {"openclaw":{"requires":{"env":["MOR_API_BASE"]}}}
---

# MOR Smart Router

Slack slash: `/mor_router` — **execution-quality route ranking** by confidence and success probability (not spread alone).

Pull `GET /api/agents/context` → `smartRouter.recommendations`.
