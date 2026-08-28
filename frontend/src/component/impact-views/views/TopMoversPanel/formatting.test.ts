import { describe, expect, it } from 'vitest';
import { formatHalfWindow } from './formatting';

describe('formatHalfWindow', () => {
    it('renders sub-hour windows in minutes', () => {
        expect(formatHalfWindow(5 * 60 * 1000)).toBe('5m');
    });

    it('renders sub-day windows in hours', () => {
        expect(formatHalfWindow(60 * 60 * 1000)).toBe('1h');
        expect(formatHalfWindow(6 * 60 * 60 * 1000)).toBe('6h');
    });

    it('renders day-scale windows in days', () => {
        expect(formatHalfWindow(24 * 60 * 60 * 1000)).toBe('1d');
        expect(formatHalfWindow(3 * 24 * 60 * 60 * 1000)).toBe('3d');
        expect(formatHalfWindow(7 * 24 * 60 * 60 * 1000)).toBe('7d');
    });
});
