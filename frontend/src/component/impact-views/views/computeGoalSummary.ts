import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { AggregationMode } from 'component/impact-metrics/types';

const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

export type GoalSummaryMode = 'cumulative' | 'latest';

export type GoalSummary = {
    current: number;
    mode: GoalSummaryMode;
    deltaAbs: number | null;
    deltaPct: number | null;
};

const earliestValue = (data: ReadonlyArray<[number, number]>): number => {
    for (const [, value] of data) {
        if (Number.isFinite(value)) return value;
    }
    return 0;
};

const latestValue = (data: ReadonlyArray<[number, number]>): number => {
    for (let index = data.length - 1; index >= 0; index -= 1) {
        const value = data[index][1];
        if (Number.isFinite(value)) return value;
    }
    return 0;
};

export const computeGoalSummary = (
    series: MultimetricStepSeries | undefined,
    aggregationMode: AggregationMode,
    aggregatedTotal: number,
): GoalSummary => {
    const isSumMode = SUM_MODES.has(aggregationMode);
    if (isSumMode) {
        return {
            current: aggregatedTotal,
            mode: 'cumulative',
            deltaAbs: null,
            deltaPct: null,
        };
    }
    if (!series || series.data.length === 0) {
        return {
            current: 0,
            mode: 'latest',
            deltaAbs: 0,
            deltaPct: null,
        };
    }
    const current = latestValue(series.data);
    const baseline = earliestValue(series.data);
    const deltaAbs = current - baseline;
    const deltaPct = baseline === 0 ? null : (deltaAbs / baseline) * 100;
    return { current, mode: 'latest', deltaAbs, deltaPct };
};
