import { describe, expect, it } from 'vitest';
import { formatPct } from './formatting';

describe('formatPct', () => {
    it('prefixes positive values with a plus sign', () => {
        expect(formatPct(85)).toBe('+85%');
    });

    it('prefixes negative values with a unicode minus', () => {
        expect(formatPct(-12)).toBe('−12%');
    });

    it('leaves zero unsigned', () => {
        expect(formatPct(0)).toBe('0%');
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
