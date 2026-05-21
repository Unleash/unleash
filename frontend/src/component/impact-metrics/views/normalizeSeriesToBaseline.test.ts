import { describe, expect, it } from 'vitest';
import {
    BASELINE_VALUE,
    normalizeSeriesToBaseline,
} from './normalizeSeriesToBaseline';

describe('normalizeSeriesToBaseline', () => {
    it('rebases a typical series so the first value maps to the baseline', () => {
        const result = normalizeSeriesToBaseline([
            {
                label: 'A',
                data: [
                    [1, 10],
                    [2, 20],
                    [3, 30],
                ],
            },
        ]);
        expect(result).toEqual([
            {
                label: 'A',
                data: [
                    [1, BASELINE_VALUE],
                    [2, 2 * BASELINE_VALUE],
                    [3, 3 * BASELINE_VALUE],
                ],
            },
        ]);
    });

    it('puts series with very different magnitudes on the same scale', () => {
        const result = normalizeSeriesToBaseline([
            {
                label: 'big',
                data: [
                    [1, 200],
                    [2, 400],
                ],
            },
            {
                label: 'small',
                data: [
                    [1, 4],
                    [2, 8],
                ],
            },
        ]);
        expect(result[0].data[1][1]).toBe(2 * BASELINE_VALUE);
        expect(result[1].data[1][1]).toBe(2 * BASELINE_VALUE);
    });

    it('skips leading zeros when picking the baseline', () => {
        const result = normalizeSeriesToBaseline([
            {
                label: 'delayed',
                data: [
                    [1, 0],
                    [2, 0],
                    [3, 5],
                    [4, 10],
                ],
            },
        ]);
        expect(result[0].data[2][1]).toBe(BASELINE_VALUE);
        expect(result[0].data[3][1]).toBe(2 * BASELINE_VALUE);
    });

    it('falls back to BASELINE + raw delta when the series is all zeros', () => {
        const result = normalizeSeriesToBaseline([
            {
                label: 'flat',
                data: [
                    [1, 0],
                    [2, 0],
                ],
            },
        ]);
        expect(result[0].data).toEqual([
            [1, BASELINE_VALUE],
            [2, BASELINE_VALUE],
        ]);
    });

    it('handles an empty series without throwing', () => {
        expect(
            normalizeSeriesToBaseline([{ label: 'empty', data: [] }]),
        ).toEqual([{ label: 'empty', data: [] }]);
    });

    it('handles an empty input list', () => {
        expect(normalizeSeriesToBaseline([])).toEqual([]);
    });
});
