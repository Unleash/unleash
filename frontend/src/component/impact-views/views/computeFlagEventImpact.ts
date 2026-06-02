import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { AggregationMode } from 'component/impact-metrics/types';
import type { VisibleWindow } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { ImpactViewFeatureEvent } from './types';

// Goal metric aggregation modes whose visible value is a running sum vs. a
// "current" rate/percentile. We compare windows by summing for the first and
// averaging for the second, matching the split in `computeGoalSummary`.
const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

// Default half-window length around a flag event when the caller doesn't
// specify one. Sized per chart time range so we compare like-for-like buckets.
const HALF_WINDOW_MS_BY_TIME_RANGE = {
    hour: 5 * 60 * 1000,
    day: 60 * 60 * 1000,
    week: 6 * 60 * 60 * 1000,
    month: 24 * 60 * 60 * 1000,
} as const;

export type FlagEventImpactTimeRange =
    keyof typeof HALF_WINDOW_MS_BY_TIME_RANGE;

// Named options the goal-tracking UI exposes in the baseline picker. Each
// option is a fixed half-window length — picking `1d` means "compare goal Δ
// over the day before vs. the day after each flip". Visible-window and
// neighbouring-event clamps still apply so the math stays honest at edges.
export const BASELINE_OPTIONS = [
    { id: '15m', label: '\u00B115 minutes', halfWindowMs: 15 * 60 * 1000 },
    { id: '1h', label: '\u00B11 hour', halfWindowMs: 60 * 60 * 1000 },
    { id: '6h', label: '\u00B16 hours', halfWindowMs: 6 * 60 * 60 * 1000 },
    { id: '1d', label: '\u00B11 day', halfWindowMs: 24 * 60 * 60 * 1000 },
    { id: '3d', label: '\u00B13 days', halfWindowMs: 3 * 24 * 60 * 60 * 1000 },
    { id: '7d', label: '\u00B17 days', halfWindowMs: 7 * 24 * 60 * 60 * 1000 },
] as const;

export type BaselineOptionId = (typeof BASELINE_OPTIONS)[number]['id'];

// Default picker selection for each chart time range — wide enough to absorb
// short-term noise but narrow enough not to drown a real movement.
export const DEFAULT_BASELINE_BY_TIME_RANGE: Record<
    FlagEventImpactTimeRange,
    BaselineOptionId
> = {
    hour: '15m',
    day: '1h',
    week: '6h',
    month: '1d',
};

export type ClampReason = 'previous-event' | 'next-event' | 'visible-window';

export type FlagEventImpact = {
    eventId: number;
    event: ImpactViewFeatureEvent;
    // The half-window actually used after clamping to neighbouring events and
    // the visible window. Exposed so the row can label "Δ measured over ±Xh".
    halfWindowMs: number;
    // The half-window the caller asked for, before clamps. Equal to
    // `halfWindowMs` when no clamp applied. Exposed so the UI can call out
    // "you picked ±7d but we measured ±2d because the next flip was nearby".
    requestedHalfWindowMs: number;
    // When the effective window is smaller than the requested one, this names
    // the tightest constraint. `null` means no clamp applied.
    clampReason: ClampReason | null;
    // Mean (latest modes) or sum (cumulative modes) of finite values in each
    // half-window. `null` when no finite points fell into that side.
    preValue: number | null;
    postValue: number | null;
    deltaAbs: number | null;
    // `null` when `preValue` is null or zero — matches `computeGoalSummary`.
    deltaPct: number | null;
    // The raw goal-series points that went into each half-window aggregate.
    // Useful for drilling down into the Δ — e.g. drawing a sub-chart around
    // the flip. Timestamps are in seconds, matching `MultimetricStepSeries`.
    preSeries: [number, number][];
    postSeries: [number, number][];
};

export const getDefaultHalfWindowMs = (
    timeRange: FlagEventImpactTimeRange,
): number => HALF_WINDOW_MS_BY_TIME_RANGE[timeRange];

const seriesPointsBetween = (
    series: MultimetricStepSeries,
    fromSec: number,
    toSec: number,
): [number, number][] => {
    const points: [number, number][] = [];
    for (const [tsSec, value] of series.data) {
        if (tsSec < fromSec || tsSec >= toSec) continue;
        if (!Number.isFinite(value)) continue;
        points.push([tsSec, value]);
    }
    return points;
};

const valuesOf = (points: readonly [number, number][]): number[] =>
    points.map(([, value]) => value);

const mean = (values: number[]): number | null => {
    if (values.length === 0) return null;
    let total = 0;
    for (const value of values) total += value;
    return total / values.length;
};

const sum = (values: number[]): number | null => {
    if (values.length === 0) return null;
    let total = 0;
    for (const value of values) total += value;
    return total;
};

const aggregate = (values: number[], isSumMode: boolean): number | null =>
    isSumMode ? sum(values) : mean(values);

// Half-window for an event = caller-requested length, then shrunk to half
// the gap to any neighbouring event, then clamped so neither side spills out
// of the visible chart window. Returns the effective half-window plus the
// tightest constraint that applied (so the UI can explain "you picked ±7d but
// we measured ±2d because the next flip was nearby"). Effective = 0 when
// there's no room on at least one side — callers treat that as "can't
// compute".
type PickedHalfWindow = {
    effectiveMs: number;
    clampReason: ClampReason | null;
};

