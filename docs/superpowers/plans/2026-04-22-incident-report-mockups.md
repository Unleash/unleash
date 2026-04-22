# Incident Report Mockups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an in-code prototype of the SRE First Responder incident report feature inside the Unleash frontend, using mock data. Three surfaces (detail page, list, dashboard banner) plus a sidebar entry, two incident states (high-confidence with live control, low-confidence without).

**Architecture:** React components co-located under `frontend/src/component/incidents/`. A shared typed mock-data module drives every surface. Shared visual primitives (`EventIcon`, `EventRow`, `EventPin`, `VerdictPill`, `ConfidenceMeter`) are re-used across sections so chart pins, suspects, and event lists share the same vocabulary. Pages are registered in `routes.ts` with `menu: { primary: true }` so the sidebar entry appears automatically. Dashboard banner is mounted at the top of `PersonalDashboard.tsx` alongside the existing `ReleaseTemplatesBanner`.

**Tech Stack:** React 18+, TypeScript, Vite, MUI `styled()` + emotion, React Router v6, SWR (not used here — mock data is synchronous), Vitest + React Testing Library, yarn workspaces. No new dependencies.

**Design spec:** `docs/superpowers/specs/2026-04-22-incident-report-mockups-design.md`

---

## File Structure

All new code lives under a single feature folder. Two edits to shared files at the end wire routes and the banner.

```
frontend/src/component/incidents/
  types.ts                              # Incident, IncidentEvent, Suspect, CohortData, etc.
  mockData.ts                           # Fixture data for list + detail
  routes.tsx                            # Lazy wrappers for the two pages

  styles/
    eventTokens.ts                      # styled primitives: EventIcon, VerdictPill, ConfidenceMeter

  components/
    EventRow.tsx                        # Shared row: [time] [icon] [label] [verdict]
    EventPin.tsx                        # Chart-overlay pin
    CohortChart.tsx                     # Chart w/ pin overlay + Suspected/All toggle
    IncidentHero.tsx                    # Status chips + verdict + confidence + action bar
    IncidentSummary.tsx                 # Summary + "What would change my mind" card
    SuspectsSection.tsx                 # Grouped suspects (Likely/Possible/CouldntExclude/RuledOut)
    IncidentEventsList.tsx              # Chronological events
    IncidentSources.tsx                 # External links grid
    DismissReportButton.tsx             # Top-right dismiss button

  pages/
    IncidentDetail.tsx                  # Composes all sections
    IncidentsList.tsx                   # Table view with filter chips

  dashboard/
    IncidentDashboardBanner.tsx         # Renders on PersonalDashboard when active incidents exist

frontend/src/component/incidents/mockData.test.ts      # Smoke test for fixture shape
frontend/src/component/incidents/pages/IncidentDetail.test.tsx   # Renders without crash for A and B
```

**Modified files:**
- `frontend/src/component/menu/routes.ts` — register `/incidents` and `/incidents/:id`
- `frontend/src/component/personalDashboard/PersonalDashboard.tsx` — mount banner

---

## Conventions to honour

- **Import alias:** use `component/...`, `hooks/...`, `interfaces/...`, `utils/...` — these are configured in `vite.config.mts`.
- **File extensions:** `.tsx` for components, `.ts` for data/types, `.test.tsx` / `.test.ts` for tests.
- **Styled components:** use `styled('div')(({ theme }) => ({ ... }))` from `@mui/material`. Prefer `theme.palette.*` tokens; hardcode hex values only for mockup-specific colors that don't map to the theme (e.g. the event icon letters — even then, derive from theme where possible).
- **Test runner:** `yarn test` runs vitest. Individual tests can run with `yarn test <file>`.
- **No external network calls** — every surface reads from `mockData.ts`.
- **Branch:** work on `incident-report` (already checked out).
- **Commits:** one per task unless explicitly split.

---

## Task 1: Types

**Files:**
- Create: `frontend/src/component/incidents/types.ts`

- [ ] **Step 1: Write the file**

```typescript
// frontend/src/component/incidents/types.ts

export type IncidentStatus = 'active' | 'resolved' | 'dismissed' | 'false-positive';
export type VerdictKind = 'likely' | 'possible' | 'none';
export type EventType = 'deploy' | 'flag' | 'flag-warn' | 'metric' | 'alert' | 'agent';
export type EventVerdict = 'likely' | 'possible' | 'ruled-out' | 'effect' | 'alert' | 'agent';
export type SuspectGroup = 'likely' | 'possible' | 'couldnt-exclude' | 'ruled-out';
export type CohortMode = 'live-control' | 'baseline';

export interface IncidentEvent {
    id: string;
    time: string; // "14:05" — display only for the prototype
    /** Percentage offset along the chart x-axis (0-100). */
    chartOffset: number;
    type: EventType;
    label: string;
    note?: string;
    /** Used to decide badge styling + filter via "Suspected events" toggle. */
    verdict: EventVerdict;
    /** If true, the pin shows up on the chart when the toggle is set to "Suspected events". */
    isSuspect: boolean;
}

export interface Suspect {
    id: string;
    time: string; // "14:05" or "—" for non-temporal suspects like "upstream API"
    type: EventType;
    title: string;
    reason: string;
    group: SuspectGroup;
}

export interface CohortData {
    mode: CohortMode;
    /** Series for the chart. Paths are SVG d-attribute strings on a 300×120 viewBox. */
    exposedPath: string;
    /** For 'live-control' this is the control cohort line.
     *  For 'baseline' this is the dashed baseline mean line. */
    comparisonPath: string;
    /** Only set when mode === 'baseline': upper/lower of the shaded band. */
    baselineBandPath?: string;
    flagChangeOffset: number; // percentage along x
    exposureCount: string; // "12.4k"
    errorRate: string; // "4.1%"
    comparisonLabel: string; // "control 0.2%" or "baseline 0.3% ± 0.2"
    multiplier: string; // "21×" or "14×"
    lag: string; // "2m"
    /** Only set when mode === 'baseline'. */
    beforeAfter?: { before: string; after: string };
}

export interface IncidentSource {
    kind: 'metrics' | 'errors' | 'flag' | 'deploy';
    label: string;
    href: string;
}

export interface IncidentAction {
    id: string;
    label: string;
    variant: 'primary-destructive' | 'primary-soft' | 'secondary';
}

export interface ChangeMyMindCard {
    style: 'simple' | 'prominent';
    /** Short one-liner used when style === 'simple'. */
    body?: string;
    /** Bulleted list used when style === 'prominent'. */
    bullets?: string[];
    /** Only rendered for 'prominent'. */
    actions?: { id: string; label: string }[];
}

export interface Incident {
    id: string;
    status: IncidentStatus;
    service: string;
    startedAt: string; // "8 min ago"
    durationSeconds?: number; // for resolved incidents
    verdict: {
        kind: VerdictKind;
        flag?: string;
        confidence?: number; // 0-100
        headline: string; // "Likely cause: checkout-v2" or "Possibly caused by …"
        subheadline: string; // Short explanation
        tier: 'high' | 'moderate' | 'low'; // drives hero border color
    };
    hasLiveControl: boolean;
    warningChip?: string; // "⚠ 100% rollout — no live control"
    confidenceLabel: string; // "Confidence: high"
    confidenceReason: string; // "live control, timing, ruled out alternatives"
    actions: IncidentAction[];
    summary: string; // HTML-safe plain text; may contain <strong>/<em>
    changeMyMind: ChangeMyMindCard;
    methodologyBanner?: string; // rendered in no-control variant above the chart
    cohort: CohortData;
    suspects: Suspect[];
    events: IncidentEvent[];
    sources: IncidentSource[];
    assignee?: { initials: string; name: string };
}

export interface IncidentListFilter {
    status?: IncidentStatus;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/types.ts
git commit -m "feat(incidents): add types for incident report prototype"
```

---

## Task 2: Mock data

**Files:**
- Create: `frontend/src/component/incidents/mockData.ts`
- Create: `frontend/src/component/incidents/mockData.test.ts`

- [ ] **Step 1: Write the mock data**

