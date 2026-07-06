# GitHub ↔ Slack Agent Integration

Connect GitHub activity to five Slack channels, each with a dedicated agent workflow. You can also install recurring workflow cron jobs so MOR subagents post scheduled audit, suggestion, and collaboration reports into their GitHub-focused Slack channels.

## Channels

| Channel | Env variable | Purpose |
|---------|--------------|---------|
| `#mor-agents` | `SLACK_CHANNEL_MOR_AGENTS` | Hermes + MOR specialists interact (full collab) |
| `#mor-audit` | `SLACK_CHANNEL_MOR_AUDIT` | Code audit reviews by agents |
| `#mor-github-events` | `SLACK_CHANNEL_MOR_GITHUB_EVENTS` | PR / issue / commit activity feed |
| `#mor-suggestion` | `SLACK_CHANNEL_MOR_SUGGESTION` | Agent project improvement suggestions |
| `#mor-codefix` | `SLACK_CHANNEL_MOR_CODEFIX` | Discuss fixes + PR templates (human approval) |

Create these channels in Slack, invite the bot, copy channel IDs (`C…`).

## Environment

Add to `integrations/openclaw/subagents.env` and `openclaw/.env`:

```bash
# Slack channel IDs
SLACK_CHANNEL_MOR_AGENTS=Cxxxxxxxx
SLACK_CHANNEL_MOR_AUDIT=Cxxxxxxxx
SLACK_CHANNEL_MOR_GITHUB_EVENTS=Cxxxxxxxx
SLACK_CHANNEL_MOR_SUGGESTION=Cxxxxxxxx
SLACK_CHANNEL_MOR_CODEFIX=Cxxxxxxxx

# GitHub webhook
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_TOKEN=ghp_...          # optional — future PR automation

# Auto-triggers (optional)
GITHUB_AUTO_AUDIT_PR=true          # PR opened/sync → mor-audit thread
GITHUB_AUTO_SUGGESTION=false       # PR opened → mor-suggestion
GITHUB_AUTO_SUGGESTION_ISSUES=true # Issue opened/reopened → mor-suggestion
GITHUB_AUTO_AGENTS_ISSUES=true     # Issue opened/reopened → mor-agents
GITHUB_AUTO_CODEFIX=false          # @hermes or /mor_codefix in PR comment
```

## Scheduled workflow cron jobs

The repo now supports recurring GitHub workflow jobs via `npm run openclaw:cron:install`.

| Job | Workflow | Schedule |
|-----|----------|----------|
| MOR GitHub Audit Sweep | `mor-audit` | Weekdays 10am and 4pm |
| MOR GitHub Suggestion Sweep | `mor-suggestion` | Weekdays 10:30am and 4:30pm |
| MOR GitHub Agents Collaboration | `mor-agents` | Weekdays 11am and 5pm |

These jobs route through `scripts/deliver-slack-github-workflow.mjs`, which assigns work to the existing MOR subagent plans for each channel.

Install or refresh cron jobs:

```bash
npm run openclaw:cron:install -- --force
```

## Code review (repo diffs)

Agents now receive **actual code** from GitHub events:

| Event | Code source |
|-------|-------------|
| **Pull request** | GitHub API diff + file patches (`GITHUB_TOKEN` required) |
| **Push** | Local `git diff before..after` when repo is checked out on this machine |
| **All** | Saved to `integrations/openclaw/state/github-review-context.json` |

### Enable automatic code audit

```bash
GITHUB_AUTO_REVIEW_CODE=true
GITHUB_AUTO_AUDIT_PR=true
GITHUB_TOKEN=ghp_...    # GitHub → Settings → Developer settings → PAT (repo scope)
```

On PR open/sync or push, agents in `#mor-audit` receive diffs and review real code — not just event metadata.

Manual audit with latest saved context:

```bash
npm run openclaw:github:audit -- "review latest GitHub change"
```

Inspect saved context: `GET http://localhost:3001/api/github/review-context`


GitHub cannot reach `http://localhost:3001`. Use a tunnel:

```bash
# Terminal 1 — API
npm run dev:server

# Terminal 2 — tunnel (prints webhook URL)
npm run github:tunnel
```

Copy the printed URL into GitHub → **Settings → Webhooks** (not `localhost`).

For deployed servers, use your public API URL instead of ngrok.

### Manual ngrok

1. Expose API: `ngrok http 3001` (or `npm run github:tunnel`)
2. GitHub repo → **Settings → Webhooks → Add webhook**
3. **Payload URL:** `https://<host>/api/github/webhook`
4. **Content type:** `application/json`
5. **Secret:** same as `GITHUB_WEBHOOK_SECRET`
6. **Events:** Pull requests, Issues, Pushes, Issue comments

Verify: `GET /api/github/workflows` lists channel configuration status.

## Slash commands

| Slash | Workflow |
|-------|----------|
| `/mor_agents` | Full Hermes ↔ MOR collab in `#mor-agents` |
| `/mor_audit` | Audit sequence in `#mor-audit` |
| `/mor_github` | GitHub events channel status |
| `/mor_suggestion` | Suggestion round in `#mor-suggestion` |
| `/mor_codefix` | Codefix dialogue in `#mor-codefix` |

Run slash commands **in the target channel** so thread context is preserved.

Reinstall Slack app from `docs/agents/slack-app-manifest.json` after adding commands.

## Manual delivery

```bash
npm run openclaw:github:agents -- "review smart router integration"
npm run openclaw:github:audit -- "audit PR #42"
npm run openclaw:github:suggestion -- "suggest observability improvements"
npm run openclaw:github:codefix -- "fix stale arbitrage telemetry"
```

## Architecture

```
GitHub webhook → POST /api/github/webhook
              → #mor-github-events (formatted post)
              → optional agent workflows (audit / suggestion / codefix / issue-driven agents)

Scheduled cron → install-mor-cron-jobs.mjs
               → deliver-slack-github-workflow.mjs
               → channel-specific agent sequence or collab

Slash / manual → deliver-slack-github-workflow.mjs
              → channel-specific agent sequence or collab
```

## Agent safety

- All workflows are **recommend-only**
- Codefix outputs **TEMPLATE** and **READY_FOR_PR** — never auto-opens PRs
- Financial execution paths require Risk Engine review
- Hermes never claims production changes were made

## Prompts

- `docs/agents/prompts/github-agents-collab.md`
- `docs/agents/prompts/github-audit.md`
- `docs/agents/prompts/github-suggestion.md`
- `docs/agents/prompts/github-codefix.md`
