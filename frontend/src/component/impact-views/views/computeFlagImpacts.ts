import type {
    MultimetricFeatureEvent,
    MultimetricStepSeries,
} from 'component/impact-metrics/MultimetricChart/types';
import type { AggregationMode } from 'component/impact-metrics/types';
import type {
    ChartTimeRange,
    VisibleWindow,
} from 'component/impact-metrics/MultimetricChart/chartConfig';

const SMALL_CHANGE_THRESHOLD_PCT = 1;
export const HALF_WINDOW_MS_BY_TIME_RANGE: Record<ChartTimeRange, number> = {
    hour: 5 * 60_000,
    day: 60 * 60_000,
    week: 6 * 60 * 60_000,
    month: 3 * 60 * 60_000,
    threeMonths: 7 * 24 * 60 * 60_000,
    sixMonths: 7 * 24 * 60 * 60_000,
};

export type FlagImpactTone = 'up' | 'down' | 'flat';

// The per-flip detail behind a row's Δ%, retained so a drill-down can show how
// the number was measured: the flip event, the effective half-window, the
// before/after aggregates, and the raw goal points that fed each side.
export type FlagImpactDetail = {
    event: MultimetricFeatureEvent;
    halfWindowMs: number;
    before: number;
    after: number;
    deltaAbs: number;
    preSeries: [number, number][];
    postSeries: [number, number][];
};

export type FlagImpact = {
    featureName: string;
    deltaPct: number;
    tone: FlagImpactTone;
    detail: FlagImpactDetail;
};

export type ComputeFlagImpactsInput = {
    events: readonly MultimetricFeatureEvent[];
    goalSeries: MultimetricStepSeries | undefined;
    aggregationMode: AggregationMode;
    visibleWindow: VisibleWindow | null;
    timeRange: ChartTimeRange;
};

export const computeFlagImpacts = ({
    events,
    goalSeries,
    aggregationMode,
    visibleWindow,
    timeRange,
}: ComputeFlagImpactsInput): FlagImpact[] => {
    if (!hasDataPoints(goalSeries) || !hasFiniteBounds(visibleWindow)) {
        return [];
    }

    const flips = chronologicalFlagFlips(events);

    const measuredFlips = flips
        .map((flip, index) =>
            measureGoalDeltaAroundFlip(flip, {
                previousFlip: flips[index - 1],
                nextFlip: flips[index + 1],
                goalSeries,
                aggregationMode,
                visibleWindow,
                timeRange,
            }),
        )
        .filter(isMeasured);

    return rankBySignificance(mostSignificantFlipPerFlag(measuredFlips));
};

const hasDataPoints = (
    series: MultimetricStepSeries | undefined,
): series is MultimetricStepSeries => Boolean(series && series.data.length > 0);

const hasFiniteBounds = (
    window: VisibleWindow | null,
): window is VisibleWindow =>
    window !== null &&
    Number.isFinite(window.minMs) &&
    Number.isFinite(window.maxMs);

type FlagFlip = {
    featureName: string;
    atSec: number;
    event: MultimetricFeatureEvent;
};

const chronologicalFlagFlips = (
    events: readonly MultimetricFeatureEvent[],
): FlagFlip[] =>
    events
        .filter((event) => Boolean(event.featureName))
        .sort((left, right) => left.timestamp - right.timestamp)
        .map((event) => ({
            featureName: event.featureName,
            atSec: event.timestamp / 1000,
            event,
        }));

type MeasurementContext = {
    previousFlip: FlagFlip | undefined;
    nextFlip: FlagFlip | undefined;
    goalSeries: MultimetricStepSeries;
    aggregationMode: AggregationMode;
    visibleWindow: VisibleWindow;
    timeRange: ChartTimeRange;
};

type FlipMeasurement = { featureName: string; deltaPct: null } | MeasuredFlip;
type MeasuredFlip = {
    featureName: string;
    deltaPct: number;
    detail: FlagImpactDetail;
};

