import { describe, expect, it } from 'vitest';
import type {
    MultimetricFeatureEvent,
    MultimetricStepSeries,
} from 'component/impact-metrics/MultimetricChart/types';
import type { VisibleWindow } from 'component/impact-metrics/MultimetricChart/chartConfig';
import {
    computeFlagImpacts,
    type ComputeFlagImpactsInput,
} from './computeFlagImpacts';

const HOUR_MS = 60 * 60 * 1000;
const HOUR_SEC = 60 * 60;
const DAY_MS = 24 * HOUR_MS;

// Days → hours, so series segments and events can use the same unit.
const days = (count: number): number => count * 24;

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

// `month` view → ±3h half-window.
const MONTH_WINDOW: VisibleWindow = {
    minMs: 0,
    maxMs: 30 * DAY_MS,
    rangeMs: 30 * DAY_MS,
};

const seriesOf = (data: [number, number][]): MultimetricStepSeries => ({
    label: 'goal',
    data,
});

// Builds an hourly goal series across the month window from a list of
// segments: each segment holds `value` from `fromHour` until the next
// segment starts. So "10 until day 10, then 20" is
// `[{ fromHour: 0, value: 10 }, { fromHour: days(10), value: 20 }]`.
type SeriesSegment = { fromHour: number; value: number };

const segmentedSeries = (segments: SeriesSegment[]): MultimetricStepSeries =>
    seriesOf(
        Array.from({ length: days(30) }, (_, hour) => [
            hour * HOUR_SEC,
            segments.filter(({ fromHour }) => fromHour <= hour).at(-1)?.value ??
                0,
        ]),
    );

// Default scenario: one flip at day 10 on a series that steps 10 → 20 there,
// so the ±3h month window measures +100%. Tests override the parts they care
// about.
const compute = (overrides: Partial<ComputeFlagImpactsInput>) =>
    computeFlagImpacts({
        events: [makeEvent({ id: 1, timestamp: 10 * DAY_MS })],
        goalSeries: segmentedSeries([
            { fromHour: 0, value: 10 },
            { fromHour: days(10), value: 20 },
        ]),
        aggregationMode: 'avg',
        visibleWindow: MONTH_WINDOW,
        timeRange: 'month',
        ...overrides,
    });

