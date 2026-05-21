// Dev-only: synthesizes a coherent goal series + flag events so the
// goal-tracking view can be exercised end-to-end without real impact-metrics
// data flowing in. Each simulated event sits on a deliberate inflection point
// in the series so the contributing-flag-changes panel shows numbers that
// actually mean something.
//
// Production builds drop the toggle that calls this — see
// `GoalTrackingViewChart.tsx` — so the function is harmless to keep around.

import type {
    MultimetricFeatureEvent,
    MultimetricStepSeries,
} from 'component/impact-metrics/MultimetricChart/types';
import type { MultimetricStep } from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const RANGE_MS_BY_TIME_RANGE: Record<ChartTimeRange, number> = {
    hour: HOUR_MS,
    day: DAY_MS,
    week: 7 * DAY_MS,
    month: 30 * DAY_MS,
};

// Choose a bucket size that yields ~120 points across the window, which is
// roughly what the real backend emits and what the chart renders well.
const BUCKET_MS_BY_TIME_RANGE: Record<ChartTimeRange, number> = {
    hour: 30 * 1000,
    day: 15 * 60 * 1000,
    week: 90 * 60 * 1000,
    month: 6 * HOUR_MS,
};

export type SimulatedScenario = {
    // Existing-shape props for the chart card.
    stepSeries: MultimetricStepSeries[];
    stepTotals: MultimetricStep[];
    start: string;
    end: string;
    featureEvents: MultimetricFeatureEvent[];
};

type EventSpec = {
    id: number;
    featureName: string;
    type: MultimetricFeatureEvent['type'];
    createdBy: string;
    // Where in the window this event lands, as a fraction of the visible range.
    atFraction: number;
    // Multiplier applied to the goal series from this event onward. 1.5 means
    // "the goal moves up by ~50% after this flip". Cumulative across events.
    goalMultiplier: number;
};

// Five events spaced across the window. Hand-tuned so the top-of-list row is
// a believable big winner, with a mix of enabled/disabled and big/small Δs.
const EVENT_SPECS: EventSpec[] = [
    {
        id: 9001,
        featureName: 'new-checkout-flow',
        type: 'feature-environment-enabled',
        createdBy: 'alice@example.com',
        atFraction: 0.18,
        goalMultiplier: 1.85,
    },
    {
        id: 9002,
        featureName: 'experiment.recommendations-v2',
        type: 'feature-environment-enabled',
        createdBy: 'bob@example.com',
        atFraction: 0.36,
        goalMultiplier: 1.2,
    },
    {
        id: 9003,
        featureName: 'legacy-banner',
        type: 'feature-environment-disabled',
        createdBy: 'carla@example.com',
        atFraction: 0.55,
        goalMultiplier: 0.7,
    },
    {
        id: 9004,
        featureName: 'shipping-options-redesign',
        type: 'feature-environment-enabled',
        createdBy: 'dave@example.com',
        atFraction: 0.72,
        goalMultiplier: 1.05, // small change — should fold under disclosure
    },
    {
        id: 9005,
        featureName: 'aggressive-upsell',
        type: 'feature-environment-disabled',
        createdBy: 'eve@example.com',
        atFraction: 0.88,
        goalMultiplier: 1.3,
    },
];

// Lightweight seeded RNG (mulberry32) so the simulated chart looks the same on
// every reload — predictable demos beat surprise reshuffles.
const seededRandom = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const buildGoalSeries = (
    minMs: number,
    maxMs: number,
    bucketMs: number,
    events: { atMs: number; multiplier: number }[],
): MultimetricStepSeries => {
    const random = seededRandom(42);
    const data: [number, number][] = [];
    let runningMultiplier = 1;
    let eventCursor = 0;
    const baseline = 120; // arbitrary starting level
    for (let tMs = minMs; tMs <= maxMs; tMs += bucketMs) {
        while (eventCursor < events.length && events[eventCursor].atMs <= tMs) {
            runningMultiplier *= events[eventCursor].multiplier;
            eventCursor += 1;
        }
        // Add a small noise floor so the line looks like real data, not a
        // staircase. ±15% jitter.
        const jitter = 1 + (random() - 0.5) * 0.3;
        const value = baseline * runningMultiplier * jitter;
        // Series timestamps are in seconds (matches what backend returns).
        data.push([Math.floor(tMs / 1000), value]);
    }
    return { label: 'Simulated goal', data };
};

