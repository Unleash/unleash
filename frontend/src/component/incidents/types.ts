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
