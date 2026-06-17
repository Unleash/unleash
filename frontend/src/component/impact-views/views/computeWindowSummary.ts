import type {
    MultimetricStepSeries,
    TimeWindow,
} from 'component/impact-metrics/MultimetricChart/types';
import type { AggregationMode } from 'component/impact-metrics/types';
import { computeGoalSummary, type GoalSummary } from './computeGoalSummary';

const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

// The goal-series points that fall inside the selected window. Series
// timestamps are SECONDS; the window is MS, so we compare against `tsSec*1000`.
// Inclusive start, exclusive end — matching the flip-window math.
export const windowGoalSeries = (
    goalSeries: MultimetricStepSeries | undefined,
    window: TimeWindow,
): MultimetricStepSeries => ({
    label: goalSeries?.label ?? 'goal',
    data: (goalSeries?.data ?? []).filter(([tsSec]) => {
        const ms = tsSec * 1000;
        return ms >= window.fromMs && ms < window.toMs;
    }),
});

export type WindowSummary = {
    goalSummary: GoalSummary;
    windowedSeries: MultimetricStepSeries;
};

export type ComputeWindowSummaryInput = {
    goalSeries: MultimetricStepSeries | undefined;
    aggregationMode: AggregationMode;
    window: TimeWindow;
};

// The goal metric's change across a brushed window: the windowed goal series
// plus its summary (delta for latest modes, windowed total for cumulative).
// The flips that fall in the window are sourced separately (all flags, incl.
// unfollowed), so this stays purely about the goal line.
export const computeWindowSummary = ({
    goalSeries,
    aggregationMode,
    window,
}: ComputeWindowSummaryInput): WindowSummary => {
    const windowedSeries = windowGoalSeries(goalSeries, window);

    // For cumulative modes the "current" is the sum of the windowed points;
    // latest modes derive earliest/latest from the slice inside computeGoalSummary.
    const windowedTotal = SUM_MODES.has(aggregationMode)
        ? windowedSeries.data.reduce((total, [, value]) => total + value, 0)
        : 0;

    const goalSummary = computeGoalSummary(
        windowedSeries,
        aggregationMode,
        windowedTotal,
    );

    return { goalSummary, windowedSeries };
};
