import { median } from './median.js';

test('calculateMedian with an odd number of elements', () => {
    expect(median([1, 3, 5])).toBe(3);
});

test('calculateMedian with an even number of elements', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
});

test('calculateMedian with negative numbers', () => {
    expect(median([-5, -1, -3, -2, -4])).toBe(-3);
});

test('calculateMedian with one element', () => {
    expect(median([42])).toBe(42);
});

test('calculateMedian with an empty array', () => {
    expect(median([])).toBe(Number.NaN);
});
