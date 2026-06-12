import { describe, expect, it } from 'vitest';
import type {
    MultimetricFeatureEvent,
    MultimetricStepSeries,
} from 'component/impact-metrics/MultimetricChart/types';
import type { VisibleWindow } from 'component/impact-metrics/MultimetricChart/chartConfig';
import {
    computeFlagImpacts,
    HALF_WINDOW_MS_BY_TIME_RANGE,
} from './computeFlagImpacts';

const HOUR_MS = 60 * 60 * 1000;
const HOUR_SEC = 60 * 60;
const DAY_MS = 24 * HOUR_MS;
const DAY_SEC = 24 * HOUR_SEC;

const makeEvent = (
    overrides: Partial<MultimetricFeatureEvent> & {
        id: number;
        timestamp: number;
    },
): MultimetricFeatureEvent => ({
    type: 'feature-environment-enabled',
    label: 'Enabled',
    createdBy: 'someone',
    featureName: 'my-flag',
    environment: 'production',
    ...overrides,
});

// `month` view → ±1 day half-window.
const MONTH_WINDOW: VisibleWindow = {
    minMs: 0,
    maxMs: 30 * DAY_MS,
    rangeMs: 30 * DAY_MS,
};

const seriesAt = (points: [number, number][]): MultimetricStepSeries => ({
    label: 'goal',
    data: points,
});

// One sample per hour over the whole month window: `value` before the given
// day boundary, `value + step` after it.
const stepSeries = (
    stepAtDay: number,
    value: number,
    step: number,
): MultimetricStepSeries =>
    seriesAt(
        Array.from({ length: 30 * 24 }, (_, hour) => [
            hour * HOUR_SEC,
            hour < stepAtDay * 24 ? value : value + step,
        ]),
    );

