// frontend/src/component/incidents/mockData.ts
import type { Incident } from './types.ts';

const pagerDutyAlert = (id: string): Incident['alertSource'] => ({
    system: 'pagerduty',
    displayName: 'PagerDuty',
    externalId: id,
    url: '#',
});

const sourcesWithAlert = (pdId: string): Incident['sources'] => [
    { kind: 'alert', label: `PagerDuty · ${pdId}`, href: '#' },
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
        { id: 'e5', time: '14:12', chartOffset: 65, type: 'alert', label: 'PagerDuty · err rate > 2% · PD-01H5JZVKQ', verdict: 'alert', isSuspect: false },
        { id: 'e6', time: '14:18', chartOffset: 80, type: 'agent', label: 'agent investigation started', verdict: 'agent', isSuspect: false },
    ],
    sources: sourcesWithAlert('PD-01H5JZVKQ'),
    alertSource: pagerDutyAlert('PD-01H5JZVKQ'),
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
        subheadline: `Moderate confidence. Timing and error signature align with the flag, but without a control cohort we can't rule out infra/upstream changes with certainty.`,
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
        `Error rate in cart-service is 14× higher than the 7-day baseline for this hour. The jump starts 2 min after cart-redesign rolled to 100% at 14:05. A concurrent deploy at 14:01 can't be fully ruled out without a control cohort — see suspects below.`,
    changeMyMind: {
        style: 'prominent',
        bullets: [
            `A similar error spike appears in cart-related or payments services (which didn't change) — suggests shared infra issue.`,
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
            reason: `Timing aligns. Error signature matches this flag's code path. Without a control cohort, not conclusive.`,
            group: 'possible',
        },
        {
            id: 's-deploy',
            time: '14:01',
            type: 'deploy',
            title: 'deploy cart v2.4.1',
            reason: `⚠ 4 min before the flag change. Error signature is similar. Can't be disambiguated without a control cohort.`,
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
        { id: 'e5', time: '14:12', chartOffset: 65, type: 'alert', label: 'PagerDuty · err rate > 2% · PD-01H5K2BCDE', verdict: 'alert', isSuspect: false },
        { id: 'e6', time: '14:18', chartOffset: 80, type: 'agent', label: 'agent investigation started', verdict: 'agent', isSuspect: false },
    ],
    sources: sourcesWithAlert('PD-01H5K2BCDE'),
    alertSource: pagerDutyAlert('PD-01H5K2BCDE'),
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
        { id: 'e2', time: '13:12', chartOffset: 60, type: 'alert', label: 'PagerDuty · err rate > 2% · PD-01H5KDHM2', verdict: 'alert', isSuspect: false },
        { id: 'e3', time: '13:18', chartOffset: 75, type: 'agent', label: 'agent investigation started', verdict: 'agent', isSuspect: false },
    ],
    sources: sourcesWithAlert('PD-01H5KDHM2'),
    alertSource: pagerDutyAlert('PD-01H5KDHM2'),
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
        sources: sourcesWithAlert('PD-01H5J4Z72'),
        alertSource: pagerDutyAlert('PD-01H5J4Z72'),
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
        sources: sourcesWithAlert('PD-01H4YWP8T'),
        alertSource: pagerDutyAlert('PD-01H4YWP8T'),
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