```typescript
// frontend/src/component/incidents/mockData.ts
import type { Incident } from './types.ts';

const commonSources: Incident['sources'] = [
    { kind: 'metrics', label: 'Grafana dashboard', href: '#' },
    { kind: 'errors', label: 'Sentry issues', href: '#' },
    { kind: 'flag', label: 'Flag in Unleash', href: '#' },
    { kind: 'deploy', label: 'Deploy in CI', href: '#' },
];

const highConfidenceIncident: Incident = {
    id: '4721',
    status: 'active',
    service: 'checkout-service',
    startedAt: '8 min ago',
    verdict: {
        kind: 'likely',
        flag: 'checkout-v2',
        confidence: 87,
        headline: 'Likely cause: checkout-v2',
        subheadline: 'High confidence — cohort divergence is clean.',
        tier: 'high',
    },
    hasLiveControl: true,
    confidenceLabel: 'Confidence: high',
    confidenceReason: 'live control, timing, ruled out alternatives',
    actions: [
        { id: 'disable', label: 'Disable flag', variant: 'primary-destructive' },
        { id: 'reduce', label: 'Reduce to 10%', variant: 'secondary' },
    ],
    summary:
        'Users exposed to checkout-v2 have a 21× higher error rate than the control cohort. Errors began 2 min after rollout to 100%. Concurrent deploy ruled out — errors affect only exposed users.',
    changeMyMind: {
        style: 'simple',
        body: 'If this is wrong: control cohort error rate above 2% would weaken the hypothesis.',
    },
    cohort: {
        mode: 'live-control',
        exposedPath: 'M 0 98 L 126 98 L 144 58 L 200 20 L 300 12',
        comparisonPath: 'M 0 106 L 300 108',
        flagChangeOffset: 42,
        exposureCount: '12.4k',
        errorRate: '4.1%',
        comparisonLabel: 'control 0.2%',
        multiplier: '21×',
        lag: '2m',
    },
    suspects: [
        {
            id: 's-flag',
            time: '14:05',
            type: 'flag',
            title: 'checkout-v2 flag rolled to 100%',
            reason: 'Exposed cohort error rate 21× control. Timing +2m. Cohort divergence is clean.',
            group: 'likely',
        },
        {
            id: 's-deploy-checkout',
            time: '14:01',
            type: 'deploy',
            title: 'deploy checkout v2.4.1',
            reason: 'Errors in unexposed users at same rate — not deploy-driven.',
            group: 'ruled-out',
        },
        {
            id: 's-deploy-db',
            time: '13:52',
            type: 'deploy',
            title: 'DB migration',
            reason: 'Finished 11 min before spike.',
            group: 'ruled-out',
        },
        {
            id: 's-upstream',
            time: '—',
            type: 'alert',
            title: 'Rate limiter / upstream',
            reason: 'Inverse pattern (503s, not 500s) · Stripe status green.',
            group: 'ruled-out',
        },
    ],
    events: [
        { id: 'e1', time: '13:52', chartOffset: 5, type: 'deploy', label: 'db-migrate completed', verdict: 'ruled-out', isSuspect: true },
        { id: 'e2', time: '14:01', chartOffset: 27.5, type: 'deploy', label: 'checkout-service v2.4.1 rolled out', verdict: 'ruled-out', isSuspect: true },
        { id: 'e3', time: '14:05', chartOffset: 42, type: 'flag', label: 'checkout-v2 rollout 25% → 100%', verdict: 'likely', isSuspect: true },
        { id: 'e4', time: '14:07', chartOffset: 52.5, type: 'metric', label: 'first error spike in exposed cohort', verdict: 'effect', isSuspect: false },
        { id: 'e5', time: '14:12', chartOffset: 65, type: 'alert', label: 'PagerDuty: checkout-service err rate > 2%', verdict: 'alert', isSuspect: false },
        { id: 'e6', time: '14:18', chartOffset: 80, type: 'agent', label: 'agent investigation started', verdict: 'agent', isSuspect: false },
    ],
    sources: commonSources,
    assignee: { initials: 'HS', name: 'Henning' },
};

const lowConfidenceIncident: Incident = {
    id: '4720',
    status: 'active',
    service: 'cart-service',
    startedAt: '32 min ago',
    verdict: {
        kind: 'possible',
        flag: 'cart-redesign',
        confidence: 62,
        headline: 'Possibly caused by cart-redesign — worth investigating, not yet conclusive',
        subheadline: 'Moderate confidence. Timing and error signature align with the flag, but without a control cohort we can’t rule out infra/upstream changes with certainty.',
        tier: 'moderate',
    },
    hasLiveControl: false,
    warningChip: '⚠ 100% rollout — no live control',
    confidenceLabel: 'Confidence: moderate',
    confidenceReason: 'before/after signal + baseline deviation, no live control',
    actions: [
        { id: 'investigate', label: 'Open investigation', variant: 'primary-soft' },
        { id: 'reduce', label: 'Reduce to 50%', variant: 'secondary' },
    ],
    summary:
        'Error rate in cart-service is 14× higher than the 7-day baseline for this hour. The jump starts 2 min after cart-redesign rolled to 100% at 14:05. A concurrent deploy at 14:01 can’t be fully ruled out without a control cohort — see suspects below.',
    changeMyMind: {
        style: 'prominent',
        bullets: [
            'A similar error spike appears in cart-related or payments services (which didn’t change) — suggests shared infra issue.',
            'Stripe p95 rises above 300ms — upstream becomes more plausible.',
            'Rolling back the deploy (not the flag) also clears the errors — points to the deploy.',
        ],
        actions: [
            { id: 'dispute', label: 'I disagree — explain' },
            { id: 'roll-to-zero', label: 'Roll flag to 0% to test' },
        ],
    },
    methodologyBanner:
        'No contemporaneous control cohort. Flag is at 100% for all users. Comparing each signal to the 7-day baseline for the same hour-of-week.',
    cohort: {
        mode: 'baseline',
        exposedPath: 'M 0 100 L 126 98 L 144 58 L 200 20 L 300 12',
        comparisonPath: 'M 0 98 L 300 97',
        baselineBandPath: 'M 0 90 L 300 88 L 300 108 L 0 106 Z',
        flagChangeOffset: 42,
        exposureCount: '18.6k',
        errorRate: '4.1%',
        comparisonLabel: 'baseline 0.3% ± 0.2',
        multiplier: '14×',
        lag: '2m',
        beforeAfter: { before: '0.3%', after: '4.1%' },
    },
    suspects: [
        {
            id: 's-flag',
            time: '14:05',
            type: 'flag-warn',
            title: 'cart-redesign flag rolled to 100%',
            reason: 'Timing aligns. Error signature matches this flag’s code path. Without a control cohort, not conclusive.',
            group: 'possible',
        },
        {
            id: 's-deploy',
            time: '14:01',
            type: 'deploy',
            title: 'deploy cart v2.4.1',
            reason: '⚠ 4 min before the flag change. Error signature is similar. Can’t be disambiguated without a control cohort.',
            group: 'couldnt-exclude',
        },
        {
            id: 's-upstream',
            time: '—',
            type: 'alert',
            title: 'Upstream (Stripe) slow degradation',
            reason: '⚠ Stripe status green, but p95 latency rose 8% — unclear if related.',
            group: 'couldnt-exclude',
        },
        {
            id: 's-db',
            time: '13:52',
            type: 'deploy',
            title: 'DB migration',
            reason: 'Finished 13 min before spike — too early.',
            group: 'ruled-out',
        },
        {
            id: 's-rate',
            time: '—',
            type: 'alert',
            title: 'Rate limiter',
            reason: 'Inverse signature — 503s, not 500s as observed.',
            group: 'ruled-out',
        },
    ],
    events: [
        { id: 'e1', time: '13:52', chartOffset: 5, type: 'deploy', label: 'db-migrate completed', verdict: 'ruled-out', isSuspect: true },
        { id: 'e2', time: '14:01', chartOffset: 27.5, type: 'deploy', label: 'cart v2.4.1 rolled out', verdict: 'possible', isSuspect: true },
        { id: 'e3', time: '14:05', chartOffset: 42, type: 'flag-warn', label: 'cart-redesign rollout 25% → 100%', verdict: 'possible', isSuspect: true },
        { id: 'e4', time: '14:07', chartOffset: 52.5, type: 'metric', label: 'error rate diverges from 7-day baseline', verdict: 'effect', isSuspect: false },
        { id: 'e5', time: '14:12', chartOffset: 65, type: 'alert', label: 'PagerDuty: cart-service err rate > 2%', verdict: 'alert', isSuspect: false },
        { id: 'e6', time: '14:18', chartOffset: 80, type: 'agent', label: 'agent investigation started', verdict: 'agent', isSuspect: false },
    ],
    sources: commonSources,
};

const noCauseIncident: Incident = {
    id: '4719',
    status: 'active',
    service: 'payments-api',
    startedAt: '1h ago',
    verdict: {
        kind: 'none',
        confidence: undefined,
        headline: 'No cause identified',
        subheadline: 'The agent investigated and could not correlate any flag change with the observed error spike.',
        tier: 'low',
    },
    hasLiveControl: false,
    confidenceLabel: 'Confidence: unable to attribute',
    confidenceReason: 'no candidate cause correlated with the spike',
    actions: [
        { id: 'investigate', label: 'Open investigation', variant: 'primary-soft' },
    ],
    summary:
        'payments-api error rate rose from 0.1% to 2.3% at 13:12. No flag changes were found in the 60-minute window preceding the spike. No deploys in the window either. Manual investigation recommended.',
    changeMyMind: { style: 'simple', body: 'If this is wrong: a flag change outside the 60-minute window could still be the cause if its rollout reached a threshold at this time.' },
    cohort: {
        mode: 'baseline',
        exposedPath: 'M 0 80 L 160 78 L 180 50 L 300 48',
        comparisonPath: 'M 0 88 L 300 88',
        baselineBandPath: 'M 0 80 L 300 78 L 300 96 L 0 94 Z',
        flagChangeOffset: 60,
        exposureCount: '8.2k',
        errorRate: '2.3%',
        comparisonLabel: 'baseline 0.1%',
        multiplier: '23×',
        lag: '—',
        beforeAfter: { before: '0.1%', after: '2.3%' },
    },
    suspects: [],
    events: [
        { id: 'e1', time: '13:10', chartOffset: 50, type: 'metric', label: 'first error spike detected', verdict: 'effect', isSuspect: false },
        { id: 'e2', time: '13:12', chartOffset: 60, type: 'alert', label: 'PagerDuty: payments-api err rate > 2%', verdict: 'alert', isSuspect: false },
        { id: 'e3', time: '13:18', chartOffset: 75, type: 'agent', label: 'agent investigation started', verdict: 'agent', isSuspect: false },
    ],
    sources: commonSources,
    assignee: { initials: 'AN', name: 'Ana' },
};

const historical: Incident[] = [
    {
        id: '4718',
        status: 'resolved',
        service: 'checkout-service',
        startedAt: '4h ago',
        durationSeconds: 18 * 60,
        verdict: {
            kind: 'likely',
            flag: 'new-coupon-flow',
            confidence: 91,
            headline: 'Likely cause: new-coupon-flow',
            subheadline: 'Resolved by disabling the flag.',
            tier: 'high',
        },
        hasLiveControl: true,
        confidenceLabel: 'Confidence: high',
        confidenceReason: 'live control, clean divergence',
        actions: [],
        summary: 'Flag was disabled at 10:18. Error rate returned to baseline within 4 minutes.',
        changeMyMind: { style: 'simple', body: 'Resolved — no further action required.' },
        cohort: highConfidenceIncident.cohort,
        suspects: [],
        events: [],
        sources: commonSources,
        assignee: { initials: 'HS', name: 'Henning' },
    },
    {
        id: '4717',
        status: 'false-positive',
        service: 'search-service',
        startedAt: 'yesterday',
        verdict: {
            kind: 'possible',
            flag: 'search-v3',
            confidence: 54,
            headline: 'Possible: search-v3',
            subheadline: 'Marked as expected traffic after manual review.',
            tier: 'moderate',
        },
        hasLiveControl: false,
        confidenceLabel: 'Confidence: moderate',
        confidenceReason: 'before/after signal, no control',
        actions: [],
        summary: 'Closed as false positive — error pattern matched a known seasonal traffic surge.',
        changeMyMind: { style: 'simple', body: 'Closed by Ana as expected traffic.' },
        cohort: lowConfidenceIncident.cohort,
        suspects: [],
        events: [],
        sources: commonSources,
        assignee: { initials: 'AN', name: 'Ana' },
    },
];

export const mockIncidents: Incident[] = [
    highConfidenceIncident,
    lowConfidenceIncident,
    noCauseIncident,
    ...historical,
];

export const getIncidentById = (id: string | undefined): Incident | undefined =>
    mockIncidents.find((incident) => incident.id === id);

export const getActiveIncidents = (): Incident[] =>
    mockIncidents.filter((incident) => incident.status === 'active');
```

