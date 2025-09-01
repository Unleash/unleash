import { calculateRatio } from './calculate-ratio.ts';

test('A ratio of anything to 0 is N/A', () => {
    expect(calculateRatio(0, 0)).toBe('N/A');
    expect(calculateRatio(5, 0)).toBe('N/A');
});

test('Normal ratios work as expected', () => {
    expect(calculateRatio(0, 1)).toBe('0%');
    expect(calculateRatio(1, 1)).toBe('100%');
    expect(calculateRatio(1, 2)).toBe('50%');
    expect(calculateRatio(5, 2)).toBe('250%');
});

test('Numbers are rounded to the nearest integer', () => {
    expect(calculateRatio(5, 9)).toBe('56%');
});
