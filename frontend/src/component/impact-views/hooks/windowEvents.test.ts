import { describe, expect, it } from 'vitest';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';
import {
    deriveDateRange,
    filterEventsToWindow,
    isInWindow,
} from './windowEvents';

const event = (id: number, timestamp: number): MultimetricFeatureEvent => ({
    id,
    timestamp,
    type: 'feature-environment-enabled',
    label: 'Enabled',
    createdBy: 'someone',
    featureName: `flag-${id}`,
    environment: 'production',
});

describe('deriveDateRange', () => {
    it('pads the visible window by one day on each side', () => {
        // 2026-06-10T00:00:00Z .. 2026-06-20T00:00:00Z (unix seconds)
        const start = `${Date.UTC(2026, 5, 10) / 1000}`;
        const end = `${Date.UTC(2026, 5, 20) / 1000}`;
        const range = deriveDateRange(start, end);
        // Padded out by a day each way; exact local date depends on TZ, but the
        // span is always 12 days (10-day window + 1 day padding each side).
        const dayMs = 24 * 60 * 60 * 1000;
        const spanDays =
            (new Date(range!.toDate).getTime() -
                new Date(range!.fromDate).getTime()) /
            dayMs;
        expect(spanDays).toBe(12);
    });

    it('produces yyyy-MM-dd strings', () => {
        const start = `${Date.UTC(2026, 0, 1) / 1000}`;
        const end = `${Date.UTC(2026, 0, 2) / 1000}`;
        const range = deriveDateRange(start, end);
        expect(range!.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(range!.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns null for empty/invalid bounds (pre-load)', () => {
        expect(deriveDateRange('', '')).toBeNull();
        expect(deriveDateRange('abc', '123')).toBeNull();
    });
});

describe('isInWindow', () => {
    const window = { fromMs: 100, toMs: 200 };

    it('includes events on the inclusive boundaries', () => {
        expect(isInWindow(event(1, 100), window)).toBe(true);
        expect(isInWindow(event(2, 200), window)).toBe(true);
    });

    it('excludes events outside the window', () => {
        expect(isInWindow(event(3, 99), window)).toBe(false);
        expect(isInWindow(event(4, 201), window)).toBe(false);
    });
});

describe('filterEventsToWindow', () => {
    it('keeps in-window events and returns them sorted ascending', () => {
        const result = filterEventsToWindow(
            [event(1, 250), event(2, 150), event(3, 120), event(4, 50)],
            { fromMs: 100, toMs: 200 },
        );
        expect(result.map((e) => e.id)).toEqual([3, 2]);
    });

    it('returns empty for no matches', () => {
        expect(
            filterEventsToWindow([event(1, 10)], { fromMs: 100, toMs: 200 }),
        ).toEqual([]);
    });
});
