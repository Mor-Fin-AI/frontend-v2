#!/usr/bin/env bash
# Send one test message per MOR agent to your Slack DM — each with its own name + avatar.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export OPENCLAW_CONFIG_PATH="${OPENCLAW_CONFIG_PATH:-$REPO_ROOT/integrations/openclaw/openclaw.json}"
export OPENCLAW_STATE_DIR="${OPENCLAW_STATE_DIR:-$REPO_ROOT/integrations/openclaw/state}"

if [[ -f "$REPO_ROOT/integrations/openclaw/subagents.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/integrations/openclaw/subagents.env"
  set +a
fi
if [[ -f "$REPO_ROOT/openclaw/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/openclaw/.env"
  set +a
fi

TO="${SLACK_ALERT_USER_ID:-}"
if [[ -z "$TO" ]]; then
  echo "Set SLACK_ALERT_USER_ID in openclaw/.env (your Slack user id, e.g. U0265N69A2W)"
  exit 1
fi

PROMPT='Identity check: reply in one short line confirming your specialist role and current recommendation label format. Never execute trades.'

run_agent() {
  local id="$1"
  local label="$2"
  echo ""
  echo "→ $label ($id)"
  openclaw agent \
    --agent "$id" \
    --channel slack \
    --to "$TO" \
    --deliver \
    -m "$PROMPT" || echo "  (failed — is the gateway running? npm run openclaw:gateway)"
}

echo "Sending 6 identity test messages to Slack user $TO ..."
echo "Requires: npm run openclaw:gateway + chat:write.customize on your Slack app"

run_agent main "MOR Commander"
run_agent mor-pnl "MOR PnL Intel"
run_agent mor-liquidity "MOR Liquidity"
run_agent mor-dd-risk "MOR Risk Guard"
run_agent mor-market-mode "MOR Market Mode"
run_agent mor-capital-ladder "MOR Capital"

echo ""
echo "Done. Check your Slack DM for 6 messages with different names/avatars."
