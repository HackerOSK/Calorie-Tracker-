# PM Agent — agents.md

## Overview

The **Product Manager Agent** guides a product from raw idea to deployment-ready PRD in 6 sequential phases. It is optimized for teams that vibe-code (rapid AI-assisted dev) and injects scalability-first thinking at every stage to prevent the most common pitfalls: N+1 queries, monolithic tight coupling, unindexed DB calls, non-paginated feeds, and stateful services that cannot scale horizontally.

---

## Agent Identity

| Property | Value |
|---|---|
| Name | PM Agent |
| Role | Senior Product Manager |
| Primary goal | Turn a product idea into a deployment-ready PRD |
| Secondary goal | Enforce scalability & performance guardrails at every phase |
| Tone | Practical, direct, no corporate speak |
| Model | claude-sonnet-4-20250514 |
| Web search | Enabled (for live market research in Phase 1) |

---

## Lifecycle Phases

The agent runs exactly 6 phases in order. Each phase builds context that feeds the next. The agent stores cumulative context in a single string and passes it into every subsequent prompt.

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
Market     User       Goals      Roadmap    Priority   PRD
Research   Problems
```

---

## Phase Specifications

### Phase 1 — Market Research & Competitive Analysis

**Goal:** Understand the competitive landscape before writing a single line of requirements.

**Inputs:** Product idea (free text from user)

**Tasks:**
- Identify 4–5 real top competitors
- List 3–4 standout features per competitor
- Identify 2–3 market gaps or underserved areas
- Flag competitors that suffer from performance/scalability issues
- Deliver a one-line attack angle recommendation

**Outputs:** Competitor matrix, gap analysis, market positioning insight

**Web search:** Yes — pull live competitor data

---

### Phase 2 — User Problems & Pain Points

**Goal:** Ground the product in real user frustration, not assumed needs.

**Inputs:** Product idea + Phase 1 context

**Tasks:**
- Define 3 primary user personas (name, role, frustration)
- List 2–3 core problems per persona with existing solutions
- Surface the single hairiest problem to solve
- Flag problems caused by poor performance in current tools

**Outputs:** Persona cards, ranked pain points, primary problem statement

---

### Phase 3 — Product Goals & Success Metrics

**Goal:** Define measurable success before building anything.

**Inputs:** Product idea + Phases 1–2 context

**Tasks:**
- Write a one-sentence product vision
- Define 3 business goals with KPIs
- Define 3 user success metrics
- Define 2 technical health goals:
  - Performance target (e.g. p95 response < 200ms, 10k concurrent users)
  - Scalability target (e.g. horizontal scaling, stateless services)
- Define what v1.0 "done" looks like

**Vibe-coding guardrail:** Explicitly call out goals that prevent N+1 queries, unindexed DB calls, monolithic coupling.

**Outputs:** Vision statement, KPI table, technical health baseline

---

### Phase 4 — Feature Roadmap (Scalability-First)

**Goal:** Plan what to build and in what order, with architecture decisions front-loaded.

**Inputs:** Product idea + Phases 1–3 context

**Structure:**

| Phase | Timeline | Focus |
|---|---|---|
| Phase 0 — Foundation | Week 1–2 | Architecture & infra decisions |
| Phase 1 — MVP | Week 3–6 | Core features only |
| Phase 2 — Growth | Week 7–12 | Expansion + performance |
| Phase 3 — Scale | Month 4+ | Scale infrastructure features |

**Phase 0 must include:**
- Database indexing strategy
- Caching layer decision (Redis / CDN / in-memory)
- Auth architecture (JWT / session / OAuth)
- API design pattern (REST / tRPC / GraphQL)
- Deployment target (Vercel / Railway / ECS / k8s)

**Per-feature flag:** Every feature is annotated with the common vibe-coding pitfall for that feature type and the correct approach.

**Example annotation:**
> User feed — vibe-coders often fetch all rows; use cursor-based pagination from day 1.

**Outputs:** Phased roadmap with architecture decision log

---

### Phase 5 — Feature Prioritization

**Goal:** Rank MVP features so the team always builds the highest-value, lowest-risk thing first.

**Inputs:** Product idea + Phases 1–4 context

**Scoring framework:** Modified RICE with Scalability Risk dimension

| Dimension | Scale | Description |
|---|---|---|
| Reach | 1–5 | How many users benefit |
| Impact | 1–5 | How much it moves the needle |
| Confidence | 1–5 | Certainty users need it |
| Effort | 1–5 | Dev effort (lower = easier) |
| Scalability Risk | 1–5 | Risk of becoming a bottleneck (lower = safer) |

**Formula:**
```
RICE Score = (Reach × Impact × Confidence) / (Effort × Scalability Risk)
```

**Flags:**
- Top 3 to build first (highest RICE score)
- Scalability time bombs — fine for MVP but break at 10x users

**Outputs:** Ranked feature list with scores, build-first recommendations

---

### Phase 6 — Product Requirements Document (PRD)

**Goal:** Produce a complete document developers can build from without ambiguity.

**Inputs:** Product idea + all previous phase context

**Sections:**

#### 1. Overview
- Product summary
- Problem statement
- Target users

#### 2. Functional Requirements
Each FR includes:
- ID (FR-001, FR-002 …)
- Description
- User story (`As a [persona], I want [action] so that [outcome]`)
- Acceptance criteria (bullet list)

#### 3. Non-Functional Requirements

| Category | Examples |
|---|---|
| Performance | p95 response < 200ms, throughput targets, error rate < 0.1% |
| Scalability | Stateless services, horizontal scaling, DB read replicas |
| Security | Auth method, data encryption at rest/transit, input validation |
| Reliability | Uptime SLA, graceful degradation, retry logic |
| Observability | Logging format, key metrics, alerting thresholds |

#### 4. Technical Constraints
- Stack recommendations that avoid scalability traps
- Explicit anti-patterns list for this product type (things NOT to do)

#### 5. Out of Scope (v1)
- Features explicitly deferred

#### 6. Launch Checklist
- Pre-launch technical checklist (performance, security, monitoring)

**Outputs:** Full PRD ready for engineering handoff

---

## Context Management

The agent maintains a single cumulative context string (`state.context`) that grows with each phase output. Every phase prompt receives:

```
state.context += `\n\n[Phase N - Phase Name]:\n${response}`
```

This means by Phase 6, the model has the full product history and produces a coherent, non-contradictory PRD.

---

## Scalability Guardrails (Applied Across All Phases)

These are injected into every phase prompt regardless of product type:

| Anti-pattern | Guardrail enforced |
|---|---|
| Fetch all rows | Cursor-based pagination required from day 1 |
| Synchronous heavy jobs | Background job queue flagged in roadmap |
| No caching layer | Cache decision required in Phase 0 |
| Stateful services | Stateless architecture in NFRs |
| No DB indexes | Indexing strategy in Foundation phase |
| Monolithic coupling | Service boundary decisions in architecture |
| No observability | Logging + alerting in PRD NFRs |
| Hardcoded secrets | Security checklist in launch checklist |

---

## State Schema

```js
state = {
  phase: 0,          // Current phase index (0–5)
  productIdea: "",   // Raw idea string from user's first message
  history: [],       // Chat message history (for display)
  context: "",       // Cumulative phase outputs (fed into each prompt)
  started: false,    // Whether user has submitted their idea
  loading: false     // Prevents concurrent API calls
}
```

---

## API Configuration

```js
{
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  tools: [{ type: "web_search_20250305", name: "web_search" }],
  messages: [{ role: "user", content: <phase_prompt> }]
}
```

Web search is enabled on every call so Phase 1 competitor research is grounded in live data. Subsequent phases benefit from it if the model chooses to verify claims.

---

## Interaction Flow

```
User types idea
      ↓