const measureGoalDeltaAroundFlip = (
    flip: FlagFlip,
    context: MeasurementContext,
): FlipMeasurement => {
    const halfWindowSec = halfWindowAround(flip, context);
    // A non-positive half-window means the flip sits outside the visible
    // chart window, so there is no surrounding data to measure against.
    if (halfWindowSec <= 0) {
        return { featureName: flip.featureName, deltaPct: null };
    }
    const preSeries = goalPointsBetween(
        flip.atSec - halfWindowSec,
        flip.atSec,
        context,
    );
    const postSeries = goalPointsBetween(
        flip.atSec,
        flip.atSec + halfWindowSec,
        context,
    );
    const before = aggregateGoalPoints(preSeries, context);
    const after = aggregateGoalPoints(postSeries, context);

    if (before === null || after === null || before === 0) {
        return { featureName: flip.featureName, deltaPct: null };
    }
    return {
        featureName: flip.featureName,
        deltaPct: ((after - before) / before) * 100,
        detail: {
            event: flip.event,
            halfWindowMs: halfWindowSec * 1000,
            before,
            after,
            deltaAbs: after - before,
            preSeries,
            postSeries,
        },
    };
};

// The fixed per-time-range half-window, shrunk to half the gap to any
// neighbouring flip (any flip can contaminate the goal series, so windows
// never straddle another flip regardless of which flag it belongs to) and
// clamped so neither side spills out of the visible chart window.
const halfWindowAround = (
    flip: FlagFlip,
    { previousFlip, nextFlip, visibleWindow, timeRange }: MeasurementContext,
): number => {
    const requested = HALF_WINDOW_MS_BY_TIME_RANGE[timeRange] / 1000;
    const halfGapToPreviousFlip = previousFlip
        ? (flip.atSec - previousFlip.atSec) / 2
        : Number.POSITIVE_INFINITY;
    const halfGapToNextFlip = nextFlip
        ? (nextFlip.atSec - flip.atSec) / 2
        : Number.POSITIVE_INFINITY;
    const roomBeforeChartStart = flip.atSec - visibleWindow.minMs / 1000;
    const roomAfterChartEnd = visibleWindow.maxMs / 1000 - flip.atSec;

    return Math.min(
        requested,
        halfGapToPreviousFlip,
        halfGapToNextFlip,
        roomBeforeChartStart,
        roomAfterChartEnd,
    );
};

// Goal metric aggregation modes whose visible value is a running sum vs. a
// "current" rate/percentile. We compare windows by summing for the first and
// averaging for the second, matching the split in `computeGoalSummary`.
const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

// The finite goal points in `[fromSec, toSec)`. Both the before/after aggregate
// and the drill-down chart are built from this, so they never disagree.
const goalPointsBetween = (
    fromSec: number,
    toSec: number,
    { goalSeries }: MeasurementContext,
): [number, number][] =>
    goalSeries.data.filter(
        ([tsSec, value]) =>
            tsSec >= fromSec && tsSec < toSec && Number.isFinite(value),
    );

const aggregateGoalPoints = (
    points: readonly [number, number][],
    { aggregationMode }: MeasurementContext,
): number | null => {
    if (points.length === 0) return null;
    const sum = points.reduce((total, [, value]) => total + value, 0);
    return SUM_MODES.has(aggregationMode) ? sum : sum / points.length;
};

const isMeasured = (
    measurement: FlipMeasurement,
): measurement is MeasuredFlip => measurement.deltaPct !== null;

// Collapses to one entry per flag: the flip with the largest |Δ%|.
const mostSignificantFlipPerFlag = (flips: MeasuredFlip[]): MeasuredFlip[] => {
    const bestByFlag = new Map<string, MeasuredFlip>();
    for (const flip of flips) {
        const best = bestByFlag.get(flip.featureName);
        if (
            best === undefined ||
            Math.abs(flip.deltaPct) >= Math.abs(best.deltaPct)
        ) {
            bestByFlag.set(flip.featureName, flip);
        }
    }
    return [...bestByFlag.values()];
};

const rankBySignificance = (flips: MeasuredFlip[]): FlagImpact[] =>
    flips
        .map(({ featureName, deltaPct, detail }) => ({
            featureName,
            deltaPct,
            tone: toneOf(deltaPct),
            detail,
        }))
        .sort(
            (left, right) =>
                Math.abs(right.deltaPct) - Math.abs(left.deltaPct) ||
                // Tie-breaker: alphabetical so the list is stable.
                left.featureName.localeCompare(right.featureName),
        );

const toneOf = (deltaPct: number): FlagImpactTone => {
    if (Math.abs(deltaPct) < SMALL_CHANGE_THRESHOLD_PCT) return 'flat';
    return deltaPct > 0 ? 'up' : 'down';
};
