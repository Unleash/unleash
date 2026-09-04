import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { FeatureSchema } from 'openapi';
import { isFeatureInUse } from './ArchiveButton';

const NOW = new Date('2026-09-04T12:00:00.000Z');
const daysAgo = (days: number) =>
    new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const featureWithEnvs = (
    lastSeenAts: (string | null | undefined)[],
): FeatureSchema => ({
    name: 'f',
    environments: lastSeenAts.map((lastSeenAt, i) => ({
        name: `env-${i}`,
        lastSeenAt,
    })) as FeatureSchema['environments'],
});

describe('isFeatureInUse', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    test('returns true when the most recent lastSeenAt is within the 7-day window', () => {
        expect(isFeatureInUse(featureWithEnvs([daysAgo(2)]))).toBe(true);
    });

    test('returns false when the most recent lastSeenAt is older than 7 days', () => {
        expect(isFeatureInUse(featureWithEnvs([daysAgo(30)]))).toBe(false);
    });

    test('uses the most recent env even when older ones are stale', () => {
        expect(isFeatureInUse(featureWithEnvs([daysAgo(30), daysAgo(1)]))).toBe(
            true,
        );
    });

    test('ignores null/undefined lastSeenAt values', () => {
        expect(
            isFeatureInUse(featureWithEnvs([null, undefined, daysAgo(1)])),
        ).toBe(true);
    });

    test('returns false when no env has ever been seen', () => {
        expect(isFeatureInUse(featureWithEnvs([null, undefined]))).toBe(false);
    });

    test('returns false when the feature has no environments', () => {
        expect(isFeatureInUse({ name: 'f' })).toBe(false);
    });

    test('returns false when the feature is undefined', () => {
        expect(isFeatureInUse(undefined)).toBe(false);
    });
});
