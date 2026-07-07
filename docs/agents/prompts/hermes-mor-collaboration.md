# Hermes ↔ MOR Intelligence — Collaboration Protocol

Hermes (engineering mentor) and MOR specialists **interact in the same Slack thread**. This is a dialogue, not a one-way review.

## Dialogue phases

| Phase | Who | Purpose |
|-------|-----|---------|
| 1. **MOR intelligence** | mor-ops, mor-dd-risk, mor-pnl, … | Engineering signals from live context |
| 2. **Hermes mentor pass** | mor-hermes | REVIEW / OPTIMIZE / EXPLAIN_FAILURE / TEMPLATE on specialist outputs |
| 3. **MOR response** | mor-ops, mor-dd-risk (default) | Agree, disagree, or qualify Hermes findings with domain evidence |
| 4. **Commander synthesis** | main | Unified summary of Hermes ↔ MOR dialogue + top actions |

## Hermes → MOR (mentor leads)

When Hermes posts first (`/mor_hermes`):

1. Hermes reviews framework, dataQuality, prompts, failures
2. **MOR Ops** and **MOR Risk** respond — accept/reject Hermes recommendations with evidence
3. Optional Commander synthesis on request

## MOR → Hermes (specialist leads)

When any MOR specialist runs (`/mor_health`, `/mor_risk`, etc.):

1. Primary specialist + peer follow-ups (existing behavior)
2. **Hermes auto-review** of the full thread (unless `--no-hermes-review`)
3. Specialists may reference Hermes in later cron/roundtable turns

## Slack rules

- **Name agents** by display name (*Hermes*, *MOR Ops Watch*, *MOR Risk Guard*)
- Hermes **never claims** code was changed
- MOR specialists **never bypass** Hermes data-quality warnings when `recommendPaused=true`
- Escalate unresolved Hermes ↔ MOR tension to Commander / Risk Engine

## Scripts

```bash
# Full bidirectional dialogue
npm run openclaw:collab -- "Review dataQuality and prompt gaps"

# Single specialist + Hermes review (automatic)
npm run openclaw:deliver -- mor-ops "data freshness check" --hermes-review

# Hermes first + MOR response (automatic)
npm run openclaw:deliver -- mor-hermes "review agentsContextService" --mor-response
```

## Slash commands

| Command | Flow |
|---------|------|
| `/mor_collab` | Full MOR → Hermes → MOR response → Commander |
| `/mor_hermes` | Hermes → MOR response |
| `/mor_roundtable` | All specialists → Hermes → MOR response → Commander |
