import { describe, expect, it } from 'vitest';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import { computeWindowSummary, windowGoalSeries } from './computeWindowSummary';

const HOUR_SEC = 60 * 60;
const HOUR_MS = HOUR_SEC * 1000;

// Hourly points, value === hour index, over 10 hours.
const series: MultimetricStepSeries = {
    label: 'goal',
    data: Array.from({ length: 10 }, (_, hour) => [hour * HOUR_SEC, hour * 10]),
};

describe('windowGoalSeries', () => {
    it('slices to [fromMs, toMs) using sec→ms conversion', () => {
        const sliced = windowGoalSeries(series, {
            fromMs: 2 * HOUR_MS,
            toMs: 5 * HOUR_MS,
        });
        // hours 2,3,4 (5 is exclusive)
        expect(sliced.data.map(([ts]) => ts / HOUR_SEC)).toEqual([2, 3, 4]);
        expect(sliced.label).toBe('goal');
    });

    it('returns an empty series for an undefined goal series', () => {
        expect(
            windowGoalSeries(undefined, { fromMs: 0, toMs: HOUR_MS }).data,
        ).toEqual([]);
    });
});

describe('computeWindowSummary', () => {
    it('computes the goal delta across the window for latest modes', () => {
        const { goalSummary, windowedSeries } = computeWindowSummary({
            goalSeries: series,
            aggregationMode: 'avg',
            window: { fromMs: 2 * HOUR_MS, toMs: 6 * HOUR_MS },
        });
        // window holds hours 2..5 → values 20..50; earliest 20, latest 50.
        expect(goalSummary.current).toBe(50);
        expect(goalSummary.deltaAbs).toBe(30);
        expect(goalSummary.deltaPct).toBe(150);
        expect(windowedSeries.data).toHaveLength(4);
    });

    it('sums the windowed points for cumulative modes', () => {
        const { goalSummary } = computeWindowSummary({
            goalSeries: series,
            aggregationMode: 'count',
            window: { fromMs: 0, toMs: 3 * HOUR_MS },
        });
        // hours 0,1,2 → values 0+10+20 = 30
        expect(goalSummary.mode).toBe('cumulative');
        expect(goalSummary.current).toBe(30);
    });
});
