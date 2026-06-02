import { describe, expect, it } from 'vitest';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { VisibleWindow } from 'component/impact-metrics/MultimetricChart/chartConfig';
import {
    computeFlagEventImpacts,
    getDefaultHalfWindowMs,
} from './computeFlagEventImpact';
import type { ImpactViewFeatureEvent } from './types';

const HOUR_MS = 60 * 60 * 1000;
const HOUR_SEC = 60 * 60;
const DAY_MS = 24 * HOUR_MS;
const DAY_SEC = 24 * HOUR_SEC;

const makeEvent = (
    overrides: Partial<ImpactViewFeatureEvent> & {
        id: number;
        timestamp: number;
    },
): ImpactViewFeatureEvent => ({
    type: 'feature-environment-enabled',
    label: 'Enabled',
    createdBy: 'someone',
    featureName: 'my-flag',
    ...overrides,
});

// `month` view → ±1 day half-window.
const MONTH_WINDOW: VisibleWindow = {
    minMs: 0,
    maxMs: 30 * DAY_MS,
    rangeMs: 30 * DAY_MS,
};

// `day` view → ±1 hour half-window.
const DAY_WINDOW: VisibleWindow = {
    minMs: 0,
    maxMs: DAY_MS,
    rangeMs: DAY_MS,
};

const seriesAt = (points: [number, number][]): MultimetricStepSeries => ({
    label: 'goal',
    data: points,
});

