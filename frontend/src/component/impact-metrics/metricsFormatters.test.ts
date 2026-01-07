import { formatLargeNumbers } from './metricsFormatters.js';

describe('formatLargeNumbers', () => {
    it('formats small numbers with locale formatting', () => {
        expect(formatLargeNumbers(0)).toBe('0');
        expect(formatLargeNumbers(999)).toBe('999');
    });

    it('formats thousands correctly', () => {
        expect(formatLargeNumbers(1000)).toBe('1K');
        expect(formatLargeNumbers(1200)).toBe('1.2K');
        expect(formatLargeNumbers(1400)).toBe('1.4K');
        expect(formatLargeNumbers(1600)).toBe('1.6K');
        expect(formatLargeNumbers(5000)).toBe('5K');
        expect(formatLargeNumbers(9500)).toBe('9.5K');
        expect(formatLargeNumbers(10000)).toBe('10K');
        expect(formatLargeNumbers(999000)).toBe('999K');
    });

    it('formats millions correctly', () => {
        expect(formatLargeNumbers(1000000)).toBe('1M');
        expect(formatLargeNumbers(1500000)).toBe('1.5M');
        expect(formatLargeNumbers(2700000)).toBe('2.7M');
        expect(formatLargeNumbers(5000000)).toBe('5M');
        expect(formatLargeNumbers(9900000)).toBe('9.9M');
        expect(formatLargeNumbers(10000000)).toBe('10M');
    });

    it('formats billions correctly', () => {
        expect(formatLargeNumbers(1000000000)).toBe('1B');
        expect(formatLargeNumbers(1500000000)).toBe('1.5B');
        expect(formatLargeNumbers(10000000000)).toBe('10B');
        expect(formatLargeNumbers(999000000000)).toBe('999B');
    });

    it('formats trillions correctly', () => {
        expect(formatLargeNumbers(1000000000000)).toBe('1T');
        expect(formatLargeNumbers(2500000000000)).toBe('2.5T');
        expect(formatLargeNumbers(10000000000000)).toBe('10T');
    });
});
