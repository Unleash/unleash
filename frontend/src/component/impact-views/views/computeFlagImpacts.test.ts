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

const MONTH_WINDOW: VisibleWindow = {
    minMs: 0,
    maxMs: 30 * DAY_MS,
    rangeMs: 30 * DAY_MS,
};

const seriesOf = (data: [number, number][]): MultimetricStepSeries => ({
    label: 'goal',
    data,
});

type SeriesSegment = { fromHour: number; value: number };

const segmentedSeries = (segments: SeriesSegment[]): MultimetricStepSeries =>
    seriesOf(
        Array.from({ length: days(30) }, (_, hour) => [
            hour * HOUR_SEC,
            segments.filter(({ fromHour }) => fromHour <= hour).at(-1)?.value ??
                0,
        ]),
    );

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
        expect(compute({})).toMatchObject([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('retains the winning flip detail for the drill-down', () => {
        const [row] = compute({});
        expect(row.detail).toMatchObject({
            before: 10,
            after: 20,
            deltaAbs: 10,
            event: { id: 1, featureName: 'my-flag' },
        });
        expect(row.detail.halfWindowMs).toBe(3 * HOUR_MS);
        expect(row.detail.preSeries.length).toBeGreaterThan(0);
        expect(row.detail.postSeries.length).toBeGreaterThan(0);
        const flipSec = (10 * DAY_MS) / 1000;
        expect(row.detail.preSeries.every(([ts]) => ts < flipSec)).toBe(true);
        expect(row.detail.postSeries.every(([ts]) => ts >= flipSec)).toBe(true);
    });

    it('sums values per side for cumulative goals', () => {
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
        ).toMatchObject([
            { featureName: 'my-flag', deltaPct: -50, tone: 'down' },
        ]);
    });

    it('treats sub-threshold movement as flat', () => {
        expect(
            compute({
                goalSeries: segmentedSeries([
                    { fromHour: 0, value: 1000 },
                    { fromHour: days(10), value: 1005 },
                ]),
            }),
        ).toMatchObject([
            { featureName: 'my-flag', deltaPct: 0.5, tone: 'flat' },
        ]);
    });

    it('drops flips that cannot be measured', () => {
        expect(
            compute({
                goalSeries: segmentedSeries([
                    { fromHour: 0, value: 0 },
                    { fromHour: days(10), value: 5 },
                ]),
            }),
        ).toEqual([]);

        expect(
            compute({
                goalSeries: seriesOf([[(days(10) + 1) * HOUR_SEC, 20]]),
            }),
        ).toEqual([]);

        expect(
            compute({ events: [makeEvent({ id: 1, timestamp: 0 })] }),
        ).toEqual([]);
    });

    it('shrinks the window to half the gap to a neighbouring event of another flag', () => {
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
        ).toMatchObject([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('drops flips that fall outside the visible chart window', () => {
        expect(
            compute({
                events: [makeEvent({ id: 1, timestamp: 40 * DAY_MS })],
            }),
        ).toEqual([]);
    });

    it('collapses multiple events per flag to the largest |Δ%|', () => {
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
        expect(result).toMatchObject([
            { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
        ]);
    });

    it('ranks flags by |Δ%| desc and drops unmeasurable flags', () => {
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
        expect(result).toMatchObject([
            { featureName: 'big-mover', deltaPct: 100, tone: 'up' },
            { featureName: 'small-mover', deltaPct: -50, tone: 'down' },
        ]);
    });
});
