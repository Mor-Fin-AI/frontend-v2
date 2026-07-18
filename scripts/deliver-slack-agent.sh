#!/usr/bin/env bash
# Deliver a Slack DM as a specific MOR agent (own name + avatar).
# Usage: deliver-slack-agent.sh <agentId> "<message>" [--to SLACK_USER_ID]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$REPO_ROOT/scripts/deliver-slack-agent.mjs" "$@"
