import type {
    MultimetricFeatureEvent,
    MultimetricStepSeries,
} from 'component/impact-metrics/MultimetricChart/types';
import type { AggregationMode } from 'component/impact-metrics/types';
import type {
    ChartTimeRange,
    VisibleWindow,
} from 'component/impact-metrics/MultimetricChart/chartConfig';

// Goal metric aggregation modes whose visible value is a running sum vs. a
// "current" rate/percentile. We compare windows by summing for the first and
// averaging for the second, matching the split in `computeGoalSummary`.
const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

// Anything below this Δ% magnitude is rounded down to "flat".
const SMALL_CHANGE_THRESHOLD_PCT = 1;

// Fixed half-window around a flag change, sized per chart time range so we
// compare like-for-like buckets: ≈1/30 of the visible range, rounded to
// natural units. `hour` is floored at ±5m so each side still holds a handful
// of minute-scale buckets; `sixMonths` is rounded up to ±7d so each side
// spans a full weekly cycle. Exported so the day-scale values can be tuned
// once we've seen the bucket resolution the backend serves at coarse ranges.
export const HALF_WINDOW_MS_BY_TIME_RANGE: Record<ChartTimeRange, number> = {
    hour: 5 * 60_000,
    day: 60 * 60_000,
    week: 6 * 60 * 60_000,
    month: 24 * 60 * 60_000,
    threeMonths: 3 * 24 * 60 * 60_000,
    sixMonths: 7 * 24 * 60 * 60_000,
};

export type FlagImpactTone = 'up' | 'down' | 'flat';

export type FlagImpact = {
    featureName: string;
    // Δ% of the flag's most significant change in the window.
    deltaPct: number;
    tone: FlagImpactTone;
};

export type ComputeFlagImpactsInput = {
    events: readonly MultimetricFeatureEvent[];
    goalSeries: MultimetricStepSeries | undefined;
    aggregationMode: AggregationMode;
    visibleWindow: VisibleWindow | null;
    timeRange: ChartTimeRange;
};

const aggregateBetween = (
    series: MultimetricStepSeries,
    fromSec: number,
    toSec: number,
    isSumMode: boolean,
): number | null => {
    let total = 0;
    let count = 0;
    for (const [tsSec, value] of series.data) {
        if (tsSec < fromSec || tsSec >= toSec) continue;
        if (!Number.isFinite(value)) continue;
        total += value;
        count += 1;
    }
    if (count === 0) return null;
    return isSumMode ? total : total / count;
};

// The tone direction comes from the Δ% sign, which assumes a positive
// baseline — true for everything we plot (counts, rates, percentiles).
const toneOf = (deltaPct: number): FlagImpactTone => {
    if (Math.abs(deltaPct) < SMALL_CHANGE_THRESHOLD_PCT) return 'flat';
    return deltaPct > 0 ? 'up' : 'down';
};

// One row per followed flag with at least one measurable change, showing the
// flag's most significant flip (largest |Δ%|; tie → latest) and ranked by
// |Δ%| descending. "Top movers" ranks flags by significance, so the displayed
// number must be the ranking number — a most-recent rule would let a trivial
// flip-flop mask the change that actually moved the goal. Flips that can't be
// measured (no data on one side, zero baseline, or no window room) produce no
// row; their event pills are still visible on the chart.
export const computeFlagImpacts = ({
    events,
    goalSeries,
    aggregationMode,
    visibleWindow,
    timeRange,
}: ComputeFlagImpactsInput): FlagImpact[] => {
    if (!goalSeries || goalSeries.data.length === 0) return [];
    // `parseVisibleWindow('', '')` yields a NaN window (not null) while data
    // is still loading, so finiteness is checked explicitly.
    if (
        !visibleWindow ||
        !Number.isFinite(visibleWindow.minMs) ||
        !Number.isFinite(visibleWindow.maxMs)
    ) {
        return [];
    }

    const sortedEvents = events
        .filter((event) => Boolean(event.featureName))
        .sort((left, right) => left.timestamp - right.timestamp);

    // Series timestamps are seconds, events and the window are milliseconds —
    // convert once so the loop below is plain arithmetic in seconds.
    const eventSecs = sortedEvents.map((event) => event.timestamp / 1000);
    const minSec = visibleWindow.minMs / 1000;
    const maxSec = visibleWindow.maxMs / 1000;
    const requestedHalfWindowSec =
        HALF_WINDOW_MS_BY_TIME_RANGE[timeRange] / 1000;
    const isSumMode = SUM_MODES.has(aggregationMode);

    const bestDeltaPctByFlag = new Map<string, number>();
    for (let index = 0; index < sortedEvents.length; index += 1) {
        const eventSec = eventSecs[index];

        // Effective half-window = the fixed per-time-range length, shrunk to
        // half the gap to any neighbouring event (any flip can contaminate
        // the goal series, so windows never straddle another flip regardless
        // of which flag it belongs to), then clamped so neither side spills
        // out of the visible chart window.
        const halfWindowSec = Math.min(
            requestedHalfWindowSec,
            index > 0
                ? (eventSec - eventSecs[index - 1]) / 2
                : Number.POSITIVE_INFINITY,
            index < eventSecs.length - 1
                ? (eventSecs[index + 1] - eventSec) / 2
                : Number.POSITIVE_INFINITY,
            eventSec - minSec,
            maxSec - eventSec,
        );
        if (halfWindowSec <= 0) continue;

        const preValue = aggregateBetween(
            goalSeries,
            eventSec - halfWindowSec,
            eventSec,
            isSumMode,
        );
        const postValue = aggregateBetween(
            goalSeries,
            eventSec,
            eventSec + halfWindowSec,
            isSumMode,
        );
        if (preValue === null || postValue === null || preValue === 0) {
            continue;
        }
        const deltaPct = ((postValue - preValue) / preValue) * 100;

        const featureName = sortedEvents[index].featureName;
        const best = bestDeltaPctByFlag.get(featureName);
        // `>=` so the latest flip wins magnitude ties (events are iterated
        // chronologically).
        if (best === undefined || Math.abs(deltaPct) >= Math.abs(best)) {
            bestDeltaPctByFlag.set(featureName, deltaPct);
        }
    }

    return [...bestDeltaPctByFlag]
        .map(([featureName, deltaPct]) => ({
            featureName,
            deltaPct,
            tone: toneOf(deltaPct),
        }))
        .sort(
            (left, right) =>
                Math.abs(right.deltaPct) - Math.abs(left.deltaPct) ||
                // Tie-breaker: alphabetical so the list is stable.
                left.featureName.localeCompare(right.featureName),
        );
};
