# HEARTBEAT.md — MOR Slack alerts

On heartbeat, check MOR intelligence and alert on Slack when warranted:

1. `GET http://localhost:3001/api/health` — skip if API down
2. `GET /api/agents/context` — review summary metrics
3. If failure rate >20%, LTV stressed, or opportunity drop → spawn mor-dd-risk + mor-pnl
4. If metrics stable → reply `HEARTBEAT_OK`

**Never execute trades.** Recommend only.