- [ ] **Step 2: Write the smoke test**

```typescript
// frontend/src/component/incidents/mockData.test.ts
import { describe, it, expect } from 'vitest';
import { mockIncidents, getIncidentById, getActiveIncidents } from './mockData.ts';

describe('mockIncidents', () => {
    it('contains at least one active high-confidence and one active low-confidence incident', () => {
        const active = mockIncidents.filter((i) => i.status === 'active');
        const high = active.find((i) => i.verdict.tier === 'high');
        const moderate = active.find((i) => i.verdict.tier === 'moderate');
        expect(high).toBeDefined();
        expect(moderate).toBeDefined();
    });

    it('every active incident has at least one action', () => {
        getActiveIncidents().forEach((incident) => {
            expect(incident.actions.length).toBeGreaterThan(0);
        });
    });

    it('getIncidentById returns the right record', () => {
        const first = mockIncidents[0];
        expect(getIncidentById(first.id)).toBe(first);
        expect(getIncidentById('does-not-exist')).toBeUndefined();
    });
});
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && yarn test src/component/incidents/mockData.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/component/incidents/mockData.ts frontend/src/component/incidents/mockData.test.ts
git commit -m "feat(incidents): add mock data for prototype (high-conf, low-conf, no-cause, historical)"
```

---

## Task 3: Event tokens — shared styled primitives

**Files:**
- Create: `frontend/src/component/incidents/styles/eventTokens.ts`

- [ ] **Step 1: Write the file**

```typescript
// frontend/src/component/incidents/styles/eventTokens.ts
import { styled } from '@mui/material';
import type { EventType, EventVerdict, SuspectGroup } from '../types.ts';

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; letter: string }> = {
    deploy:    { bg: '#1e40af', letter: 'D' },
    flag:      { bg: '#b91c1c', letter: 'F' },
    'flag-warn': { bg: '#f59e0b', letter: 'F' },
    metric:    { bg: '#6b7280', letter: 'M' },
    alert:     { bg: '#f59e0b', letter: '!' },
    agent:     { bg: '#5b21b6', letter: 'A' },
};

export const getEventIconProps = (type: EventType) => EVENT_TYPE_COLORS[type];

/** Circle with a letter — used in chart pins, suspects, events list. */
export const EventIconCircle = styled('span', {
    shouldForwardProp: (prop) => prop !== 'size' && prop !== 'type',
})<{ size?: 'sm' | 'md'; type: EventType }>(({ size = 'md', type }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size === 'sm' ? 16 : 20,
    height: size === 'sm' ? 16 : 20,
    borderRadius: '50%',
    background: EVENT_TYPE_COLORS[type].bg,
    color: '#fff',
    fontSize: size === 'sm' ? 9 : 10,
    fontWeight: 700,
    fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
    flexShrink: 0,
    lineHeight: 1,
}));

/** Verdict pill used on every event row. */
export const VerdictPill = styled('span', {
    shouldForwardProp: (prop) => prop !== 'verdict',
})<{ verdict: EventVerdict }>(({ verdict }) => {
    const styles: Record<EventVerdict, { background: string; color: string; border?: string }> = {
        likely:    { background: '#b91c1c', color: '#fff' },
        possible:  { background: '#f59e0b', color: '#fff' },
        'ruled-out': { background: '#e5e7eb', color: '#6b7280' },
        effect:    { background: '#f3f4f6', color: '#6b7280' },
        alert:     { background: '#f3f4f6', color: '#6b7280' },
        agent:     { background: '#f3f4f6', color: '#6b7280' },
    };
    const s = styles[verdict];
    return {
        padding: '2px 7px',
        borderRadius: 10,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
        background: s.background,
        color: s.color,
    };
});

export const verdictLabel = (verdict: EventVerdict): string => ({
    likely: 'Likely cause',
    possible: 'Possible',
    'ruled-out': 'Ruled out',
    effect: 'Effect',
    alert: 'Alert',
    agent: 'Agent',
} as const)[verdict];

/** Color swatch used in suspects group headers. */
export const GroupDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'group',
})<{ group: SuspectGroup }>(({ group }) => {
    const colors: Record<SuspectGroup, string> = {
        likely: '#b91c1c',
        possible: '#f59e0b',
        'couldnt-exclude': '#f59e0b',
        'ruled-out': '#9ca3af',
    };
    return {
        width: 7,
        height: 7,
        borderRadius: '50%',
        display: 'inline-block',
        background: colors[group],
    };
});

export const suspectGroupLabel = (group: SuspectGroup): string => ({
    likely: 'Likely cause',
    possible: 'Possible cause',
    'couldnt-exclude': 'Couldn’t exclude',
    'ruled-out': 'Ruled out',
} as const)[group];
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/styles/eventTokens.ts
git commit -m "feat(incidents): add shared event token primitives (icon, verdict pill, group dot)"
```

---

## Task 4: EventRow component

**Files:**
- Create: `frontend/src/component/incidents/components/EventRow.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/EventRow.tsx
import { styled } from '@mui/material';
import { EventIconCircle, VerdictPill, verdictLabel } from '../styles/eventTokens.ts';
import type { EventType, EventVerdict } from '../types.ts';
import { getEventIconProps } from '../styles/eventTokens.ts';

export type EventRowAccent = 'none' | 'likely' | 'possible' | 'ruled';

const Row = styled('div', {
    shouldForwardProp: (prop) => prop !== 'accent',
})<{ accent: EventRowAccent }>(({ theme, accent }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr auto',
    alignItems: 'center',
    columnGap: theme.spacing(1.25),
    padding: theme.spacing(1, 1.25),
    borderRadius: 6,
    background: '#fff',
    border: `1px solid ${theme.palette.divider}`,
    fontSize: 11,
    ...(accent === 'likely' && {
        borderLeft: '3px solid #b91c1c',
        background: '#fef2f2',
    }),
    ...(accent === 'possible' && {
        borderLeft: '3px solid #f59e0b',
        background: '#fffbeb',
    }),
    ...(accent === 'ruled' && {
        background: '#fafbfc',
    }),
    '& + &': { marginTop: 5 },
}));

const Time = styled('span')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: 11,
    minWidth: 38,
}));

const Label = styled('div', {
    shouldForwardProp: (prop) => prop !== 'strikethrough',
})<{ strikethrough: boolean }>(({ theme, strikethrough }) => ({
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
    '& .main': {
        fontWeight: 500,
        color: theme.palette.text.primary,
        ...(strikethrough && {
            textDecoration: 'line-through',
            textDecorationColor: theme.palette.text.disabled,
            color: theme.palette.text.disabled,
        }),
    },
    '& .note': {
        display: 'block',
        fontSize: 10,
        color: theme.palette.text.secondary,
        marginTop: 1,
    },
}));

export interface EventRowProps {
    time: string;
    type: EventType;
    label: string;
    note?: string;
    verdict: EventVerdict;
    accent?: EventRowAccent;
}

export const EventRow = ({
    time,
    type,
    label,
    note,
    verdict,
    accent = 'none',
}: EventRowProps) => {
    const iconProps = getEventIconProps(type);
    return (
        <Row accent={accent}>
            <Time>{time}</Time>
            <EventIconCircle type={type}>{iconProps.letter}</EventIconCircle>
            <Label strikethrough={accent === 'ruled'}>
                <span className='main'>{label}</span>
                {note ? <span className='note'>{note}</span> : null}
            </Label>
            <VerdictPill verdict={verdict}>{verdictLabel(verdict)}</VerdictPill>
        </Row>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/EventRow.tsx
git commit -m "feat(incidents): add shared EventRow component"
```

---

## Task 5: EventPin — chart overlay pin

