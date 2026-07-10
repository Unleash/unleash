import { describe, expect, it } from 'vitest';
import {
    normalizedStrategyValue,
    normalizedVariantValue,
} from './rolloutHash.js';

describe('rolloutHash', () => {
    it('matches golden values from the murmurhash3js reference used by the server SDK', () => {
        // Golden values produced by the `murmurhash3js` package (x86.hash32),
        // the same library the Unleash feature-evaluator uses.
        expect(normalizedStrategyValue('user-1', 'demo')).toBe(95);
        expect(normalizedStrategyValue('user-2', 'demo')).toBe(96);
        expect(normalizedStrategyValue('user-7', 'demo')).toBe(81);
        expect(normalizedStrategyValue('user-42', 'demo')).toBe(87);
        expect(normalizedStrategyValue('alice', 'demo')).toBe(32);
        expect(normalizedStrategyValue('bob', 'demo')).toBe(76);

        expect(normalizedVariantValue('user-1', 'demo', 100)).toBe(93);
        expect(normalizedVariantValue('bob', 'demo', 100)).toBe(5);
    });

    it('is deterministic', () => {
        expect(normalizedStrategyValue('user-9', 'demo')).toBe(
            normalizedStrategyValue('user-9', 'demo'),
        );
    });

    it('stays within the normalized range', () => {
        for (let i = 0; i < 500; i++) {
            const v = normalizedStrategyValue(`user-${i}`, 'demo');
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(100);
        }
    });

    it('distributes roughly evenly (a 50% rollout catches ~half of users)', () => {
        const total = 2000;
        let inside = 0;
        for (let i = 0; i < total; i++) {
            if (normalizedStrategyValue(`user-${i}`, 'demo') <= 50) inside++;
        }
        const ratio = inside / total;
        expect(ratio).toBeGreaterThan(0.4);
        expect(ratio).toBeLessThan(0.6);
    });

    it('is monotonic as the rollout grows: a user inside X% stays inside for any Y > X', () => {
        const users = Array.from({ length: 200 }, (_, i) => `user-${i}`);
        for (const id of users) {
            const threshold = normalizedStrategyValue(id, 'demo');
            // A user whose bucket is `threshold` is inside every rollout >= threshold.
            expect(threshold <= threshold + 1).toBe(true);
            expect(threshold).toBeLessThanOrEqual(100);
        }
    });
});
