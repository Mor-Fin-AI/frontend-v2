# Developer Academy — AI Mentor API (OpenClaw + Hermes)

Integration contract for the **Developer Academy** MVP. Mentors recommend and teach only — they never execute trades, modify production, or deploy.

**Base URL (local):** `http://localhost:3001/api`  
**Base URL (env):** `$MOR_API_BASE`

Related components:

| Component | Role |
|-----------|------|
| **OpenClaw** | Agent runtime / gateway (`GET /api/agents/openclaw`) |
| **Hermes** (`mor-hermes`) | Engineering mentor — REVIEW / OPTIMIZE / EXPLAIN_FAILURE / TEMPLATE |
| **Claude** | Academy education mentor — TEACH / GUIDE / CHECK / HANDOFF |

---

## Authentication

| Env | Behavior |
|-----|----------|
| `MOR_MENTOR_API_KEY` **set** | Required on mentor routes |
| `MOR_MENTOR_API_KEY` **unset** | Open (local/dev MVP) |

Send either header:

```http
Authorization: Bearer <MOR_MENTOR_API_KEY>
```

```http
X-MOR-Mentor-Key: <MOR_MENTOR_API_KEY>
```

LLM providers (server-side, not sent by Academy):

| Env | Purpose |
|-----|---------|
| `OPENAI_API_KEY` | Primary for Hermes asks |
| `ANTHROPIC_API_KEY` | Primary for Claude asks (fallback either way) |
| `MOR_MENTOR_OPENAI_MODEL` | Optional (default `gpt-4.1-mini`) |
| `MOR_MENTOR_ANTHROPIC_MODEL` | Optional (default `claude-sonnet-4-5`) |

---

## Endpoints

### 1. Discover mentors + OpenClaw status

```http
GET /api/agents/mentors
```

**Response (shape):**

```json
{
  "generatedAt": "2026-07-18T12:00:00.000Z",
  "product": "developer-academy-ai-mentor",
  "mode": "recommend-only",
  "integration": {
    "openclaw": {
      "gatewayUrl": "http://127.0.0.1:18789",
      "dashboardUrl": "http://127.0.0.1:18789/",
      "reachable": true,
      "configLoaded": true,
      "defaultModel": "openai/gpt-5.4"
    },
    "hermesAgentId": "mor-hermes",
    "claudeVia": "main OpenClaw orchestrator + claude mentor prompt"
  },
  "authentication": {
    "required": false,
    "scheme": "none (MOR_MENTOR_API_KEY unset — local/dev)",
    "headerExamples": [
      "Authorization: Bearer <MOR_MENTOR_API_KEY>",
      "X-MOR-Mentor-Key: <MOR_MENTOR_API_KEY>"
    ]
  },
  "endpoints": {
    "discovery": "GET /api/agents/mentors",
    "ask": "POST /api/agents/mentors/ask",
    "openclawSnapshot": "GET /api/agents/openclaw",
    "liveContext": "GET /api/agents/context",
    "manifest": "GET /api/agents/manifest"
  },
  "mentors": [
    {
      "id": "hermes",
      "openclawAgentId": "mor-hermes",
      "name": "Hermes",
      "role": "mentor",
      "platform": "openclaw",
      "purpose": "Engineering mentor — code review, optimizations, failure analysis, templates.",
      "outputs": ["REVIEW", "OPTIMIZE", "EXPLAIN_FAILURE", "TEMPLATE"],
      "openclaw": {
        "agentId": "mor-hermes",
        "registered": true,
        "model": "openai/gpt-5.4",
        "workspace": "…/integrations/openclaw/workspaces/mor-hermes"
      }
    },
    {
      "id": "claude",
      "openclawAgentId": "main",
      "name": "Claude",
      "outputs": ["TEACH", "GUIDE", "CHECK", "HANDOFF"]
    }
  ]
}
```

### 2. Mentor profile

```http
GET /api/agents/mentors/:mentorId
```

`mentorId` = `hermes` | `claude`

### 3. Ask a mentor (chat turn)

```http
POST /api/agents/mentors/ask
Content-Type: application/json
```

**Request:**

```json
{
  "mentorId": "hermes",
  "message": "Explain why flashloan round-trips can look profitable on quote but fail after fees.",
  "sessionId": "academy-session-42",
  "learnerId": "learner-abc",
  "includeLiveContext": true,
  "history": [
    { "role": "user", "content": "What is Hermes?" },
    { "role": "assistant", "content": "Hermes is the engineering mentor…" }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `mentorId` | `"hermes"` \| `"claude"` | no (default `hermes`) | Which mentor persona |
| `message` | string (1–8000) | **yes** | Learner question |
| `sessionId` | string | no | Echoed for Academy session tracking |
| `learnerId` | string | no | Echoed for Academy analytics |
| `includeLiveContext` | boolean | no (default `true`) | Attach MOR live snapshot |
| `history` | `{role,content}[]` | no | Up to 20 prior turns |

**Response:**

```json
{
  "generatedAt": "2026-07-18T12:00:01.000Z",
  "product": "developer-academy-ai-mentor",
  "mode": "recommend-only",
  "sessionId": "academy-session-42",
  "learnerId": "learner-abc",
  "mentor": {
    "id": "hermes",
    "name": "Hermes",
    "openclawAgentId": "mor-hermes",
    "outputs": ["REVIEW", "OPTIMIZE", "EXPLAIN_FAILURE", "TEMPLATE"]
  },
  "provider": "openai",
  "labels": ["EXPLAIN_FAILURE"],
  "reply": "**EXPLAIN_FAILURE** …",
  "openclaw": {
    "gatewayUrl": "http://127.0.0.1:18789",
    "dashboardUrl": "http://127.0.0.1:18789/",
    "reachable": true
  }
}
```

`provider` is `openai` | `anthropic` | `stub` (stub when no LLM keys are configured).

---

## Supporting OpenClaw endpoints (no mentor key)

These remain public read APIs used by OpenClaw skills and Academy setup checks:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Liveness |
| `GET` | `/api/agents/openclaw` | Gateway + registered agents snapshot |
| `GET` | `/api/agents/context` | Full intelligence snapshot |
| `GET` | `/api/agents/manifest` | Agent framework manifest |

---

## Quick start (Academy client)

```bash
# 1) Start MOR API
npm run dev:server

# 2) Optional: OpenClaw gateway
npm run openclaw:gateway

# 3) Discover
curl -sS http://localhost:3001/api/agents/mentors | jq .

# 4) Ask Hermes
curl -sS -X POST http://localhost:3001/api/agents/mentors/ask \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${MOR_MENTOR_API_KEY}" \
  -d '{
    "mentorId": "hermes",
    "message": "Review the flashloan opportunity thresholds for Academy learners.",
    "sessionId": "demo-1",
    "learnerId": "demo-learner"
  }' | jq .
```

---

## Boundaries (MVP)

- Mentors **recommend / teach only**
- Hermes never claims production code was changed
- Claude never deploys or executes financial actions
- Execution hierarchy unchanged: Agents → Risk Engine → Execution Engine