**Files:**
- Create: `frontend/src/component/incidents/components/EventPin.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/EventPin.tsx
import { styled } from '@mui/material';
import { EventIconCircle, getEventIconProps } from '../styles/eventTokens.ts';
import type { EventType, EventVerdict } from '../types.ts';

const PinWrap = styled('div', {
    shouldForwardProp: (prop) => prop !== 'offset' && prop !== 'halo',
})<{ offset: number; halo: 'likely' | 'possible' | 'none' }>(({ offset, halo }) => ({
    position: 'absolute',
    top: 4,
    left: `${offset}%`,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
    cursor: 'pointer',
    pointerEvents: 'auto',
    '& .event-icon': {
        border: '2px solid #fff',
        boxShadow: halo === 'likely'
            ? '0 0 0 3px rgba(185, 28, 28, 0.22), 0 1px 3px rgba(0,0,0,0.2)'
            : halo === 'possible'
            ? '0 0 0 3px rgba(245, 158, 11, 0.25), 0 1px 3px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    },
    '&:hover .event-icon': {
        transform: 'scale(1.2)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    },
    '&:hover .pin-tooltip': { opacity: 1 },
}));

const PinTime = styled('span')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    fontSize: 9,
    color: theme.palette.text.secondary,
    marginTop: 2,
    background: 'rgba(255,255,255,0.9)',
    padding: '0 3px',
    borderRadius: 3,
    lineHeight: 1.2,
}));

const Tooltip = styled('div')(() => ({
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111827',
    color: '#fff',
    padding: '7px 10px',
    borderRadius: 5,
    fontSize: 10,
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease',
    zIndex: 20,
    lineHeight: 1.4,
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        border: '4px solid transparent',
        borderTopColor: '#111827',
    },
    '& .tip-head': { fontWeight: 700 },
    '& .tip-src': {
        color: '#c4c9d1',
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        marginLeft: 5,
    },
}));

export interface EventPinProps {
    offset: number;
    type: EventType;
    verdict: EventVerdict;
    time: string;
    sourceLabel: string; // e.g. "deploy · ruled out"
    description: string;
}

export const EventPin = ({ offset, type, verdict, time, sourceLabel, description }: EventPinProps) => {
    const halo: 'likely' | 'possible' | 'none' =
        verdict === 'likely' ? 'likely' : verdict === 'possible' ? 'possible' : 'none';
    const iconProps = getEventIconProps(type);
    return (
        <PinWrap offset={offset} halo={halo}>
            <EventIconCircle type={type} className='event-icon'>{iconProps.letter}</EventIconCircle>
            <PinTime>{time}</PinTime>
            <Tooltip className='pin-tooltip'>
                <span className='tip-head'>{time}</span>
                <span className='tip-src'>{sourceLabel}</span>
                <br />
                {description}
            </Tooltip>
        </PinWrap>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/EventPin.tsx
git commit -m "feat(incidents): add EventPin chart-overlay component"
```

---

## Task 6: CohortChart with toggle

**Files:**
- Create: `frontend/src/component/incidents/components/CohortChart.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/CohortChart.tsx
import { useState } from 'react';
import { styled } from '@mui/material';
import type { CohortData, IncidentEvent } from '../types.ts';
import { EventPin } from './EventPin.tsx';
import { EventIconCircle, getEventIconProps } from '../styles/eventTokens.ts';

const Wrap = styled('div')(() => ({ position: 'relative' }));

const Toggle = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    background: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 6,
    padding: 2,
    marginBottom: theme.spacing(1),
    fontSize: 10,
}));

const ToggleBtn = styled('button', {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    padding: '3px 9px',
    border: 'none',
    background: active ? '#fff' : 'transparent',
    color: active ? theme.palette.text.primary : theme.palette.text.secondary,
    fontSize: 10,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    borderRadius: 4,
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    '& .count': {
        fontSize: 9,
        color: active ? theme.palette.text.secondary : theme.palette.text.disabled,
        fontWeight: 500,
    },
}));

const ChartWrap = styled('div')(() => ({ position: 'relative' }));

const ChartBox = styled('div')(({ theme }) => ({
    position: 'relative',
    height: 180,
    background: theme.palette.background.elevation1,
    borderRadius: 10,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
}));

const Legend = styled('div')(() => ({
    position: 'absolute',
    top: 8,
    right: 10,
    display: 'flex',
    gap: 10,
    fontSize: 10,
    background: 'rgba(255,255,255,0.92)',
    padding: '4px 8px',
    borderRadius: 5,
}));

const LegendDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'exposed' | 'control' | 'baseline' }>(({ variant }) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
    background: variant === 'exposed' ? '#b91c1c' : variant === 'control' ? '#16a34a' : '#c4c9d1',
    marginRight: 5,
}));

const FlagMarker = styled('div', {
    shouldForwardProp: (prop) => prop !== 'offset' && prop !== 'hedged',
})<{ offset: number; hedged: boolean }>(({ offset, hedged }) => ({
    position: 'absolute',
    top: 0,
    bottom: 18,
    left: `${offset}%`,
    width: 2,
    background: hedged ? '#f59e0b' : '#b91c1c',
}));

const XAxis = styled('div')(({ theme }) => ({
    position: 'absolute',
    bottom: 4,
    left: 10,
    right: 10,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: theme.palette.text.secondary,
}));

const EventsOverlay = styled('div', {
    shouldForwardProp: (prop) => prop !== 'view',
})<{ view: 'suspects' | 'all' }>(({ view }) => ({
    position: 'absolute',
    top: 0,
    bottom: 18,
    left: 0,
    right: 0,
    pointerEvents: 'none',
    ...(view === 'suspects' && {
        '& [data-suspect="false"]': { display: 'none' },
    }),
}));

const LegendRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: theme.spacing(1),
    padding: '6px 10px',
    background: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 6,
    fontSize: 9,
    color: theme.palette.text.secondary,
    '& .lg-item': { display: 'flex', alignItems: 'center', gap: 4 },
}));

export interface CohortChartProps {
    cohort: CohortData;
    events: IncidentEvent[];
}

export const CohortChart = ({ cohort, events }: CohortChartProps) => {
    const [view, setView] = useState<'suspects' | 'all'>('suspects');
    const suspectCount = events.filter((e) => e.isSuspect).length;

    const eventSourceLabel = (e: IncidentEvent): string => {
        if (e.type === 'deploy') return 'deploy' + (e.verdict === 'ruled-out' ? ' · ruled out' : '');
        if (e.type === 'flag') return 'flag · likely cause';
        if (e.type === 'flag-warn') return 'flag · possible cause';
        if (e.type === 'metric') return 'metrics';
        if (e.type === 'alert') return 'alert';
        return 'agent';
    };

    return (
        <Wrap>
            <Toggle>
                <ToggleBtn active={view === 'suspects'} onClick={() => setView('suspects')}>
                    Suspected events <span className='count'>{suspectCount}</span>
                </ToggleBtn>
                <ToggleBtn active={view === 'all'} onClick={() => setView('all')}>
                    All events <span className='count'>{events.length}</span>
                </ToggleBtn>
            </Toggle>

            <ChartWrap>
                <ChartBox>
                    <Legend>
                        {cohort.mode === 'live-control' ? (
                            <>
                                <span><LegendDot variant='exposed' />exposed {cohort.errorRate}</span>
                                <span><LegendDot variant='control' />{cohort.comparisonLabel}</span>
                            </>
                        ) : (
                            <>
                                <span><LegendDot variant='exposed' />current</span>
                                <span><LegendDot variant='baseline' />{cohort.comparisonLabel}</span>
                            </>
                        )}
                    </Legend>
                    <FlagMarker offset={cohort.flagChangeOffset} hedged={cohort.mode === 'baseline'} />
                    <svg
                        viewBox='0 0 300 180'
                        preserveAspectRatio='none'
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    >
                        {cohort.baselineBandPath ? (
                            <path d={cohort.baselineBandPath} fill='#c4c9d1' opacity='0.3' />
                        ) : null}
                        <path
                            d={cohort.comparisonPath}
                            stroke={cohort.mode === 'live-control' ? '#16a34a' : '#94a3b8'}
                            strokeWidth='1.6'
                            fill='none'
                            strokeDasharray={cohort.mode === 'baseline' ? '3,3' : undefined}
                        />
                        <path d={cohort.exposedPath} stroke='#b91c1c' strokeWidth='2.2' fill='none' />
                    </svg>
                    <XAxis><span>13:50</span><span>14:00</span><span>14:10</span><span>14:20</span><span>14:30</span></XAxis>
                </ChartBox>

                <EventsOverlay view={view}>
                    {events.map((e) => (
                        <div key={e.id} data-suspect={e.isSuspect}>
                            <EventPin
                                offset={e.chartOffset}
                                type={e.type}
                                verdict={e.verdict}
                                time={e.time}
                                sourceLabel={eventSourceLabel(e)}
                                description={e.label}
                            />
                        </div>
                    ))}
                </EventsOverlay>
            </ChartWrap>

            <LegendRow>
                {(['deploy', 'flag', 'metric', 'alert', 'agent'] as const).map((t) => (
                    <span className='lg-item' key={t}>
                        <EventIconCircle type={t} size='sm'>{getEventIconProps(t).letter}</EventIconCircle>
                        {t === 'flag' ? 'flag change' : t === 'metric' ? 'metric' : t === 'alert' ? 'alert' : t === 'agent' ? 'agent activity' : 'deploy'}
                    </span>
                ))}
            </LegendRow>
        </Wrap>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/CohortChart.tsx
git commit -m "feat(incidents): add CohortChart with pin overlay and suspect/all toggle"
```

---

## Task 7: IncidentHero

