import { expect, test } from 'vitest';
import { isValidAutomation } from './isValidAutomation.ts';

test('a time condition is valid when the interval is at least one minute', () => {
    expect(isValidAutomation({ intervalMinutes: 1 })).toBe(true);
    expect(isValidAutomation({ intervalMinutes: 0 })).toBe(false);
});

test('an exposure condition is valid when it requires at least one exposure', () => {
    expect(isValidAutomation({ type: 'exposure', minimumExposures: 1 })).toBe(
        true,
    );
    expect(isValidAutomation({ type: 'exposure', minimumExposures: 0 })).toBe(
        false,
    );
});
