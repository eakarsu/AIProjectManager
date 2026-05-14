# Audit Note — AIProjectManager

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_07.md` section #1.

## Original Recommendations

### Gaps — AI Counterparts
- `/estimate-timeline` (added)
- `/smart-assign` (added)
- `/extract-from-spec`

### Gaps — Non-AI Features
- Public API / webhook system
- Jira/GitHub/Linear integration
- Audit logging

### Custom Feature Suggestions
1. Agentic sprint planner
2. Real-time burndown WebSocket feed
3. Cross-team resource optimization
4. Document → backlog ingestion
5. Meeting recording transcription
6. Sentiment-driven sprint review

## Implemented (Mechanical)
- `POST /api/ai/estimate-timeline` — added in `backend/routes/ai.js`. Pulls project + backlog (or accepts inline scope/velocity/team), returns estimated completion, milestones, critical path, risks, buffer recommendation. Persists via `persistAiResult`.
- `POST /api/ai/smart-assign` — added in `backend/routes/ai.js`. Joins tasks + team members, returns assignments with rationale, unassigned reasons, load-after projections, warnings.

Both follow existing `callOpenRouter`/`parseAIJson`/`persistAiResult` style.

## Backlog (deferred)

### NEEDS-CREDS / NEW-DEPS
- Jira/GitHub/Linear OAuth + sync.
- Webhook framework (Svix or custom).
- Meeting transcription (Whisper, Deepgram).

### NEEDS-PRODUCT-DECISION
- Audit-log data model (which actions, retention).
- `/extract-from-spec` — needs file storage + parsing pipeline (PDF/Markdown).

### TOO-RISKY
- Real-time burndown WebSocket (infra change).
- Agentic background sprint planner (needs scheduler).

## Apply pass 3 (frontend)

LEFT-AS-IS — frontend already wires every backend AI endpoint (JWT Bearer from localStorage, matching existing styling, 503-no-key handled by backend). No changes needed. See `_AUDIT/apply3_logs/ab3_52.md` for details.

## Apply pass 4 (mechanical backlog)

Implemented 2 mechanical features (cap 5; no remaining mechanical items).

| # | Item | BE | FE |
|---|------|----|----|
| 1 | Sentiment-driven sprint review | `POST /api/ai/sentiment-sprint-review` in `backend/routes/ai.js` | `frontend/src/pages/SentimentSprintReview.jsx` |
| 2 | Cross-team resource optimization | `POST /api/ai/cross-team-optimize` in `backend/routes/ai.js` | `frontend/src/pages/CrossTeamOptimize.jsx` |

Both endpoints reuse the existing `callOpenRouter`/`parseAIJson`/`persistAiResult` pattern, optionally hydrate from Postgres (retrospectives, projects, team_members, tasks), and 503 on missing `OPENROUTER_API_KEY` via shared `requireApiKey` helper. Frontend pages reuse existing JWT-Bearer fetch wrapper and matching styling. `node --check backend/routes/ai.js` passes. No new deps. See `_AUDIT/apply4_logs/ab3_52.md`.

Remaining backlog stays deferred: Jira/GitHub/Linear OAuth (NEEDS-CREDS), webhook framework (NEEDS-NEW-DEPS), meeting transcription (NEEDS-CREDS), audit-log model + extract-from-spec (NEEDS-PRODUCT-DECISION), real-time burndown WebSocket / agentic background sprint planner (TOO-RISKY infra changes).
