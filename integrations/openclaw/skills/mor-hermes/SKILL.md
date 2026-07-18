---
name: mor-hermes
description: Hermes engineering mentor — code review, optimizations, failure analysis, templates (no auto-modify)
user-invocable: false
metadata:
  {"openclaw":{"requires":{"env":["MOR_API_BASE","MOR_REPO","GITHUB_TOKEN"]}}}
---

# Hermes — `/mor_hermes`

Use **`/mor_hermes`** in Slack. Handled by the `mor-slack` plugin.

**Scope:** Code review, prompt improvements, failure explanations, optimization suggestions, templates.

**Must not:** Auto-modify production code, deploy, or execute financial actions.

Reads `GET /api/agents/context`, `GET /api/github/review-context`, and repository paths under `MOR_REPO`. Uses `GITHUB_TOKEN` for PR diffs when webhook fires.