describe('computeFlagImpacts', () => {
    it('returns empty when there is no goal series', () => {
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: DAY_MS })],
            goalSeries: undefined,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('returns empty when there are no events', () => {
        const result = computeFlagImpacts({
            events: [],
            goalSeries: seriesAt([[0, 1]]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('returns empty when the visible window is null', () => {
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: DAY_MS })],
            goalSeries: seriesAt([[0, 1]]),
            aggregationMode: 'avg',
            visibleWindow: null,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('returns empty when the visible window is NaN (pre-load start/end)', () => {
        // `parseVisibleWindow('', '')` produces a NaN window rather than null.
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: DAY_MS })],
            goalSeries: seriesAt([[0, 1]]),
            aggregationMode: 'avg',
            visibleWindow: {
                minMs: Number.NaN,
                maxMs: Number.NaN,
                rangeMs: Number.NaN,
            },
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('ignores events without a feature name', () => {
        const result = computeFlagImpacts({
            events: [
                makeEvent({ id: 1, timestamp: 10 * DAY_MS, featureName: '' }),
            ],
            goalSeries: stepSeries(10, 10, 10),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('computes Δ% from pre/post means for a latest-mode goal', () => {
        // Event at day 10. ±1d window: pre mean 10, post mean 20 → +100%.
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
            goalSeries: stepSeries(10, 10, 10),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('sums values per side for cumulative goals', () => {
        // Event at day 10, ±1d window. Pre side sums 24 hourly samples of 3
        // (= 72); post side sums 24 samples of 4 (= 96) → +33.3%.
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
            goalSeries: stepSeries(10, 3, 1),
            aggregationMode: 'count',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toHaveLength(1);
        expect(result[0].deltaPct).toBeCloseTo((24 / 72) * 100);
        expect(result[0].tone).toBe('up');
    });

    it('marks a drop in the goal as a downward tone', () => {
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
            goalSeries: stepSeries(10, 20, -10),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: -50, tone: 'down' },
        ]);
    });

    it('treats sub-threshold movement as flat', () => {
        // 1000 → 1005 is +0.5%, below the 1% threshold.
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
            goalSeries: stepSeries(10, 1000, 5),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: 0.5, tone: 'flat' },
        ]);
    });

    it('drops a flag when the pre-side baseline is zero', () => {
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
            goalSeries: stepSeries(10, 0, 5),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('drops a flag when only one side has data', () => {
        // Series only exists after the event — pre side is empty.
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
            goalSeries: seriesAt([
                [10 * DAY_SEC + HOUR_SEC, 20],
                [10 * DAY_SEC + 2 * HOUR_SEC, 20],
            ]),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('drops a flag entirely when its only event has no window room', () => {
        // Event exactly at the visible-window start: zero room on the left.
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 0 })],
            goalSeries: stepSeries(10, 10, 10),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([]);
    });

    it('shrinks the window to half the gap to a neighbouring event of another flag', () => {
        // `my-flag` flips at day 10; `other-flag` flips 4 hours later. The
        // ±1d window shrinks to ±2h, so only the 2 hourly samples on each
        // side of day 10 count: pre mean 10, post mean 30 → +200% (a full
        // ±1d window would blend post samples of 30 and 50 → mean 40).
        const series = seriesAt(
            Array.from({ length: 30 * 24 }, (_, hour) => {
                const tsSec = hour * HOUR_SEC;
                const value =
                    tsSec < 10 * DAY_SEC
                        ? 10
                        : tsSec < 10 * DAY_SEC + 4 * HOUR_SEC
                          ? 30
                          : 50;
                return [tsSec, value] as [number, number];
            }),
        );
        const result = computeFlagImpacts({
            events: [
                makeEvent({ id: 1, timestamp: 10 * DAY_MS }),
                makeEvent({
                    id: 2,
                    timestamp: 10 * DAY_MS + 4 * HOUR_MS,
                    featureName: 'other-flag',
                }),
            ],
            goalSeries: series,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        const myFlag = result.find((row) => row.featureName === 'my-flag');
        expect(myFlag?.deltaPct).toBe(200);
    });

    it('shrinks the window to the visible chart bounds', () => {
        // Event 6 hours after the window start: ±1d shrinks to ±6h. Pre mean
        // 10 (6 samples), post mean 20 → +100%. With the full ±1d the pre
        // side would be empty (null Δ).
        const result = computeFlagImpacts({
            events: [makeEvent({ id: 1, timestamp: 6 * HOUR_MS })],
            goalSeries: seriesAt(
                Array.from({ length: 30 * 24 }, (_, hour) => [
                    hour * HOUR_SEC,
                    hour < 6 ? 10 : 20,
                ]),
            ),
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('collapses multiple events per flag to the largest |Δ%|', () => {
        // Two flips of the same flag, far apart: day 10 (+100%) and day 20
        // (-25%). The +100% flip represents the flag.
        const series = seriesAt(
            Array.from({ length: 30 * 24 }, (_, hour) => {
                const tsSec = hour * HOUR_SEC;
                const value =
                    tsSec < 10 * DAY_SEC ? 10 : tsSec < 20 * DAY_SEC ? 20 : 15;
                return [tsSec, value] as [number, number];
            }),
        );
        const result = computeFlagImpacts({
            events: [
                makeEvent({ id: 1, timestamp: 10 * DAY_MS }),
                makeEvent({
                    id: 2,
                    timestamp: 20 * DAY_MS,
                    type: 'feature-environment-disabled',
                }),
            ],
            goalSeries: series,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('represents a flag by its measurable flip when another flip is unmeasurable', () => {
        // First flip has an empty pre side (unmeasurable); second flip
        // measures +100%. The measurable flip represents the flag.
        const series = seriesAt(
            Array.from({ length: 30 * 24 }, (_, hour) => {
                const tsSec = hour * HOUR_SEC;
                if (tsSec < 5 * DAY_SEC + 12 * HOUR_SEC) return null;
                return [tsSec, tsSec < 20 * DAY_SEC ? 10 : 20] as [
                    number,
                    number,
                ];
            }).filter((point): point is [number, number] => point !== null),
        );
        const result = computeFlagImpacts({
            events: [
                makeEvent({ id: 1, timestamp: 5 * DAY_MS }),
                makeEvent({ id: 2, timestamp: 20 * DAY_MS }),
            ],
            goalSeries: series,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('ranks flags by |Δ%| desc and drops unmeasurable flags', () => {
        // Series: 10 before day 10, 20 between days 10–20, 10 until day 25,
        // then 0. big-mover flips at day 10 (+100%); small-mover at day 20
        // (-50%); no-baseline flips in the all-zero tail, so its pre
        // baseline is 0 and it gets no row.
        const series = seriesAt(
            Array.from({ length: 30 * 24 }, (_, hour) => {
                const tsSec = hour * HOUR_SEC;
                const value =
                    tsSec >= 25 * DAY_SEC
                        ? 0
                        : tsSec < 10 * DAY_SEC
                          ? 10
                          : tsSec < 20 * DAY_SEC
                            ? 20
                            : 10;
                return [tsSec, value] as [number, number];
            }),
        );
        const result = computeFlagImpacts({
            events: [
                makeEvent({
                    id: 1,
                    timestamp: 10 * DAY_MS,
                    featureName: 'big-mover',
                }),
                makeEvent({
                    id: 2,
                    timestamp: 20 * DAY_MS,
                    featureName: 'small-mover',
                }),
                makeEvent({
                    id: 3,
                    timestamp: 26 * DAY_MS,
                    featureName: 'no-baseline',
                }),
            ],
            goalSeries: series,
            aggregationMode: 'avg',
            visibleWindow: MONTH_WINDOW,
            timeRange: 'month',
        });
        expect(result.map((row) => row.featureName)).toEqual([
            'big-mover',
            'small-mover',
        ]);
        expect(result[0]).toMatchObject({ deltaPct: 100, tone: 'up' });
        expect(result[1]).toMatchObject({ deltaPct: -50, tone: 'down' });
    });

    it('maps every chart time range to a half-window', () => {
        expect(HALF_WINDOW_MS_BY_TIME_RANGE).toEqual({
            hour: 5 * 60 * 1000,
            day: HOUR_MS,
            week: 6 * HOUR_MS,
            month: 3 * HOUR_MS,
            threeMonths: 7 * DAY_MS,
            sixMonths: 7 * DAY_MS,
        });
    });
});
