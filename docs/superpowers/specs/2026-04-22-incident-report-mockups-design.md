# Incident Report Mockups — Design Spec

**Date:** 2026-04-22
**Status:** Approved for prototyping
**Scope:** Design prototype with mock data in the Unleash frontend. No backend integration.

## Purpose

Build in-code mockups of an SRE "First Responder" agent feature that investigates whether a recent feature flag change caused an incident and publishes a report inside Unleash. The prototype is for UX validation, not production readiness.

## Surfaces

Three pages and one shared component:

| Surface | Route | Purpose |
|---|---|---|
| Incident detail page | `/incidents/:id` | The report itself — verdict, evidence, alternatives, events, sources |
| Incidents list | `/incidents` | Filterable overview of active + historical incidents |
| Dashboard banner | rendered on `/personal` (Unleash dashboard) | Surfaces active incidents from anywhere in the app |
| Sidebar nav | — | New "Operations" subsection, Incidents entry with live badge count |

## States covered

Two of the five states in the original brief:

- **State A** — high-confidence culprit (with live control cohort, 87%)
- **State B** — low-confidence / ambiguous (no live control, baseline comparison, 62%)

The no-control variant is the more interesting UX challenge and earns more design attention. Both render from the same component with a `hasLiveControl` branch in the data model.

Out of scope for the prototype: State C (exonerated), State D (in-progress), State E (resolved/historical). The Events list on the detail page already fakes a "resolved/dismissed/false-positive" treatment inline in the list view.

## Detail page structure (top to bottom)

1. **Page header** — breadcrumb + title + `✕ Dismiss report` button (top right)
2. **Hero card**
   - Status chips (Active, service name, "no live control" warning if applicable)
   - Verdict line with flag name chip ("Likely cause" / "Possibly caused by")
   - Confidence: numeric + gradient meter (red for high, orange for moderate)
   - Action row at card bottom: primary actions on the left (`Disable flag` / `Reduce to X%` — or `Open investigation` / `Reduce` / `Roll flag to 0% to test` in low-confidence case), `👎 I disagree` feedback button on the right
3. **Summary** (paper card)
4. **"If this is wrong" / "What would change my mind"** card (paper-consistent padding, purple-accent left border)
5. **Cohort comparison**
   - With-control: two lines (exposed vs control) with flag-change vertical marker
   - No-control: current line + dashed 7-day baseline band + before/after delta strip
   - Toggle above chart: `Suspected events` / `All events`
   - Event pins overlaid on chart: icon circle with letter (D/F/M/!/A), time label, hover tooltip
   - Compact icon legend below chart
6. **Suspects** (grouped by verdict)
   - Likely cause / Possible cause / Couldn't exclude / Ruled out — group headers with coloured dots
   - Each row uses the shared event-row chip: `time — icon — label+reason — verdict pill`
7. **Events list** — all events chronologically in the reasoning window; same event-row chip format
8. **Sources** — 2×2 grid of external links (Grafana, Sentry, flag page, deploy)

## Visual system

### Palette

Reuses Unleash's theme. Aliases per event semantic:

- Purple primary (Unleash `primary.main`) — investigative/neutral emphasis
- Red (`error.main`) — high-confidence verdict, destructive actions, active status
- Orange (`warning.main`) — hedged verdict, "couldn't exclude", warning methodology
- Grey — ruled out, effects, neutral
- Blue — deploy events
- Green — control cohort / normal signals

### Shared event token

One visual treatment for every event, used in chart pins, Suspects section, and Events list:

- **Icon**: 18-20px coloured circle with white letter (D = deploy, F = flag, M = metric, ! = alert, A = agent)
- **Time**: monospace, leftmost
- **Label**: primary message + optional note
- **Verdict pill**: `Likely cause` (red fill), `Possible` (orange fill), `Ruled out` (grey + strikethrough), `Effect` / `Alert` / `Agent` (neutral)

Row layout everywhere: `[time] [icon] [label] [verdict]`

### Toggle on chart

Segmented control:
- **Suspected events** (default) — deploys + flag changes only (candidate causes)
- **All events** — adds metric spikes, alerts, agent activity

