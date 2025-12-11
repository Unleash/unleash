import { calculateDateRange, type RangeType } from './calculateDateRange.js';

describe('calculateDateRange', () => {
    const fixedDate = new Date('2024-06-16');

    test.each<[RangeType, string, string]>([
        ['thisMonth', '2024-06-01', '2024-06-30'],
        ['previousMonth', '2024-05-01', '2024-05-31'],
        ['thisQuarter', '2024-04-01', '2024-06-30'],
        ['previousQuarter', '2024-01-01', '2024-03-31'],
        ['thisYear', '2024-01-01', '2024-12-31'],
        ['previousYear', '2023-01-01', '2023-12-31'],
    ])('should return correct range for %s', (rangeType, expectedStart, expectedEnd) => {
        const [start, end] = calculateDateRange(rangeType, fixedDate);
        expect(start).toBe(expectedStart);
        expect(end).toBe(expectedEnd);
    });

    test('should default to previousMonth if rangeType is invalid', () => {
        const [start, end] = calculateDateRange(
            'invalidRange' as RangeType,
            fixedDate,
        );
        expect(start).toBe('2024-05-01');
        expect(end).toBe('2024-05-31');
    });

    test('should handle edge case for previousMonth at year boundary', () => {
        const yearBoundaryDate = new Date('2024-01-15');
        const [start, end] = calculateDateRange(
            'previousMonth',
            yearBoundaryDate,
        );
        expect(start).toBe('2023-12-01');
        expect(end).toBe('2023-12-31');
    });
});
