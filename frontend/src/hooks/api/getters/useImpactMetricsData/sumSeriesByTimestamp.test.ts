import { describe, expect, it } from 'vitest';
import { sumSeriesByTimestamp } from './sumSeriesByTimestamp';
import type { ImpactMetricsResponse } from './useImpactMetricsData';

const seriesWith = (
    points: [number, string | number][],
    metric: Record<string, string> = {},
): ImpactMetricsResponse['series'][number] => ({
    metric,
    data: points.map(([ts, value]) => [ts, String(value)]) as never,
});

describe('sumSeriesByTimestamp', () => {
    it('returns an empty array when there are no series', () => {
        expect(sumSeriesByTimestamp([])).toEqual([]);
    });

    it('returns the same sorted points for a single series', () => {
        const result = sumSeriesByTimestamp([
            seriesWith([
                [3, 30],
                [1, 10],
                [2, 20],
            ]),
        ]);
        expect(result).toEqual([
            [1, 10],
            [2, 20],
            [3, 30],
        ]);
    });

    it('sums overlapping timestamps across series', () => {
        const result = sumSeriesByTimestamp([
            seriesWith(
                [
                    [1, 5],
                    [2, 7],
                ],
                { label: 'a' },
            ),
            seriesWith(
                [
                    [1, 3],
                    [2, 11],
                ],
                { label: 'b' },
            ),
        ]);
        expect(result).toEqual([
            [1, 8],
            [2, 18],
        ]);
    });

    it('preserves disjoint timestamps across series', () => {
        const result = sumSeriesByTimestamp([
            seriesWith([
                [1, 10],
                [3, 30],
            ]),
            seriesWith([
                [2, 20],
                [4, 40],
            ]),
        ]);
        expect(result).toEqual([
            [1, 10],
            [2, 20],
            [3, 30],
            [4, 40],
        ]);
    });

    it('skips non-finite values without poisoning the sum', () => {
        const result = sumSeriesByTimestamp([
            seriesWith([
                [1, 'NaN'],
                [2, 5],
            ]),
            seriesWith([
                [1, 7],
                [2, 'not-a-number'],
            ]),
        ]);
        expect(result).toEqual([
            [1, 7],
            [2, 5],
        ]);
    });

    it('returns a sorted output even when inputs are unordered', () => {
        const result = sumSeriesByTimestamp([
            seriesWith([
                [5, 1],
                [2, 1],
                [9, 1],
            ]),
            seriesWith([
                [9, 1],
                [1, 1],
                [5, 1],
            ]),
        ]);
        expect(result.map(([ts]) => ts)).toEqual([1, 2, 5, 9]);
        expect(result.find(([ts]) => ts === 5)?.[1]).toBe(2);
        expect(result.find(([ts]) => ts === 9)?.[1]).toBe(2);
    });
});