const pickHalfWindowMs = (
    eventMs: number,
    sortedEventMs: readonly number[],
    eventIndex: number,
    visibleWindow: VisibleWindow,
    requestedHalfWindowMs: number,
): PickedHalfWindow => {
    let halfWindowMs = requestedHalfWindowMs;
    let clampReason: ClampReason | null = null;

    const prevEventMs = sortedEventMs[eventIndex - 1];
    if (prevEventMs !== undefined) {
        const halfGap = (eventMs - prevEventMs) / 2;
        if (halfGap < halfWindowMs) {
            halfWindowMs = halfGap;
            clampReason = 'previous-event';
        }
    }
    const nextEventMs = sortedEventMs[eventIndex + 1];
    if (nextEventMs !== undefined) {
        const halfGap = (nextEventMs - eventMs) / 2;
        if (halfGap < halfWindowMs) {
            halfWindowMs = halfGap;
            clampReason = 'next-event';
        }
    }

    const roomBefore = eventMs - visibleWindow.minMs;
    if (roomBefore < halfWindowMs) {
        halfWindowMs = roomBefore;
        clampReason = 'visible-window';
    }
    const roomAfter = visibleWindow.maxMs - eventMs;
    if (roomAfter < halfWindowMs) {
        halfWindowMs = roomAfter;
        clampReason = 'visible-window';
    }

    return {
        effectiveMs: Math.max(0, Math.floor(halfWindowMs)),
        clampReason: halfWindowMs < requestedHalfWindowMs ? clampReason : null,
    };
};

export type ComputeFlagEventImpactsInput = {
    events: readonly ImpactViewFeatureEvent[];
    goalSeries: MultimetricStepSeries | undefined;
    aggregationMode: AggregationMode;
    visibleWindow: VisibleWindow;
    timeRange: FlagEventImpactTimeRange;
    // Caller-requested baseline half-window. When omitted, the per-time-range
    // default is used. The effective value per event may still be smaller due
    // to neighbouring-event and visible-window clamps.
    halfWindowMs?: number;
};

// Returns one `FlagEventImpact` per event that has at least one of pre/post
// data available, ranked by absolute Δ% descending (events with `null` Δ%
// rank below all measurable ones, in chronological order). Events whose
// half-window collapses to zero on both sides are dropped entirely — they
// would carry no information.
export const computeFlagEventImpacts = ({
    events,
    goalSeries,
    aggregationMode,
    visibleWindow,
    timeRange,
    halfWindowMs: requestedHalfWindowMs,
}: ComputeFlagEventImpactsInput): FlagEventImpact[] => {
    if (!goalSeries || goalSeries.data.length === 0) return [];
    if (events.length === 0) return [];

    const isSumMode = SUM_MODES.has(aggregationMode);
    const baselineHalfWindowMs =
        requestedHalfWindowMs ?? HALF_WINDOW_MS_BY_TIME_RANGE[timeRange];

    const sortedEvents = [...events].sort(
        (left, right) => left.timestamp - right.timestamp,
    );
    const sortedEventMs = sortedEvents.map((event) => event.timestamp);

    const impacts: FlagEventImpact[] = [];
    for (let index = 0; index < sortedEvents.length; index += 1) {
        const event = sortedEvents[index];
        const { effectiveMs: halfWindowMs, clampReason } = pickHalfWindowMs(
            event.timestamp,
            sortedEventMs,
            index,
            visibleWindow,
            baselineHalfWindowMs,
        );
        if (halfWindowMs === 0) continue;

        // Series timestamps are seconds, event timestamps are milliseconds.
        const eventSec = event.timestamp / 1000;
        const halfWindowSec = halfWindowMs / 1000;
        const preSeries = seriesPointsBetween(
            goalSeries,
            eventSec - halfWindowSec,
            eventSec,
        );
        const postSeries = seriesPointsBetween(
            goalSeries,
            eventSec,
            eventSec + halfWindowSec,
        );
        const preValue = aggregate(valuesOf(preSeries), isSumMode);
        const postValue = aggregate(valuesOf(postSeries), isSumMode);

        if (preValue === null && postValue === null) continue;

        const deltaAbs =
            preValue !== null && postValue !== null
                ? postValue - preValue
                : null;
        const deltaPct =
            deltaAbs !== null && preValue !== null && preValue !== 0
                ? (deltaAbs / preValue) * 100
                : null;

        impacts.push({
            eventId: event.id,
            event,
            halfWindowMs,
            requestedHalfWindowMs: baselineHalfWindowMs,
            clampReason,
            preValue,
            postValue,
            deltaAbs,
            deltaPct,
            preSeries,
            postSeries,
        });
    }

    impacts.sort((left, right) => {
        const leftMagnitude =
            left.deltaPct === null ? -1 : Math.abs(left.deltaPct);
        const rightMagnitude =
            right.deltaPct === null ? -1 : Math.abs(right.deltaPct);
        if (leftMagnitude !== rightMagnitude)
            return rightMagnitude - leftMagnitude;
        // Tie-breaker: chronological so the list is stable.
        return left.event.timestamp - right.event.timestamp;
    });

    return impacts;
};