**Files:**
- Create: `frontend/src/component/incidents/components/IncidentHero.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/IncidentHero.tsx
import { Button, Paper, styled } from '@mui/material';
import type { Incident } from '../types.ts';

const HeroPaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderLeft: `4px solid ${
        tier === 'high' ? '#b91c1c' : tier === 'moderate' ? '#f59e0b' : theme.palette.text.disabled
    }`,
    padding: theme.spacing(2, 2.5),
}));

const Chips = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1.25),
    flexWrap: 'wrap',
}));

const Chip = styled('span', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'active' | 'warn' | 'default' }>(({ theme, variant }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 500,
    background: variant === 'active' ? '#fef2f2' : variant === 'warn' ? '#fffbeb' : theme.palette.background.elevation1,
    color: variant === 'active' ? '#991b1b' : variant === 'warn' ? '#92400e' : theme.palette.text.secondary,
    border: `1px solid ${variant === 'active' ? '#fca5a5' : variant === 'warn' ? '#fde68a' : theme.palette.divider}`,
    ...(variant === 'active' && { fontWeight: 600 }),
    ...(variant === 'active' && {
        '&::before': {
            content: '""',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#b91c1c',
            boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.2)',
            animation: 'incident-pulse 2s infinite',
        },
    }),
    '@keyframes incident-pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },
}));

const Verdict = styled('div', {
    shouldForwardProp: (prop) => prop !== 'kind',
})<{ kind: 'declarative' | 'hedged' }>(({ theme, kind }) => ({
    fontSize: kind === 'declarative' ? 20 : 19,
    fontWeight: kind === 'declarative' ? 700 : 600,
    color: theme.palette.text.primary,
    letterSpacing: '-0.3px',
    lineHeight: 1.25,
    marginBottom: 4,
    '& em': { color: '#92400e', fontStyle: 'normal', fontWeight: 700 },
}));

const FlagChip = styled('span')(() => ({
    display: 'inline-block',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '1px 10px',
    borderRadius: 6,
    fontFamily: 'ui-monospace, monospace',
    fontSize: 16,
    fontWeight: 600,
}));

const SubLine = styled('div')(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
}));

const ConfidenceBox = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.75),
    borderRadius: 10,
    background: tier === 'moderate' ? '#fffbeb' : theme.palette.background.elevation1,
    border: tier === 'moderate' ? '1px dashed #f59e0b' : 'none',
}));

const ConfPct = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ tier }) => ({
    fontSize: tier === 'high' ? 22 : 20,
    fontWeight: 700,
    color: tier === 'high' ? '#991b1b' : tier === 'moderate' ? '#92400e' : '#6b7280',
    lineHeight: 1,
}));

const ConfLabelStack = styled('div')(() => ({ flex: 1 }));
const ConfMeter = styled('div')(() => ({
    height: 6,
    background: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
}));
const ConfMeterFill = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier' && prop !== 'pct',
})<{ tier: 'high' | 'moderate' | 'low'; pct: number }>(({ tier, pct }) => ({
    height: '100%',
    width: `${pct}%`,
    background: tier === 'high'
        ? 'linear-gradient(90deg, #f59e0b 0%, #b91c1c 100%)'
        : 'linear-gradient(90deg, #f59e0b 0%, #b45309 100%)',
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    marginTop: theme.spacing(1.5),
    paddingTop: theme.spacing(1.25),
    borderTop: `1px solid ${theme.palette.divider}`,
    flexWrap: 'wrap',
}));

const ActionsLeft = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.75),
    flexWrap: 'wrap',
}));

export interface IncidentHeroProps {
    incident: Incident;
    onAction: (id: string) => void;
    onFeedback: () => void;
}

export const IncidentHero = ({ incident, onAction, onFeedback }: IncidentHeroProps) => {
    const { verdict, warningChip, confidenceLabel, confidenceReason, actions } = incident;
    const { tier } = verdict;

    // Render the verdict text; for hedged we wrap "Possibly" in <em>.
    const renderVerdict = () => {
        if (verdict.kind === 'likely' && verdict.flag) {
            return <>Likely cause: <FlagChip>{verdict.flag}</FlagChip></>;
        }
        if (verdict.kind === 'possible' && verdict.flag) {
            return <><em>Possibly</em> caused by <FlagChip>{verdict.flag}</FlagChip> — worth investigating, not yet conclusive</>;
        }
        return verdict.headline;
    };

    return (
        <HeroPaper tier={tier}>
            <Chips>
                <Chip variant='active'>Active</Chip>
                <Chip>{incident.service}</Chip>
                {warningChip ? <Chip variant='warn'>{warningChip}</Chip> : null}
                <Chip>alert fired · started {incident.startedAt}</Chip>
            </Chips>

            <Verdict kind={verdict.kind === 'likely' ? 'declarative' : 'hedged'}>
                {renderVerdict()}
            </Verdict>
            <SubLine>{verdict.subheadline}</SubLine>

            {typeof verdict.confidence === 'number' ? (
                <ConfidenceBox tier={tier}>
                    <ConfPct tier={tier}>{verdict.confidence}%</ConfPct>
                    <ConfLabelStack>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{confidenceLabel}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{confidenceReason}</div>
                        <ConfMeter>
                            <ConfMeterFill tier={tier} pct={verdict.confidence} />
                        </ConfMeter>
                    </ConfLabelStack>
                </ConfidenceBox>
            ) : null}

            <Actions>
                <ActionsLeft>
                    {actions.map((action) => (
                        <Button
                            key={action.id}
                            variant={action.variant === 'secondary' ? 'outlined' : 'contained'}
                            color={
                                action.variant === 'primary-destructive'
                                    ? 'error'
                                    : action.variant === 'primary-soft'
                                    ? 'primary'
                                    : 'inherit'
                            }
                            size='small'
                            onClick={() => onAction(action.id)}
                        >
                            {action.label}
                        </Button>
                    ))}
                </ActionsLeft>
                <Button size='small' variant='outlined' onClick={onFeedback} sx={{ fontSize: 10 }}>
                    <span role='img' aria-label='thumbs down' style={{ fontSize: 12, marginRight: 5 }}>👎</span> I disagree
                </Button>
            </Actions>
        </HeroPaper>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/IncidentHero.tsx
git commit -m "feat(incidents): add IncidentHero with verdict, confidence, and action bar"
```

---

## Task 8: IncidentSummary

**Files:**
- Create: `frontend/src/component/incidents/components/IncidentSummary.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/IncidentSummary.tsx
import { Paper, styled } from '@mui/material';
import type { ChangeMyMindCard, Incident } from '../types.ts';
import { Button } from '@mui/material';

const SummaryPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(1.75),
}));

const SectionHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    '& h3': { fontSize: 14, fontWeight: 600, margin: 0, color: theme.palette.text.primary },
}));

const SummaryText = styled('div')(({ theme }) => ({
    fontSize: 13,
    color: theme.palette.text.secondary,
    lineHeight: 1.55,
    '& strong': { color: theme.palette.text.primary },
}));

const IfWrong = styled('div', {
    shouldForwardProp: (prop) => prop !== 'prominent',
})<{ prominent: boolean }>(({ theme, prominent }) => ({
    padding: theme.spacing(2, 2.5),
    borderRadius: theme.shape.borderRadiusLarge,
    fontSize: 12,
    color: theme.palette.text.primary,
    lineHeight: 1.5,
    marginTop: theme.spacing(1.75),
    background: prominent ? '#fff' : '#f5f3ff',
    border: prominent ? '1px solid #c4b5fd' : 'none',
    borderLeft: `${prominent ? 4 : 3}px solid #5b21b6`,
    '& strong': { color: '#5b21b6' },
    '& .title': {
        fontWeight: 700,
        color: '#5b21b6',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        marginBottom: theme.spacing(0.75),
    },
    '& ul': { margin: '6px 0 0', paddingLeft: 20 },
    '& li': { margin: '3px 0' },
    '& .actions': { marginTop: theme.spacing(1), display: 'flex', gap: theme.spacing(0.75) },
}));

const ChangeMyMind = ({ card }: { card: ChangeMyMindCard }) => {
    if (card.style === 'simple') {
        return <IfWrong prominent={false}><strong>If this is wrong:</strong> {card.body}</IfWrong>;
    }
    return (
        <IfWrong prominent>
            <div className='title'>What would change my mind</div>
            Without a live control, this hypothesis rests more on correlation than causation. It weakens if:
            <ul>
                {card.bullets?.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            {card.actions ? (
                <div className='actions'>
                    {card.actions.map((a) => (
                        <Button key={a.id} size='small' variant='outlined' sx={{ fontSize: 10 }}>{a.label}</Button>
                    ))}
                </div>
            ) : null}
        </IfWrong>
    );
};

export interface IncidentSummaryProps {
    incident: Incident;
}

export const IncidentSummary = ({ incident }: IncidentSummaryProps) => (
    <>
        <SummaryPaper>
            <SectionHead><h3>Summary</h3></SectionHead>
            <SummaryText>{incident.summary}</SummaryText>
        </SummaryPaper>
        <ChangeMyMind card={incident.changeMyMind} />
    </>
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/IncidentSummary.tsx
git commit -m "feat(incidents): add Summary + 'what would change my mind' card"
```

---

## Task 9: SuspectsSection

**Files:**
- Create: `frontend/src/component/incidents/components/SuspectsSection.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/SuspectsSection.tsx
import { Paper, styled } from '@mui/material';
import { EventRow, type EventRowAccent } from './EventRow.tsx';
import { GroupDot, suspectGroupLabel } from '../styles/eventTokens.ts';
import type { Incident, Suspect, SuspectGroup, EventVerdict } from '../types.ts';

const SuspectsPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(1.75),
}));

const SectionHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
    '& h3': { fontSize: 14, fontWeight: 600, margin: 0 },
    '& .aux': { fontSize: 11, color: theme.palette.text.secondary },
}));

const GroupHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.75),
    '& .count': { fontWeight: 500, color: theme.palette.text.disabled },
}));

const GroupWrap = styled('div')(({ theme }) => ({
    '& + &': { marginTop: theme.spacing(1.75) },
}));

const GROUP_ORDER: SuspectGroup[] = ['likely', 'possible', 'couldnt-exclude', 'ruled-out'];

const groupToVerdict = (group: SuspectGroup): EventVerdict =>
    group === 'likely' ? 'likely'
        : group === 'possible' ? 'possible'
        : group === 'couldnt-exclude' ? 'possible'
        : 'ruled-out';

const groupToAccent = (group: SuspectGroup): EventRowAccent =>
    group === 'likely' ? 'likely'
        : group === 'possible' ? 'possible'
        : group === 'couldnt-exclude' ? 'possible'
        : 'ruled';

export interface SuspectsSectionProps {
    incident: Incident;
}

