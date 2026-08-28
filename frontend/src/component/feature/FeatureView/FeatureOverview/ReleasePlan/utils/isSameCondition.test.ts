import { expect, test } from 'vitest';
import { isSameCondition } from './isSameCondition.ts';

test('compares time conditions by their interval', () => {
    expect(
        isSameCondition({ intervalMinutes: 120 }, { intervalMinutes: 120 }),
    ).toBe(true);
    expect(
        isSameCondition({ intervalMinutes: 120 }, { intervalMinutes: 60 }),
    ).toBe(false);
});

test('treats an unstamped time condition as equal to a stamped one', () => {
    expect(
        isSameCondition(
            { intervalMinutes: 120 },
            { type: 'time', intervalMinutes: 120 },
        ),
    ).toBe(true);
});

test('compares exposure conditions by their minimum exposures', () => {
    expect(
        isSameCondition(
            { type: 'exposure', minimumExposures: 1000 },
            { type: 'exposure', minimumExposures: 1000 },
        ),
    ).toBe(true);
    expect(
        isSameCondition(
            { type: 'exposure', minimumExposures: 1000 },
            { type: 'exposure', minimumExposures: 500 },
        ),
    ).toBe(false);
});

test('conditions of different types are never the same', () => {
    expect(
        isSameCondition(
            { intervalMinutes: 100 },
            { type: 'exposure', minimumExposures: 100 },
        ),
    ).toBe(false);
});
