import { describe, expect, it } from 'vitest';
import { computeGoalSummary } from './computeGoalSummary';

describe('computeGoalSummary', () => {
    describe('sum-mode aggregations (count, sum)', () => {
        it('uses the precomputed aggregated total and skips deltas', () => {
            const result = computeGoalSummary(
                {
                    label: 'goal',
                    data: [
                        [1, 5],
                        [2, 12],
                        [3, 25],
                    ],
                },
                'count',
                42,
            );
            expect(result).toEqual({
                current: 42,
                mode: 'cumulative',
                deltaAbs: null,
                deltaPct: null,
            });
        });

        it('treats sum the same as count', () => {
            const result = computeGoalSummary(undefined, 'sum', 100);
            expect(result.current).toBe(100);
            expect(result.mode).toBe('cumulative');
            expect(result.deltaAbs).toBeNull();
            expect(result.deltaPct).toBeNull();
        });
    });

    describe('latest-value aggregations (avg, percentiles, rps)', () => {
        it('uses the last data point as current and first as baseline', () => {
            const result = computeGoalSummary(
                {
                    label: 'p95',
                    data: [
                        [1, 100],
                        [2, 110],
                        [3, 120],
                    ],
                },
                'p95',
                0,
            );
            expect(result.current).toBe(120);
            expect(result.mode).toBe('latest');
            expect(result.deltaAbs).toBe(20);
            expect(result.deltaPct).toBe(20);
        });

        it('returns null deltaPct when the baseline is zero', () => {
            const result = computeGoalSummary(
                {
                    label: 'avg',
                    data: [
                        [1, 0],
                        [2, 7],
                    ],
                },
                'avg',
                0,
            );
            expect(result.current).toBe(7);
            expect(result.deltaAbs).toBe(7);
            expect(result.deltaPct).toBeNull();
        });

        it('handles an empty series safely', () => {
            const result = computeGoalSummary(
                { label: 'avg', data: [] },
                'avg',
                0,
            );
            expect(result).toEqual({
                current: 0,
                mode: 'latest',
                deltaAbs: 0,
                deltaPct: null,
            });
        });

        it('handles an undefined series safely', () => {
            expect(computeGoalSummary(undefined, 'rps', 0)).toEqual({
                current: 0,
                mode: 'latest',
                deltaAbs: 0,
                deltaPct: null,
            });
        });

        it('captures negative movement', () => {
            const result = computeGoalSummary(
                {
                    label: 'p99',
                    data: [
                        [1, 200],
                        [2, 100],
                    ],
                },
                'p99',
                0,
            );
            expect(result.deltaAbs).toBe(-100);
            expect(result.deltaPct).toBe(-50);
        });
    });
});