export const SuspectsSection = ({ incident }: SuspectsSectionProps) => {
    if (incident.suspects.length === 0) return null;

    const byGroup = GROUP_ORDER
        .map((group) => ({ group, items: incident.suspects.filter((s: Suspect) => s.group === group) }))
        .filter((g) => g.items.length > 0);

    const auxSummary = byGroup.map((g) => `${g.items.length} ${suspectGroupLabel(g.group).toLowerCase()}`).join(' · ');

    return (
        <SuspectsPaper>
            <SectionHead>
                <h3>Suspects</h3>
                <span className='aux'>{auxSummary}</span>
            </SectionHead>
            {byGroup.map(({ group, items }) => (
                <GroupWrap key={group}>
                    <GroupHead>
                        <GroupDot group={group} />{suspectGroupLabel(group)} <span className='count'>{items.length}</span>
                    </GroupHead>
                    {items.map((s: Suspect) => (
                        <EventRow
                            key={s.id}
                            time={s.time}
                            type={s.type}
                            label={s.title}
                            note={s.reason}
                            verdict={groupToVerdict(group)}
                            accent={groupToAccent(group)}
                        />
                    ))}
                </GroupWrap>
            ))}
        </SuspectsPaper>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/SuspectsSection.tsx
git commit -m "feat(incidents): add SuspectsSection grouped by verdict"
```

---

## Task 10: IncidentEventsList

**Files:**
- Create: `frontend/src/component/incidents/components/IncidentEventsList.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/IncidentEventsList.tsx
import { Paper, styled } from '@mui/material';
import { EventRow } from './EventRow.tsx';
import type { Incident } from '../types.ts';

const EventsPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(1.75),
}));

const SectionHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
    '& h3': { fontSize: 14, fontWeight: 600, margin: 0 },
    '& .aux': { fontSize: 11, color: theme.palette.text.secondary },
}));

export interface IncidentEventsListProps {
    incident: Incident;
}

export const IncidentEventsList = ({ incident }: IncidentEventsListProps) => (
    <EventsPaper>
        <SectionHead>
            <h3>Events</h3>
            <span className='aux'>13:50 — 14:30 · {incident.events.length} events</span>
        </SectionHead>
        {incident.events.map((e) => {
            const accent =
                e.verdict === 'likely' ? 'likely'
                : e.verdict === 'possible' ? 'possible'
                : e.verdict === 'ruled-out' ? 'ruled'
                : 'none';
            return (
                <EventRow
                    key={e.id}
                    time={e.time}
                    type={e.type}
                    label={e.label}
                    verdict={e.verdict}
                    accent={accent}
                />
            );
        })}
    </EventsPaper>
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/IncidentEventsList.tsx
git commit -m "feat(incidents): add IncidentEventsList with shared EventRow"
```

---

## Task 11: IncidentSources

**Files:**
- Create: `frontend/src/component/incidents/components/IncidentSources.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/IncidentSources.tsx
import { Paper, styled } from '@mui/material';
import type { Incident } from '../types.ts';

const SourcesPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(1.75),
}));

const SectionHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
    '& h3': { fontSize: 14, fontWeight: 600, margin: 0 },
    '& .aux': { fontSize: 11, color: theme.palette.text.secondary },
}));

const Grid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(1.25),
}));

const LinkCard = styled('a')(({ theme }) => ({
    padding: theme.spacing(1.25, 1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    background: '#fff',
    textDecoration: 'none',
    color: theme.palette.text.primary,
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    '&:hover': {
        borderColor: theme.palette.primary.main,
        background: '#f5f3ff',
    },
    '& .lbl': {
        fontSize: 10,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        fontWeight: 600,
    },
    '& .nm': { fontWeight: 500, color: theme.palette.primary.main },
}));

const KIND_LABEL: Record<Incident['sources'][number]['kind'], string> = {
    metrics: 'Metrics',
    errors: 'Errors',
    flag: 'Flag',
    deploy: 'Deploy',
};

export interface IncidentSourcesProps {
    incident: Incident;
}

export const IncidentSources = ({ incident }: IncidentSourcesProps) => (
    <SourcesPaper>
        <SectionHead>
            <h3>Sources</h3>
            <span className='aux'>verify in the originals</span>
        </SectionHead>
        <Grid>
            {incident.sources.map((s) => (
                <LinkCard key={s.kind} href={s.href}>
                    <span className='lbl'>{KIND_LABEL[s.kind]}</span>
                    <span className='nm'>{s.label} ↗</span>
                </LinkCard>
            ))}
        </Grid>
    </SourcesPaper>
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/IncidentSources.tsx
git commit -m "feat(incidents): add IncidentSources external-link grid"
```

---

## Task 12: DismissReportButton

**Files:**
- Create: `frontend/src/component/incidents/components/DismissReportButton.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/components/DismissReportButton.tsx
import { Button, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DismissBtn = styled(Button)(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    background: 'transparent',
    padding: theme.spacing(0.5, 1.25),
    '&:hover': {
        borderColor: theme.palette.text.secondary,
        color: theme.palette.text.primary,
        background: '#fff',
    },
}));

export const DismissReportButton = ({ onClick }: { onClick: () => void }) => (
    <DismissBtn variant='outlined' size='small' onClick={onClick} startIcon={<CloseIcon fontSize='small' />}>
        Dismiss report
    </DismissBtn>
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/components/DismissReportButton.tsx
git commit -m "feat(incidents): add top-right DismissReportButton"
```

---

## Task 13: IncidentDetail page

**Files:**
- Create: `frontend/src/component/incidents/pages/IncidentDetail.tsx`
- Create: `frontend/src/component/incidents/pages/IncidentDetail.test.tsx`

- [ ] **Step 1: Write the page**

```tsx
// frontend/src/component/incidents/pages/IncidentDetail.tsx
import { styled } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { Paper } from '@mui/material';
import { usePageTitle } from 'hooks/usePageTitle';
import { useUIContext } from 'hooks/useUIContext';
import { getIncidentById } from '../mockData.ts';
import { IncidentHero } from '../components/IncidentHero.tsx';
import { IncidentSummary } from '../components/IncidentSummary.tsx';
import { CohortChart } from '../components/CohortChart.tsx';
import { SuspectsSection } from '../components/SuspectsSection.tsx';
import { IncidentEventsList } from '../components/IncidentEventsList.tsx';
import { IncidentSources } from '../components/IncidentSources.tsx';
import { DismissReportButton } from '../components/DismissReportButton.tsx';

const PageWrap = styled('div')(({ theme }) => ({ padding: theme.spacing(2, 0) }));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
}));

const HeaderLeft = styled('div')(() => ({ flex: 1, minWidth: 0 }));

const Breadcrumb = styled('div')(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    '& a': { color: theme.palette.primary.main, textDecoration: 'none' },
}));

const Title = styled('h1')(({ theme }) => ({
    fontSize: 18,
    fontWeight: 700,
    margin: theme.spacing(0.5, 0, 1),
    color: theme.palette.text.primary,
}));

const ChartPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(1.75),
}));

const SectionHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
    '& h3': { fontSize: 14, fontWeight: 600, margin: 0 },
    '& .aux': { fontSize: 11, color: theme.palette.text.secondary },
}));

const Methodology = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.25, 1.75),
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 10,
    marginBottom: theme.spacing(1.5),
    fontSize: 11,
    color: '#92400e',
    lineHeight: 1.5,
    '&::before': { content: '"ⓘ"', fontWeight: 700, fontSize: 14 },
}));

const NotFound = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export const IncidentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const incident = getIncidentById(id);
    const { setToastData } = useUIContext();
    usePageTitle(incident ? `Incident #${incident.id}` : 'Incident not found');

    if (!incident) {
        return <NotFound>Incident not found.</NotFound>;
    }

    const toast = (text: string) => setToastData({ type: 'success', text, show: true });

    return (
        <PageWrap>
            <Header>
                <HeaderLeft>
                    <Breadcrumb><Link to='/incidents'>Incidents</Link>  /  #{incident.id}</Breadcrumb>
                    <Title>{incident.service} incident</Title>
                </HeaderLeft>
                <DismissReportButton onClick={() => toast('Incident dismissed (mock)')} />
            </Header>

            <IncidentHero
                incident={incident}
                onAction={(id) => toast(`Action: ${id} (mock)`)}
                onFeedback={() => toast('Feedback sent — thank you (mock)')}
            />
            <IncidentSummary incident={incident} />

            <ChartPaper>
                <SectionHead>
                    <h3>{incident.hasLiveControl ? 'Cohort comparison' : 'Error rate vs baseline'}</h3>
                    <span className='aux'>{incident.hasLiveControl ? 'exposed vs control' : 'no live control — baseline comparison'}</span>
                </SectionHead>
                {incident.methodologyBanner ? <Methodology><div>{incident.methodologyBanner}</div></Methodology> : null}
                <CohortChart cohort={incident.cohort} events={incident.events} />
            </ChartPaper>

            <SuspectsSection incident={incident} />
            <IncidentEventsList incident={incident} />
            <IncidentSources incident={incident} />
        </PageWrap>
    );
};
```

- [ ] **Step 2: Write the smoke test**

```tsx
// frontend/src/component/incidents/pages/IncidentDetail.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { IncidentDetail } from './IncidentDetail.tsx';
import { UIProviderTest } from 'component/common/UIContext/UIContext.test.helper';

const renderWithRoute = (id: string) => render(
    <UIProviderTest>
        <ThemeProvider theme={createTheme()}>
            <MemoryRouter initialEntries={[`/incidents/${id}`]}>
                <Routes>
                    <Route path='/incidents/:id' element={<IncidentDetail />} />
                </Routes>
            </MemoryRouter>
        </ThemeProvider>
    </UIProviderTest>
);

