import { describe, expect, it } from 'vitest';
import { formatHalfWindow, formatPct } from './formatting';

describe('formatPct', () => {
    it('prefixes positive values with a plus sign', () => {
        expect(formatPct(85)).toBe('+85%');
    });

    it('prefixes negative values with a unicode minus', () => {
        expect(formatPct(-12)).toBe('−12%');
    });

    it('rounds magnitudes of 10 or more to whole numbers', () => {
        expect(formatPct(33.333)).toBe('+33%');
        expect(formatPct(-99.9)).toBe('−100%');
    });

    it('keeps one decimal for small non-integer magnitudes', () => {
        expect(formatPct(2.5)).toBe('+2.5%');
        expect(formatPct(-0.54)).toBe('−0.5%');
    });

    it('drops the decimal for small integer magnitudes', () => {
        expect(formatPct(5)).toBe('+5%');
    });
});

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