describe('computeFlagImpacts', () => {
    it('returns empty without a series, events, or a loaded window', () => {
        expect(compute({ goalSeries: undefined })).toEqual([]);
        expect(compute({ events: [] })).toEqual([]);
        expect(compute({ visibleWindow: null })).toEqual([]);
        // `parseVisibleWindow('', '')` produces a NaN window rather than null.
        expect(
            compute({
                visibleWindow: {
                    minMs: Number.NaN,
                    maxMs: Number.NaN,
                    rangeMs: Number.NaN,
                },
            }),
        ).toEqual([]);
    });

    it('ignores events without a feature name', () => {
        expect(
            compute({
                events: [
                    makeEvent({
                        id: 1,
                        timestamp: 10 * DAY_MS,
                        featureName: '',
                    }),
                ],
            }),
        ).toEqual([]);
    });

    it('computes Δ% from pre/post means for a latest-mode goal', () => {
        expect(compute({})).toEqual([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('sums values per side for cumulative goals', () => {
        // ±3h window: pre side sums 3 hourly samples of 3 (= 9); post side
        // sums 3 samples of 4 (= 12) → +33.3%.
        const result = compute({
            goalSeries: segmentedSeries([
                { fromHour: 0, value: 3 },
                { fromHour: days(10), value: 4 },
            ]),
            aggregationMode: 'count',
        });
        expect(result).toHaveLength(1);
        expect(result[0].deltaPct).toBeCloseTo((3 / 9) * 100);
        expect(result[0].tone).toBe('up');
    });

    it('marks a drop in the goal as a downward tone', () => {
        expect(
            compute({
                goalSeries: segmentedSeries([
                    { fromHour: 0, value: 20 },
                    { fromHour: days(10), value: 10 },
                ]),
            }),
        ).toEqual([{ featureName: 'my-flag', deltaPct: -50, tone: 'down' }]);
    });

    it('treats sub-threshold movement as flat', () => {
        // 1000 → 1005 is +0.5%, below the 1% threshold.
        expect(
            compute({
                goalSeries: segmentedSeries([
                    { fromHour: 0, value: 1000 },
                    { fromHour: days(10), value: 1005 },
                ]),
            }),
        ).toEqual([{ featureName: 'my-flag', deltaPct: 0.5, tone: 'flat' }]);
    });

    it('drops flips that cannot be measured', () => {
        // Zero pre-side baseline.
        expect(
            compute({
                goalSeries: segmentedSeries([
                    { fromHour: 0, value: 0 },
                    { fromHour: days(10), value: 5 },
                ]),
            }),
        ).toEqual([]);
        // No data on the pre side — the series only starts after the flip.
        expect(
            compute({
                goalSeries: seriesOf([[(days(10) + 1) * HOUR_SEC, 20]]),
            }),
        ).toEqual([]);
        // No window room — the flip sits exactly on the chart edge.
        expect(
            compute({ events: [makeEvent({ id: 1, timestamp: 0 })] }),
        ).toEqual([]);
    });

    it('shrinks the window to half the gap to a neighbouring event of another flag', () => {
        // `other-flag` flips 2h after `my-flag`, shrinking the ±3h window to
        // ±1h: pre = 10, post = 30 → +200%. Without the clamp the post side
        // would blend in the 50s after the second flip (≈ +267%).
        const result = compute({
            events: [
                makeEvent({ id: 1, timestamp: 10 * DAY_MS }),
                makeEvent({
                    id: 2,
                    timestamp: 10 * DAY_MS + 2 * HOUR_MS,
                    featureName: 'other-flag',
                }),
            ],
            goalSeries: segmentedSeries([
                { fromHour: 0, value: 10 },
                { fromHour: days(10), value: 30 },
                { fromHour: days(10) + 2, value: 50 },
            ]),
        });
        const myFlag = result.find((row) => row.featureName === 'my-flag');
        expect(myFlag?.deltaPct).toBe(200);
    });

    it('shrinks the window to the visible chart bounds', () => {
        // A flip 1h after the window start shrinks ±3h to ±1h: pre = 10,
        // post = 20 → +100%. Without the clamp the post side would blend in
        // the later 30s and 40s (+200%).
        expect(
            compute({
                events: [makeEvent({ id: 1, timestamp: HOUR_MS })],
                goalSeries: segmentedSeries([
                    { fromHour: 0, value: 10 },
                    { fromHour: 1, value: 20 },
                    { fromHour: 2, value: 30 },
                    { fromHour: 3, value: 40 },
                ]),
            }),
        ).toEqual([{ featureName: 'my-flag', deltaPct: 100, tone: 'up' }]);
    });

    it('collapses multiple events per flag to the largest |Δ%|', () => {
        // Two flips of the same flag: day 10 (+100%) and day 20 (-25%). The
        // +100% flip represents the flag.
        const result = compute({
            events: [
                makeEvent({ id: 1, timestamp: 10 * DAY_MS }),
                makeEvent({
                    id: 2,
                    timestamp: 20 * DAY_MS,
                    type: 'feature-environment-disabled',
                }),
            ],
            goalSeries: segmentedSeries([
                { fromHour: 0, value: 10 },
                { fromHour: days(10), value: 20 },
                { fromHour: days(20), value: 15 },
            ]),
        });
        expect(result).toEqual([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('ranks flags by |Δ%| desc and drops unmeasurable flags', () => {
        // big-mover flips at day 10 (+100%); small-mover at day 20 (-50%);
        // no-baseline flips at day 26, inside the all-zero tail, so its pre
        // baseline is 0 and it gets no row.
        const result = compute({
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
            goalSeries: segmentedSeries([
                { fromHour: 0, value: 10 },
                { fromHour: days(10), value: 20 },
                { fromHour: days(20), value: 10 },
                { fromHour: days(25), value: 0 },
            ]),
        });
        expect(result).toEqual([
            { featureName: 'big-mover', deltaPct: 100, tone: 'up' },
            { featureName: 'small-mover', deltaPct: -50, tone: 'down' },
        ]);
    });
});
