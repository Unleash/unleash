import { describe, it, expect } from 'vitest';
import { getMilestoneProgressionInfo } from './getMilestoneProgressionInfo.js';

describe('getMilestoneProgressionInfo', () => {
    const currentTime = new Date('2025-10-31T15:00:00.000Z');

    it('returns immediate proceed message when elapsed >= interval', () => {
        const startedAt = '2025-10-31T14:00:00.000Z';
        const res = getMilestoneProgressionInfo(
            30,
            startedAt,
            'en-US',
            undefined,
            currentTime,
        );
        expect(res).toBeTruthy();
        expect(res as string).toMatch(/^Already .* in this milestone\.$/);
    });

    it('returns proceed time and remaining message when elapsed < interval', () => {
        const startedAt = '2025-10-31T14:00:00.000Z';
        const res = getMilestoneProgressionInfo(
            120,
            startedAt,
            'en-US',
            undefined,
            currentTime,
        );
        expect(res).toBeTruthy();
        expect(res as string).toMatch(/^Will proceed at .* \(in .*\)\.$/);
    });

    it('returns null when milestone is paused', () => {
        const startedAt = '2025-10-31T14:00:00.000Z';
        const res = getMilestoneProgressionInfo(
            120,
            startedAt,
            'en-US',
            { type: 'paused' },
            currentTime,
        );
        expect(res).toBeNull();
    });
});