describe('computeFlagEventImpacts', () => {
    it('returns empty when there is no goal series', () => {
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: DAY_MS })],
            goalSeries: undefined,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('returns empty when there are no events', () => {
        const result = computeFlagEventImpacts({
            events: [],
            goalSeries: seriesAt([[0, 1]]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('computes pre/post means and Δ% for a latest-mode goal', () => {
        // Event at day 10. Pre-window samples = [10, 10] → mean 10. Post-window
        // samples = [20, 20] → mean 20. Δ% = (20-10)/10 * 100 = +100.
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - 2 * HOUR_SEC, 10],
                [10 * DAY_SEC - HOUR_SEC, 10],
                [10 * DAY_SEC + HOUR_SEC, 20],
                [10 * DAY_SEC + 2 * HOUR_SEC, 20],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            eventId: 1,
            preValue: 10,
            postValue: 20,
            deltaAbs: 10,
            deltaPct: 100,
            halfWindowMs: getDefaultHalfWindowMs('month'),
        });
    });

    it('sums values per side for cumulative goals', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - HOUR_SEC, 3],
                [10 * DAY_SEC - 30 * 60, 4],
                [10 * DAY_SEC + 30 * 60, 5],
                [10 * DAY_SEC + HOUR_SEC, 5],
            ]),
            aggregationMode: 'count',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result[0].preValue).toBe(7);
        expect(result[0].postValue).toBe(10);
        expect(result[0].deltaPct).toBeCloseTo((3 / 7) * 100);
    });

    it('returns deltaPct = null when pre is zero', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - HOUR_SEC, 0],
                [10 * DAY_SEC + HOUR_SEC, 5],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result[0].preValue).toBe(0);
        expect(result[0].postValue).toBe(5);
        expect(result[0].deltaAbs).toBe(5);
        expect(result[0].deltaPct).toBeNull();
    });

    it('returns nulls and ranks the event last when one side has no data', () => {
        // Event right at the start of the window — no pre-window data exists.
        const eventMs = HOUR_MS;
        const result = computeFlagEventImpacts({
            events: [
                makeEvent({ id: 1, timestamp: 12 * HOUR_MS }),
                makeEvent({ id: 2, timestamp: eventMs }),
            ],
            goalSeries: seriesAt([
                // No pre-window points exist before event 2.
                [HOUR_SEC + 30 * 60, 5],
                [HOUR_SEC + 60 * 60, 5],
                [12 * HOUR_SEC - 30 * 60, 5],
                [12 * HOUR_SEC + 30 * 60, 10],
            ]),
            aggregationMode: 'avg',
            visibleWindow: DAY_WINDOW,
            timeRange: 'day',
        });
        // The event with measurable Δ% (event 1) should rank first; the
        // event with null Δ% (event 2) ranks last.
        expect(result.map((impact) => impact.eventId)).toEqual([1, 2]);
        const eventTwo = result.find((impact) => impact.eventId === 2)!;
        expect(eventTwo.preValue).toBeNull();
        expect(eventTwo.postValue).not.toBeNull();
        expect(eventTwo.deltaPct).toBeNull();
    });

    it('drops an event with no pre and no post data', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            // All series points fall far outside the half-window.
            goalSeries: seriesAt([
                [1 * DAY_SEC, 5],
                [2 * DAY_SEC, 5],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('records the requested half-window and clamp reason on each impact', () => {
        const firstMs = 10 * DAY_MS;
        const secondMs = firstMs + 6 * HOUR_MS;
        const result = computeFlagEventImpacts({
            events: [
                makeEvent({ id: 1, timestamp: firstMs }),
                makeEvent({ id: 2, timestamp: secondMs }),
            ],
            goalSeries: seriesAt([
                [10 * DAY_SEC - 60, 1],
                [10 * DAY_SEC + 6 * HOUR_SEC + 60, 1],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
            // 1 day requested; neighbour is 6h away so each event's window
            // clamps to 3h.
            halfWindowMs: DAY_MS,
        });
        const first = result.find((impact) => impact.eventId === 1)!;
        expect(first.requestedHalfWindowMs).toBe(DAY_MS);
        expect(first.halfWindowMs).toBe(3 * HOUR_MS);
        expect(first.clampReason).toBe('next-event');
        const second = result.find((impact) => impact.eventId === 2)!;
        expect(second.clampReason).toBe('previous-event');
    });

    it('leaves clampReason null when the effective window equals the requested one', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - HOUR_SEC, 5],
                [10 * DAY_SEC + HOUR_SEC, 10],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
            halfWindowMs: 2 * HOUR_MS,
        });
        expect(result[0].requestedHalfWindowMs).toBe(2 * HOUR_MS);
        expect(result[0].halfWindowMs).toBe(2 * HOUR_MS);
        expect(result[0].clampReason).toBeNull();
    });

    it('clamps the half-window to half the distance between neighbouring events', () => {
        // Two events 30 minutes apart inside a `month` view: default half-window
        // is 1 day but should shrink to 15 minutes for both.
        const firstMs = 10 * DAY_MS;
        const secondMs = firstMs + 30 * 60 * 1000;
        const result = computeFlagEventImpacts({
            events: [
                makeEvent({ id: 1, timestamp: firstMs }),
                makeEvent({ id: 2, timestamp: secondMs }),
            ],
            goalSeries: seriesAt([
                // Far enough away that they don't fall inside the (clamped) windows.
                [10 * DAY_SEC - 60, 1],
                [10 * DAY_SEC + 30 * 60 + 60, 1],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        for (const impact of result) {
            expect(impact.halfWindowMs).toBe(15 * 60 * 1000);
        }
    });

    it('ranks impacts by |Δ%| descending', () => {
        // Three events with Δ% of +200, -100, +20 respectively.
        const events: ImpactViewFeatureEvent[] = [
            makeEvent({ id: 1, timestamp: 5 * DAY_MS }),
            makeEvent({ id: 2, timestamp: 15 * DAY_MS }),
            makeEvent({ id: 3, timestamp: 25 * DAY_MS }),
        ];
        const goalSeries = seriesAt([
            // event 1: pre = 10, post = 30 → +200%
            [5 * DAY_SEC - HOUR_SEC, 10],
            [5 * DAY_SEC + HOUR_SEC, 30],
            // event 2: pre = 10, post = 0 → -100%
            [15 * DAY_SEC - HOUR_SEC, 10],
            [15 * DAY_SEC + HOUR_SEC, 0],
            // event 3: pre = 10, post = 12 → +20%
            [25 * DAY_SEC - HOUR_SEC, 10],
            [25 * DAY_SEC + HOUR_SEC, 12],
        ]);
        const result = computeFlagEventImpacts({
            events,
            goalSeries,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result.map((impact) => impact.eventId)).toEqual([1, 2, 3]);
    });

    it('exposes the raw pre/post points used in the aggregates', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                // pre — both inside the ±1d default
                [10 * DAY_SEC - 2 * HOUR_SEC, 5],
                [10 * DAY_SEC - HOUR_SEC, 7],
                // post — both inside the ±1d default
                [10 * DAY_SEC + HOUR_SEC, 9],
                [10 * DAY_SEC + 2 * HOUR_SEC, 11],
                // out-of-window — neither side should pick this up
                [10 * DAY_SEC + 3 * DAY_SEC, 99],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result[0].preSeries).toEqual([
            [10 * DAY_SEC - 2 * HOUR_SEC, 5],
            [10 * DAY_SEC - HOUR_SEC, 7],
        ]);
        expect(result[0].postSeries).toEqual([
            [10 * DAY_SEC + HOUR_SEC, 9],
            [10 * DAY_SEC + 2 * HOUR_SEC, 11],
        ]);
    });

    it('drops non-finite values from the raw pre/post points', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - HOUR_SEC, Number.NaN],
                [10 * DAY_SEC - 30 * 60, 10],
                [10 * DAY_SEC + 30 * 60, 20],
                [10 * DAY_SEC + HOUR_SEC, Number.POSITIVE_INFINITY],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result[0].preSeries).toEqual([[10 * DAY_SEC - 30 * 60, 10]]);
        expect(result[0].postSeries).toEqual([[10 * DAY_SEC + 30 * 60, 20]]);
    });

    it('respects an explicit halfWindowMs override', () => {
        // Default for `month` is ±1 day. Override to ±2 hours and confirm the
        // event picks up the shorter window in its `halfWindowMs` field.
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - HOUR_SEC, 5],
                [10 * DAY_SEC + HOUR_SEC, 15],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
            halfWindowMs: 2 * HOUR_MS,
        });
        expect(result[0].halfWindowMs).toBe(2 * HOUR_MS);
    });

    it('skips non-finite series values', () => {
        const eventMs = 10 * DAY_MS;
        const result = computeFlagEventImpacts({
            events: [makeEvent({ id: 1, timestamp: eventMs })],
            goalSeries: seriesAt([
                [10 * DAY_SEC - HOUR_SEC, Number.NaN],
                [10 * DAY_SEC - 30 * 60, 10],
                [10 * DAY_SEC + 30 * 60, 20],
                [10 * DAY_SEC + HOUR_SEC, Number.POSITIVE_INFINITY],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result[0].preValue).toBe(10);
        expect(result[0].postValue).toBe(20);
    });
});
