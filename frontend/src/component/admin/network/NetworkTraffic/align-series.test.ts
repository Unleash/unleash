import { describe, expect, it } from 'vitest';
import {
    alignToTimestamps,
    collectTimestamps,
    isIsolatedSample,
    type ResultValue,
} from './align-series.js';

// these mock the time series results we get from Prometheus, but uses lower
// second values so you don't need to parse large numbers for ordering
const denseSeries: ResultValue[] = [
    [1, '1.0'],
    [2, '1.2'],
    [3, '0.9'],
    [4, '1.1'],
];
const sparseSeries: ResultValue[] = [[3, '0.1']];

describe('collectTimestamps', () => {
    it('returns the sorted union (deduped) across series', () => {
        expect(collectTimestamps([denseSeries, sparseSeries])).toEqual([
            1, 2, 3, 4,
        ]);
    });

    it('handles no series at all', () => {
        expect(collectTimestamps([])).toEqual([]);
    });

    it('handles mixed-width numbers', () => {
        expect(collectTimestamps([[[10, '1']], [[9, '1']]])).toEqual([9, 10]);
    });
});

describe('alignToTimestamps', () => {
    const timestamps = collectTimestamps([denseSeries, sparseSeries]);

    it('converts seconds to milliseconds', () => {
        expect(alignToTimestamps(denseSeries, timestamps)[0].x).toBe(1 * 1000);
    });

    it('parses the string values into numbers', () => {
        expect(
            alignToTimestamps(denseSeries, timestamps).map(({ y }) => y),
        ).toEqual([1.0, 1.2, 0.9, 1.1]);
    });

    it('pads a sparse series with null where it has no sample', () => {
        expect(
            alignToTimestamps(sparseSeries, timestamps).map(({ y }) => y),
        ).toEqual([null, null, 0.1, null]);
    });

    it('keeps every series the same length', () => {
        expect(alignToTimestamps(sparseSeries, timestamps)).toHaveLength(
            alignToTimestamps(denseSeries, timestamps).length,
        );
    });

    it('aligns series to the same timestamps, whether they have data there or not', () => {
        const alignedDense = alignToTimestamps(denseSeries, timestamps);
        const alignedSparse = alignToTimestamps(sparseSeries, timestamps);
        for (let i = 0; i < timestamps.length; i++) {
            expect(alignedDense[i].x).toBe(alignedSparse[i].x);
        }
    });

    it('distinguishes a real zero from a missing sample', () => {
        const withZero: ResultValue[] = [[1, '0']];
        expect(
            alignToTimestamps(withZero, timestamps).map(({ y }) => y),
        ).toEqual([0, null, null, null]);
    });
});

describe('isIsolatedSample', () => {
    const toPoints = (...ys: (number | null)[]) =>
        ys.map((y, i) => ({ x: i, y }));

    it('is true for a sample with gaps on both sides', () => {
        expect(isIsolatedSample(toPoints(null, 0.1, null), 1)).toBe(true);
    });

    it('is false when a neighbour has a value', () => {
        expect(isIsolatedSample(toPoints(0.2, 0.1, null), 1)).toBe(false);
        expect(isIsolatedSample(toPoints(null, 0.1, 0.2), 1)).toBe(false);
    });

    it('treats the ends of the array as gaps', () => {
        expect(isIsolatedSample(toPoints(0.1, null), 0)).toBe(true);
        expect(isIsolatedSample(toPoints(null, 0.1), 1)).toBe(true);
    });

    it('is false for the gap itself', () => {
        expect(isIsolatedSample(toPoints(null, null, null), 1)).toBe(false);
    });

    it('treats a real zero as a value, not a gap', () => {
        expect(isIsolatedSample(toPoints(0, 0, 0), 1)).toBe(false);
        expect(isIsolatedSample(toPoints(null, 0, null), 1)).toBe(true);
    });
});