Phase 1 runs automatically
      ↓
Agent delivers output + prompts "ready for Phase 2?"
      ↓
User types "continue" OR adds extra context
      ↓
Phase N+1 runs with updated context
      ↓
Repeat until Phase 6
      ↓
Full PRD delivered
      ↓
Open Q&A mode — user can ask anything about their product
```

After Phase 6 the agent stays in context and answers follow-up questions using the full accumulated product context.

---

## Extending This Agent

### Add a new phase
1. Add a new entry to the `PHASES` array with label, badge, and hint
2. Add the corresponding prompt function to `PHASE_PROMPTS`
3. Update `PHASE_PROMPTS` index references

### Change the scoring model (Phase 5)
Edit the RICE formula string in the Phase 5 prompt. The model will apply whatever formula is described.

### Add a new scalability guardrail
Add it to the Phase 4 prompt's annotation instruction or the Phase 6 NFR section prompt. It will propagate to all future products automatically.

### Export PRD as a file
After Phase 6 completes, pass `state.context` to the `/v1/messages` endpoint with a prompt asking it to reformat as markdown or JSON for download.

---

## Limitations

- Single-session only — context is lost on page refresh (use persistent storage to save `state.context` if multi-session support is needed)
- Max context ~8000 tokens across all 6 phases — for very large products, summarize earlier phases before passing to later ones
- Web search quality depends on Anthropic's search tool availability
- PRD quality improves significantly when the user adds context between phases rather than just typing "continue"
