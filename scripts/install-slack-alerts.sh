#!/usr/bin/env bash
# Register MOR Slack cron jobs (delegates to install-mor-cron-jobs.mjs).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$REPO_ROOT/scripts/install-mor-cron-jobs.mjs" "$@"