describe('IncidentDetail', () => {
    it('renders the high-confidence (A) incident without crashing', () => {
        renderWithRoute('4721');
        expect(screen.getByText(/checkout-service incident/i)).toBeInTheDocument();
        expect(screen.getByText(/Likely cause:/i)).toBeInTheDocument();
        expect(screen.getByText(/87%/)).toBeInTheDocument();
    });

    it('renders the low-confidence (B) incident without crashing', () => {
        renderWithRoute('4720');
        expect(screen.getByText(/cart-service incident/i)).toBeInTheDocument();
        expect(screen.getByText(/Possibly/i)).toBeInTheDocument();
        expect(screen.getByText(/62%/)).toBeInTheDocument();
    });

    it('renders a not-found view for unknown ids', () => {
        renderWithRoute('does-not-exist');
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
});
```

- [ ] **Step 3: Verify the UIProviderTest helper path**

Run:
```bash
find frontend/src -name "UIContext*" | head -5
```

If `UIProviderTest` is not at `component/common/UIContext/UIContext.test.helper`, adjust the import to the actual path. If no test helper exists, replace the `UIProviderTest` wrapper with `<div>` and replace any `useUIContext` usage in IncidentDetail with a plain `console.log` stub for the prototype — this is acceptable for a design prototype but note the deviation.

- [ ] **Step 4: Run the test**

```bash
cd frontend && yarn test src/component/incidents/pages/IncidentDetail.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/component/incidents/pages/
git commit -m "feat(incidents): add IncidentDetail page composing all sections"
```

---

## Task 14: IncidentsList page

**Files:**
- Create: `frontend/src/component/incidents/pages/IncidentsList.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/pages/IncidentsList.tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { styled } from '@mui/material';
import { usePageTitle } from 'hooks/usePageTitle';
import { mockIncidents } from '../mockData.ts';
import type { Incident, IncidentStatus } from '../types.ts';

type Filter = 'all' | IncidentStatus;

const FilterBar = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap',
    alignItems: 'center',
}));

const Chip = styled('button', {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 14,
    background: active ? theme.palette.primary.main : '#fff',
    color: active ? '#fff' : theme.palette.text.primary,
    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    '& .count': {
        fontSize: 10,
        padding: '1px 5px',
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.25)' : theme.palette.background.elevation1,
        color: active ? '#fff' : theme.palette.text.secondary,
        fontWeight: 600,
    },
}));

const SectionHead = styled('div')(({ theme }) => ({
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1.75, 0, 1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const SectionDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'active' | 'historical' }>(({ status }) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: status === 'active' ? '#b91c1c' : '#9ca3af',
    display: 'inline-block',
}));

const Table = styled('div')(({ theme }) => ({
    background: '#fff',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    overflow: 'hidden',
}));

const Row = styled(Link, {
    shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isHead',
})<{ isActive: boolean; isHead: boolean }>(({ theme, isActive, isHead }) => ({
    display: 'grid',
    gridTemplateColumns: '110px 60px 170px 1fr 60px 120px 90px',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.75),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: 11,
    textDecoration: 'none',
    color: theme.palette.text.primary,
    cursor: isHead ? 'default' : 'pointer',
    background: isHead ? theme.palette.background.elevation1 : isActive ? '#fef2f2' : '#fff',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': isHead ? {} : { background: isActive ? '#fef6f6' : theme.palette.background.elevation1 },
    ...(isHead && {
        fontSize: 10,
        fontWeight: 700,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    }),
}));

const StatusChip = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: IncidentStatus }>(({ status }) => {
    const colors: Record<IncidentStatus, { bg: string; fg: string; border?: string }> = {
        active:         { bg: '#b91c1c', fg: '#fff' },
        resolved:       { bg: '#f7f8fa', fg: '#374151', border: '#e1e4e9' },
        dismissed:      { bg: '#f7f8fa', fg: '#6b7280', border: '#e1e4e9' },
        'false-positive': { bg: '#fffbeb', fg: '#92400e', border: '#fde68a' },
    };
    const c = colors[status];
    return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        background: c.bg,
        color: c.fg,
        border: c.border ? `1px solid ${c.border}` : 'none',
    };
});

const countByStatus = (status: IncidentStatus) => mockIncidents.filter((i) => i.status === status).length;

const renderVerdict = (i: Incident) => {
    if (i.verdict.kind === 'none') return <em style={{ color: '#6b7280' }}>No cause identified</em>;
    if (i.verdict.kind === 'possible') return <span><span style={{ color: '#92400e' }}>Possible:</span> <code style={{ background: '#fef2f2', color: '#991b1b', padding: '1px 5px', borderRadius: 3 }}>{i.verdict.flag}</code></span>;
    return <span>Likely cause: <code style={{ background: '#fef2f2', color: '#991b1b', padding: '1px 5px', borderRadius: 3 }}>{i.verdict.flag}</code></span>;
};

const formatConf = (c: number | undefined) => typeof c === 'number' ? `${c}%` : '—';

export const IncidentsList = () => {
    usePageTitle('Incidents');
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(
        () => (filter === 'all' ? mockIncidents : mockIncidents.filter((i) => i.status === filter)),
        [filter],
    );
    const active = filtered.filter((i) => i.status === 'active');
    const historical = filtered.filter((i) => i.status !== 'active');

    const renderRow = (i: Incident, isActive: boolean) => (
        <Row key={i.id} to={`/incidents/${i.id}`} isActive={isActive} isHead={false}>
            <StatusChip status={i.status}>
                {i.status === 'active' ? 'Active' : i.status === 'resolved' ? 'Resolved' : i.status === 'dismissed' ? 'Dismissed' : 'False +'}
            </StatusChip>
            <span style={{ fontFamily: 'ui-monospace, monospace', color: '#6b7280' }}>#{i.id}</span>
            <span style={{ fontWeight: 600 }}>{i.service}</span>
            <span>{renderVerdict(i)}</span>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: i.verdict.tier === 'high' ? '#991b1b' : i.verdict.tier === 'moderate' ? '#92400e' : '#9ca3af' }}>{formatConf(i.verdict.confidence)}</span>
            <span style={{ fontSize: 10, color: '#6b7280' }}>{i.startedAt}{i.durationSeconds ? ` · ${Math.round(i.durationSeconds / 60)}m` : ''}</span>
            <span style={{ fontSize: 10, color: i.assignee ? '#374151' : '#9ca3af', fontStyle: i.assignee ? 'normal' : 'italic' }}>
                {i.assignee ? i.assignee.name : 'unassigned'}
            </span>
        </Row>
    );

    const headerRow = (
        <Row to='#' isActive={false} isHead>
            <span>Status</span><span>ID</span><span>Service</span><span>Verdict</span><span>Conf</span><span>Started</span><span>Assigned</span>
        </Row>
    );

    return (
        <PageContent header={<PageHeader title='Incidents' subtitle='All incidents detected by the SRE First Responder agent.' />}>
            <FilterBar>
                {(['all', 'active', 'resolved', 'dismissed', 'false-positive'] as const).map((f) => (
                    <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f === 'false-positive' ? 'False positive' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className='count'>{f === 'all' ? mockIncidents.length : countByStatus(f)}</span>
                    </Chip>
                ))}
            </FilterBar>

            {active.length > 0 && (
                <>
                    <SectionHead><SectionDot status='active' /> Active <span style={{ color: '#9ca3af', fontWeight: 500 }}>{active.length}</span></SectionHead>
                    <Table>
                        {headerRow}
                        {active.map((i) => renderRow(i, true))}
                    </Table>
                </>
            )}
            {historical.length > 0 && (
                <>
                    <SectionHead><SectionDot status='historical' /> Historical <span style={{ color: '#9ca3af', fontWeight: 500 }}>{historical.length}</span></SectionHead>
                    <Table>
                        {headerRow}
                        {historical.map((i) => renderRow(i, false))}
                    </Table>
                </>
            )}
        </PageContent>
    );
};
```

- [ ] **Step 2: Verify PageHeader import path**

Run:
```bash
find frontend/src -name "PageHeader.tsx" | head -3
```

If path differs from `component/common/PageHeader/PageHeader`, adjust import.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/component/incidents/pages/IncidentsList.tsx
git commit -m "feat(incidents): add IncidentsList page with filter chips and active/historical sections"
```

---

## Task 15: IncidentDashboardBanner

**Files:**
- Create: `frontend/src/component/incidents/dashboard/IncidentDashboardBanner.tsx`

- [ ] **Step 1: Write the file**

```tsx
// frontend/src/component/incidents/dashboard/IncidentDashboardBanner.tsx
import { Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getActiveIncidents } from '../mockData.ts';

const Banner = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.75),
    padding: theme.spacing(1.5, 2),
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderLeft: '4px solid #b91c1c',
    borderRadius: 10,
    marginBottom: theme.spacing(1.75),
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
        background: '#fef6f6',
        borderColor: '#b91c1c',
        transform: 'translateX(2px)',
    },
}));

const PulseDot = styled('span')(() => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#b91c1c',
    boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.2)',
    animation: 'banner-pulse 2s infinite',
    flexShrink: 0,
    '@keyframes banner-pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },
}));

const Body = styled('div')(() => ({ flex: 1, lineHeight: 1.4 }));

const Title = styled('div')(() => ({ fontWeight: 700, color: '#991b1b', fontSize: 13 }));

const Sub = styled('div')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: 11.5,
    marginTop: 2,
}));

const FlagInline = styled('code')(() => ({
    fontFamily: 'ui-monospace, monospace',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '0 5px',
    borderRadius: 3,
    fontSize: 11,
}));

const CTA = styled(Button)(() => ({
    background: '#b91c1c',
    color: '#fff',
    fontWeight: 600,
    fontSize: 11,
    padding: '6px 12px',
    '&:hover': { background: '#991b1b' },
}));

export const IncidentDashboardBanner = () => {
    const navigate = useNavigate();
    const active = getActiveIncidents();

    if (active.length === 0) return null;

    if (active.length === 1) {
        const i = active[0];
        const go = () => navigate(`/incidents/${i.id}`);
        return (
            <Banner onClick={go}>
                <PulseDot />
                <Body>
                    <Title>Active incident in {i.service}</Title>
                    <Sub>
                        {i.verdict.kind === 'none'
                            ? <>No cause identified · started {i.startedAt}</>
                            : <>{i.verdict.kind === 'likely' ? 'Likely cause' : 'Possibly caused by'}: <FlagInline>{i.verdict.flag}</FlagInline>{i.verdict.confidence ? ` · ${i.verdict.confidence}% confidence` : ''} · started {i.startedAt}</>}
                    </Sub>
                </Body>
                <CTA variant='contained' onClick={go}>View incident →</CTA>
            </Banner>
        );
    }

    const services = active.map((i) => i.service).join(' · ');
    const go = () => navigate('/incidents?status=active');
    return (
        <Banner onClick={go}>
            <PulseDot />
            <Body>
                <Title>{active.length} active incidents</Title>
                <Sub>{services}</Sub>
            </Body>
            <CTA variant='contained' onClick={go}>View all →</CTA>
        </Banner>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/component/incidents/dashboard/IncidentDashboardBanner.tsx
git commit -m "feat(incidents): add dashboard banner for active incidents"
```