Implemented via a `data-view` attribute + CSS sibling selectors.

## Dashboard banner

Appears at top of `/personal` when there's ≥ 1 active incident.

- **Red-accented card**: left-border + soft red fill, pulse dot
- **1 active**: title names the service, body has verdict + confidence + age, CTA "View incident →" goes to `/incidents/:id`
- **N active**: title is the count, body lists affected services comma-separated, CTA "View all →" goes to `/incidents?status=active`
- **Not dismissible** from the banner — disappears when all active incidents are resolved/dismissed on their detail pages

## Incidents list

- **Filter chips with counts**: All / Active / Resolved / Dismissed / False positive
- **Search** + time range
- **Sections**:
  - *Active* (red-tinted rows, always on top)
  - *Historical* (chronological)
- **Columns**: Status chip · ID · Service · Verdict · Confidence · Started · Assigned
- **Row click** → navigate to `/incidents/:id`

Edge cases rendered in the mock data:
- Hedged verdict with orange treatment
- "No cause identified" (agent found nothing)
- Dismissed with inline reason
- False positive with inline reason
- Unassigned active incident

## Actions — what they do (mocked)

| Button | Location | Effect in prototype |
|---|---|---|
| Disable flag | Hero (high confidence) | Toast "Flag disabled" — no real operation |
| Reduce to X% | Hero | Toast "Rollout reduced" |
| Open investigation | Hero (low confidence) | Toast "Investigation opened, assigned to you" |
| Roll flag to 0% to test | Hero (low confidence) | Toast — hypothesis test |
| 👎 I disagree | Hero, bottom-right | Toast "Feedback sent" — AI response quality signal |
| Dismiss report | Page header, top right | Closes the incident as dismissed — no reason-capture modal in prototype |
| I disagree — explain | Inside "What would change my mind" card | Toast — dispute the technical conclusion |

All actions are client-only mock handlers that show a toast. Navigation between pages works for real.

## Sidebar nav

Add a new **"Operations"** section to the main sidebar (matches Unleash's existing section grouping pattern). Contains:
- Incidents (new) — with red badge showing active incident count, pulsing when > 0
- Events (existing — moves here for semantic grouping, or stays where it is if moving would cause regression)
- Integrations (existing — similar)

If moving existing items is risky for the prototype, the minimum-invasive change is to add Incidents as a top-level sidebar entry.

## File layout

Follow the Unleash convention: feature-based folder under `/frontend/src/component/`.

```
/frontend/src/component/incidents/
  IncidentsList.tsx              # list page
  IncidentDetail.tsx             # detail page (with State A/B branching)
  IncidentDashboardBanner.tsx    # banner rendered on dashboard
  mock-data.ts                   # all mock incidents
  types.ts                       # Incident, Event, Suspect, Cohort shapes
  components/
    IncidentHero.tsx
    IncidentSummary.tsx
    WhatWouldChangeMyMind.tsx
    CohortChart.tsx              # handles both live-control and baseline modes
    EventPin.tsx                 # chart-overlay pin
    EventRow.tsx                 # shared row for Suspects + Events list
    SuspectsSection.tsx
    EventsList.tsx
    IncidentSources.tsx
  styles/
    eventSystem.ts               # styled() helpers for the shared event token system
```

## Routing

Add to `/frontend/src/component/menu/routes.ts`:
- `{ path: '/incidents', component: IncidentsList, title: 'Incidents' }`
- `{ path: '/incidents/:id', component: IncidentDetail, title: 'Incident' }`

Mount dashboard banner in the personal dashboard page component conditionally on mock data.

## Non-goals

- Real backend, real observability integrations
- Notification channel design (Slack/email/SMS)
- Flag-operation side effects (actions are mock toasts)
- State C (exonerated), D (in-progress), E (resolved history) detail variations
- Project-scoped permissions (global for POC)
- Postmortem export
- Responsive mobile polish beyond "doesn't break"

## Next step

Hand off to `superpowers:writing-plans` to produce a step-by-step implementation plan.
