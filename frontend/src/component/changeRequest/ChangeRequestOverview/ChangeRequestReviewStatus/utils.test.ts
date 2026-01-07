import { getBrowserTimezoneInHumanReadableUTCOffset } from './utils.js';
import { vi } from 'vitest';

describe('getBrowserTimezoneInHumanReadableUTCOffset', () => {
    // Test for the current timezone offset
    test('should return the correct UTC offset for the current timezone', () => {
        const date = new Date('2023-01-01T00:00:00Z'); // fixed date in UTC
        const expectedOffset = new Date(
            '2023-01-01T00:00:00Z',
        ).getTimezoneOffset();
        const sign = expectedOffset > 0 ? '-' : '+';
        const expectedHours = Math.floor(Math.abs(expectedOffset) / 60)
            .toString()
            .padStart(2, '0');
        const expectedMinutes = (Math.abs(expectedOffset) % 60)
            .toString()
            .padStart(2, '0');
        const expected = `UTC${sign}${expectedHours}:${expectedMinutes}`;

        const result = getBrowserTimezoneInHumanReadableUTCOffset(date);
        expect(result).toBe(expected);
    });

    // Test for known timezones
    const timezones = [
        { offset: 0, expected: 'UTC+00:00' },
        { offset: -330, expected: 'UTC+05:30' },
        { offset: -120, expected: 'UTC+02:00' },
        { offset: 420, expected: 'UTC-07:00' },
    ];

    timezones.forEach(({ offset, expected }) => {
        test(`should return '${expected}' for offset ${offset} minutes`, () => {
            // Mock the getTimezoneOffset function to return a fixed offset
            Date.prototype.getTimezoneOffset = vi.fn(() => offset);
            const result = getBrowserTimezoneInHumanReadableUTCOffset();
            expect(result).toBe(expected);
        });
    });

    // Edge cases
    test('should handle the edge case for zero offset', () => {
        Date.prototype.getTimezoneOffset = vi.fn(() => 0);
        const result = getBrowserTimezoneInHumanReadableUTCOffset();
        expect(result).toBe('UTC+00:00');
    });

    test('should handle offsets that are not on the hour', () => {
        Date.prototype.getTimezoneOffset = vi.fn(() => -45);
        const result = getBrowserTimezoneInHumanReadableUTCOffset();
        expect(result).toBe('UTC+00:45');
    });

    // Reset mock after all tests are done
    afterAll(() => {
        vi.restoreAllMocks();
    });
});
