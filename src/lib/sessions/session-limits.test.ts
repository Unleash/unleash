import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';

import {
    resolveKeepAliveIntervalSeconds,
    resolveSessionLimits,
} from './session-limits.js';

const options = (overrides = {}) => ({
    ttlHours: 48,
    idleTimeoutMinutes: 0,
    ...overrides,
});

describe('session limits', () => {
    test('the idle timeout is off by default', () => {
        expect(resolveSessionLimits(options()).idleTimeoutMs).toBe(0);
    });

    test('a nonsensical ttl falls back to 48 hours instead of disabling the limit', () => {
        for (const ttlHours of [0, -1, Number.NaN]) {
            expect(
                resolveSessionLimits(options({ ttlHours })).hardMaxAgeMs,
            ).toBe(hoursToMilliseconds(48));
        }
    });

    test('a negative idle timeout is read as off', () => {
        expect(
            resolveSessionLimits(options({ idleTimeoutMinutes: -5 }))
                .idleTimeoutMs,
        ).toBe(0);
    });

    test('the idle timeout is taken as given when it is positive', () => {
        expect(
            resolveSessionLimits(options({ idleTimeoutMinutes: 15 }))
                .idleTimeoutMs,
        ).toBe(minutesToMilliseconds(15));
    });

    test.each([
        ['there is no idle window', { idleTimeoutMinutes: 0 }, 0],
        [
            'the shortest window the setting allows',
            { idleTimeoutMinutes: 1 },
            20,
        ],
        [
            'a third that lands exactly on the cap',
            { idleTimeoutMinutes: 3 },
            60,
        ],
        ['a third past the cap is capped', { idleTimeoutMinutes: 15 }, 60],
        ['however long the window gets', { idleTimeoutMinutes: 480 }, 60],
    ])('asks for a third of the idle window, capped at a minute: %s', (_name, overrides, expected) => {
        expect(resolveKeepAliveIntervalSeconds(options(overrides))).toBe(
            expected,
        );
    });
});