const buildSignalSeries = (
    label: string,
    minMs: number,
    maxMs: number,
    bucketMs: number,
    seed: number,
    baseline: number,
    amplitude: number,
): MultimetricStepSeries => {
    const random = seededRandom(seed);
    const data: [number, number][] = [];
    for (let tMs = minMs; tMs <= maxMs; tMs += bucketMs) {
        const noise = (random() - 0.5) * amplitude;
        const trend = ((tMs - minMs) / (maxMs - minMs)) * amplitude * 0.3;
        data.push([
            Math.floor(tMs / 1000),
            Math.max(0, baseline + trend + noise),
        ]);
    }
    return { label, data };
};

const sumSeries = (series: MultimetricStepSeries): number => {
    let total = 0;
    for (const [, value] of series.data) {
        if (Number.isFinite(value)) total += value;
    }
    return total;
};

export const simulateFlagContributionScenario = (
    timeRange: ChartTimeRange,
    now: number = Date.now(),
): SimulatedScenario => {
    const rangeMs = RANGE_MS_BY_TIME_RANGE[timeRange];
    const bucketMs = BUCKET_MS_BY_TIME_RANGE[timeRange];
    const minMs = now - rangeMs;
    const maxMs = now;

    const eventTimesMs = EVENT_SPECS.map(
        (spec) => minMs + spec.atFraction * rangeMs,
    );
    const featureEvents: MultimetricFeatureEvent[] = EVENT_SPECS.map(
        (spec, index) => ({
            id: spec.id,
            timestamp: eventTimesMs[index],
            type: spec.type,
            label: spec.featureName,
            createdBy: spec.createdBy,
            featureName: spec.featureName,
        }),
    );

    const goalSeries = buildGoalSeries(
        minMs,
        maxMs,
        bucketMs,
        EVENT_SPECS.map((spec, index) => ({
            atMs: eventTimesMs[index],
            multiplier: spec.goalMultiplier,
        })),
    );

    // Baselines chosen to read as plausible counter values for each signal:
    // page_views_total in the hundreds of thousands, error_rate in the low
    // thousands (per-bucket errors), avg_session_duration as a typical
    // duration scale. The totals stack in the rail sums these as-is, so the
    // numbers in that legend look like real product metrics instead of
    // ~6K demo artefacts.
    const signalA = buildSignalSeries(
        'page_views_total',
        minMs,
        maxMs,
        bucketMs,
        7,
        4000, // per-bucket page views — yields ~480K across 120 buckets
        1500,
    );
    const signalB = buildSignalSeries(
        'error_rate',
        minMs,
        maxMs,
        bucketMs,
        13,
        80, // per-bucket error count — yields ~10K across the window
        40,
    );
    const signalC = buildSignalSeries(
        'avg_session_duration',
        minMs,
        maxMs,
        bucketMs,
        21,
        180, // per-bucket session-duration sum — ~22K across the window
        70,
    );

    const stepSeries = [goalSeries, signalA, signalB, signalC];
    const stepTotals: MultimetricStep[] = stepSeries.map((series, index) => ({
        id: `sim-${index}`,
        label: series.label,
        value: sumSeries(series),
        previousStepPercentage: null,
    }));

    return {
        stepSeries,
        stepTotals,
        start: String(Math.floor(minMs / 1000)),
        end: String(Math.floor(maxMs / 1000)),
        featureEvents,
    };
};