---

## Task 16: Register routes

**Files:**
- Modify: `frontend/src/component/menu/routes.ts`

- [ ] **Step 1: Inspect current route registration**

Open the file and locate the existing "Insights" route (around the part where `component: Insights` appears). We'll add our two routes just after it so they sit in the primary menu.

- [ ] **Step 2: Add imports at the top of the file**

Find the existing imports around `import { Insights } from '../insights/Insights.jsx';` and add just after:

```typescript
import { IncidentsList } from 'component/incidents/pages/IncidentsList';
import { IncidentDetail } from 'component/incidents/pages/IncidentDetail';
```

- [ ] **Step 3: Register two routes in the `routes` array**

Find the entry where the Insights route is declared (the object containing `component: Insights`). Immediately after that object's closing `},`, paste:

```typescript
    {
        path: '/incidents',
        title: 'Incidents',
        component: IncidentsList,
        type: 'protected',
        menu: { primary: true },
    },
    {
        path: '/incidents/:id',
        title: 'Incident',
        component: IncidentDetail,
        type: 'protected',
        menu: {},
    },
```

- [ ] **Step 4: Typecheck**

```bash
cd frontend && yarn ts:check
```

Expected: no errors. If `menu: { primary: true }` doesn't match `IRouteMenu`, inspect `frontend/src/interfaces/route.ts` and copy the shape used by a neighbouring route like Insights.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/component/menu/routes.ts
git commit -m "feat(incidents): register /incidents and /incidents/:id routes"
```

---

## Task 17: Mount dashboard banner

**Files:**
- Modify: `frontend/src/component/personalDashboard/PersonalDashboard.tsx:26` (import) and `:295` (placement)

- [ ] **Step 1: Add import**

In `PersonalDashboard.tsx`, find the line:
```typescript
import { ReleaseTemplatesBanner } from 'component/common/ReleaseTemplatesBanner/ReleaseTemplatesBanner';
```

Add immediately after:
```typescript
import { IncidentDashboardBanner } from 'component/incidents/dashboard/IncidentDashboardBanner';
```

- [ ] **Step 2: Render the banner**

Find the line `<ReleaseTemplatesBanner />` (around line 295). Add immediately BEFORE it:

```tsx
                <IncidentDashboardBanner />
```

- [ ] **Step 3: Typecheck**

```bash
cd frontend && yarn ts:check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/component/personalDashboard/PersonalDashboard.tsx
git commit -m "feat(incidents): mount incident banner on personal dashboard"
```

---

## Task 18: Manual verification

This step is not a code change — verify the prototype works end-to-end in the dev server.

- [ ] **Step 1: Start the dev server**

```bash
cd frontend && yarn dev
```

Wait for Vite to report the local URL (typically `http://localhost:3000`).

- [ ] **Step 2: Open the browser at the URL, log in as any user**

Navigate to `/personal`. Verify:
- **Banner appears at the top with "3 active incidents" (since mock data has 3 active).**
- Clicking the banner navigates to `/incidents?status=active` (hash filter reflected in URL — chip should show the filter clicked; if filter isn't auto-applied from querystring in the prototype, that's acceptable, click the Active chip manually to confirm filtering works).

- [ ] **Step 3: Navigate to `/incidents`**

Verify:
- Filter chips show All (5) / Active (3) / Resolved (1) / Dismissed (0) / False positive (1) — exact counts may vary based on final mockData.
- Active section has red-tinted rows for #4721, #4720, #4719.
- Historical section has #4718 (Resolved) and #4717 (False +).
- Clicking a row navigates to `/incidents/:id`.

- [ ] **Step 4: Navigate to `/incidents/4721` (high-confidence)**

Verify:
- Breadcrumb `Incidents / #4721` in top-left, `✕ Dismiss report` button in top-right.
- Hero card: red left border, "Likely cause: checkout-v2" headline, 87% confidence with gradient meter, action bar with `Disable flag` (red) + `Reduce to 10%` on left, `👎 I disagree` on right.
- Summary card below hero.
- "If this is wrong" card below summary (purple left border, correct padding).
- Cohort chart with two lines (red exposed rising, green control flat), vertical red flag marker, pins overlaid, toggle above showing "Suspected events (3) | All events (6)".
- Hover any pin → tooltip appears.
- Click "All events" → 3 additional pins appear (metric, alert, agent).
- Suspects section grouped into Likely (1) + Ruled out (3).
- Events section: 6 rows, time on the far left.
- Sources grid at the bottom.

- [ ] **Step 5: Navigate to `/incidents/4720` (low-confidence)**

Verify:
- Hero has orange left border, `⚠ 100% rollout — no live control` chip, hedged "Possibly caused by…" verdict, 62% confidence with orange meter, `Open investigation` (purple) + `Reduce to 50%` actions.
- "What would change my mind" card below summary is the prominent variant with bullets + two action buttons (I disagree / Roll flag to 0%).
- Methodology banner above chart with the no-control explanation.
- Chart shows baseline band (dashed grey line + shaded region) with current line rising — no control line.
- Before/after visual not rendered in current CohortChart; this is acceptable for the prototype (it was only in the companion mockups). If needed, add a TODO comment next to the chart section.
- Suspects grouped: Possible cause (1) + Couldn't exclude (2) + Ruled out (2).

- [ ] **Step 6: Navigate to `/incidents/4719` (no-cause)**

Verify:
- Hero shows "No cause identified" without a flag chip.
- Confidence block is absent (no confidence value in the mock).
- Suspects section is not rendered (zero suspects).
- Events section still renders with a short list.

- [ ] **Step 7: Click the `Disable flag` button**

Verify a toast appears (using Unleash's existing UIContext toast system).

- [ ] **Step 8: Click the top-right `Dismiss report` button**

Verify a toast appears with "Incident dismissed (mock)".

- [ ] **Step 9: Record findings**

If anything is broken (type error, missing import, unexpected layout), note it and fix inline. If the dev server shows errors that block rendering, fix them before completing this task. After manual verification passes, no commit is needed unless a fix was required — in that case commit the fix with `fix(incidents): ...`.

- [ ] **Step 10: Run full frontend tests and type checks**

```bash
cd frontend && yarn ts:check && yarn test --reporter=dot
```

Expected: no type errors; all tests pass (including our new ones).

---

## Self-Review

**1. Spec coverage**

| Spec requirement | Covered by |
|---|---|
| Detail page (`/incidents/:id`) | Tasks 13 (page) + 7–12, 3–6 (sections and primitives) |
| Incidents list (`/incidents`) | Task 14 |
| Dashboard banner on `/personal` | Tasks 15 + 17 |
| Sidebar nav entry | Task 16 (via `menu: { primary: true }`) |
| State A (high-conf with live control) | mockIncident #4721, rendered by IncidentDetail |
| State B (low-conf no control) | mockIncident #4720, rendered by IncidentDetail |
| Shared event-token system | Task 3 (`eventTokens.ts`) used in Tasks 4, 5, 6, 9, 10 |
| `Suspected events` / `All events` toggle | Task 6 (CohortChart) |
| Event pins overlaid on chart | Tasks 5 + 6 |
| Grouped Suspects (Likely / Possible / Couldn't exclude / Ruled out) | Task 9 |
| Events list time-first | Task 4 (EventRow lays out time as first column) + Task 10 |
| Top-right Dismiss report button | Task 12 + Task 13 |
| 👎 I disagree in hero | Task 7 |
| "What would change my mind" prominent variant | Task 8 |
| Banner 1-active goes direct, N-active goes to list | Task 15 |
| Badge count on sidebar | **Gap** — mentioned in spec but not implemented (see note below) |

**Gap flagged:** Sidebar badge count is in the design but not wired up in Task 16. The Unleash sidebar comes from `routes.ts` — rendering a badge requires custom sidebar rendering logic that's out of scope for the prototype. Adding it would require editing `frontend/src/component/menu/Header/DrawerMenu/DrawerMenu.tsx` or the sidebar rendering file. **Deferred** — not in the committed plan because verifying the exact sidebar rendering path requires more research than a 2-5 minute task, and the badge is non-essential for UX validation. Callers can click "Incidents" and see active count in the list page heading / filter chips. If the design reviewer pushes back, add a follow-up task.

**2. Placeholder scan**

None found. Every step has concrete code or exact commands.

**3. Type consistency**

- `EventType` includes `flag-warn` — used consistently in `mockData.ts`, `eventTokens.ts`, `EventRow.tsx`, `EventPin.tsx`, `CohortChart.tsx`.
- `EventVerdict` values `likely | possible | ruled-out | effect | alert | agent` — consistent between types, tokens, and components.
- `SuspectGroup` values `likely | possible | couldnt-exclude | ruled-out` — consistent in types, tokens, SuspectsSection.
- `CohortData.mode` values `live-control | baseline` — consistent in types, mock data, CohortChart.
- `verdictLabel` helper maps every `EventVerdict` → used in `EventRow.tsx`.
- `suspectGroupLabel` helper maps every `SuspectGroup` → used in `SuspectsSection.tsx`.

All checked.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-22-incident-report-mockups.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
