# Release Agent

## The problem

Unleash today governs rollouts with **purpose-built constructs**: Release Plans
(milestones with interval-based progression) and Safeguards (Prometheus
thresholds that pause or disable). Every new rollout shape we want to
support — "hold at 10% overnight, go to 100% Monday morning", "roll A and B
together but roll back B alone if its metric spikes", "don't ship during peak
hours" — currently pushes us to extend the data model, add executors, write
UI, and teach users a new concept.

The surface area grows with every rollout pattern we imagine.

## The reframe

A human operating Unleash doesn't need those constructs. They adjust a
`flexibleRollout` strategy's percentage, flip a feature-environment to
enabled, add a constraint. The primitives are already enough.

What a human doesn't do well is:

- waking up at 03:00 to bump a percentage,
- keeping a 6-flag coordinated rollout on schedule across two environments,
- translating "ship to 10% → 50% → 100% over four hours, kill it if errors
  spike" into a concrete sequence of API calls with timestamps.

A **release agent** can. The idea: describe intent in natural language, and
the agent compiles it into a set of **scheduled, deterministic API calls**
against the same primitives a human uses. The server replays those calls at
their appointed times. No LLM in the runtime loop.

## Design shape

```
┌─────────────────────────────────────────────────────────────────┐
│ AUTHOR TIME  (LLM runs here, once per sequence)                 │
│                                                                 │
│   natural-language intent ──► Release Agent ──► Scheduled       │
│                                                  Sequence       │
│                                                    (JSON)       │
│                                                      │          │
│                                                   validate      │
│                                                   + preview     │
│                                                      │          │
│                                                   confirm       │
│                                                      │          │
│                                                   persist       │
└──────────────────────────────────────────────────────┼──────────┘
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ RUNTIME  (no LLM — ScheduledActionExecutor ticks every minute)  │
│                                                                 │
│   scheduled_sequences                                           │
│     └─ scheduled_actions  (fire_at, feature, action_type, ...)  │
│                                                                 │
│   executor: SELECT ... WHERE fire_at <= NOW() AND status='pend' │
│     → call FeatureStrategyService / FeatureToggleService        │
│     → emit audit events, set status                             │
└─────────────────────────────────────────────────────────────────┘
```

The agent is a **compile-time tool**. Its output is rows. Once persisted the
rollout continues exactly as scheduled whether the agent is reachable, whether
the LLM provider is up, whether the prompt it compiled from still makes sense.

## Scope in v1

**In scope**

- A `scheduled_sequences` + `scheduled_actions` primitive in OSS, with admin
  API to create, list, get, cancel sequences.
- Action types: `strategy.create`, `strategy.update`, `strategy.delete`,
  `feature_environment.setEnabled`.
- Sequences span one or more features inside a single project + environment.
- Sequence-owned strategy tagging via `feature_strategies.created_by_sequence_id`
  (enables cancellation cleanup and the conflict rule when humans edit a
  sequence-owned strategy via the UI).
- An enterprise executor that ticks every minute, picks up due actions,
  executes them through existing service methods, emits normal audit events.
- Feature-flagged off by default (`releaseAgent`).

**Out of scope in v1**

- Inline metric conditions on actions. Safeguards already live on the same
  tick cadence — use them to abort on metric breach.
- Editing strategies the sequence does not own.
- Outbound MCP tool calls (Slack, PagerDuty, etc.). The agent's internal
  tool surface is shaped like MCP so later v2 can bolt this on without
  reshaping the author-time contract.
- Change-request integration.
- In-product chat UI.
- Server-side LLM provider wiring (lands in a later step).

## Coexistence with Release Plans

Release Plans continue to work unchanged. This is an alternative, not a
replacement. Release Plans remain the right answer when a user wants the
existing construct; Release Agent is for users who'd rather describe intent
and let the system compile a sequence against raw primitives.

If Release Agent sees adoption, a migration/convergence story will be needed.
That's not this iteration's problem.

## Hard constraint: deterministic runtime

Non-negotiable: once a sequence is persisted, its execution must be
deterministic. Given the same rows and the same clock, the executor produces
the same sequence of service calls byte-for-byte. The LLM contributes only
at author time. The runtime is arithmetic and SQL.

## What's in this directory

| File | Purpose |
|------|---------|
| `scheduled-sequence.ts` | Types for the sequence write/read models. |
| `scheduled-action.ts` | Types for action write/read models, discriminated on `actionType`. |
| `scheduled-sequence-store.ts` | CRUD store + `getByProjectAndEnvironment`. |
| `scheduled-action-store.ts` | CRUD store + `getActionsToFire`, `markExecuted/Failed/Skipped`, `cancelPendingForSequence`. |
| `release-agent-service.ts` | Service: create / get / list / cancel sequences. |
| `createReleaseAgentService.ts` | Composition root + fake variant. |
| `release-agent-controller.ts` | Admin API at `/api/admin/release-agent/sequences`. |

Fakes for testing live in `src/test/fixtures/fake-scheduled-{sequence,action}-store.ts`.

Migrations:
- `20260422103621-create-scheduled-sequences.js` — creates the two tables.
- `20260422103622-add-sequence-ownership-to-feature-strategies.js` — adds
  `feature_strategies.created_by_sequence_id`.
