import { describe, expect, it } from 'vitest';
import { groupImpactConfigs, multimetricFirst } from './groupImpactConfigs';
import type { ImpactMetricsConfigSchema } from 'openapi';

let ulidCounter = 0;
const fakeUlid = () => {
    ulidCounter++;
    return `01ARZ3NDEKTSV4RRFFQ69G5F${String(ulidCounter).padStart(2, '0')}`;
};

const makeConfig = (
    overrides: Partial<ImpactMetricsConfigSchema> = {},
): ImpactMetricsConfigSchema => ({
    id: fakeUlid(),
    metricName: 'unleash_counter_test',
    displayName: 'Test metric',
    timeRange: 'day',
    aggregationMode: 'count',
    labelSelectors: {},
    yAxisMin: 'auto',
    ...overrides,
});

describe('groupImpactConfigs', () => {
    it('returns empty array for empty input', () => {
        expect(groupImpactConfigs([])).toEqual([]);
    });

    it('keeps a single config as a single-item group', () => {
        const config = makeConfig();
        const groups = groupImpactConfigs([config]);
        expect(groups).toEqual([
            {
                key: 'day::count::auto::{}',
                timeRange: 'day',
                aggregationMode: 'count',
                labelSelectors: {},
                configs: [config],
            },
        ]);
    });

    it('groups configs with same timeRange, aggregationMode, and labelSelectors', () => {
        const a = makeConfig({ displayName: 'A', metricName: 'metric_a' });
        const b = makeConfig({ displayName: 'B', metricName: 'metric_b' });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toEqual([
            {
                key: 'day::count::auto::{}',
                timeRange: 'day',
                aggregationMode: 'count',
                labelSelectors: {},
                configs: [a, b],
            },
        ]);
    });

    it('separates configs with different timeRange', () => {
        const a = makeConfig({ timeRange: 'day' });
        const b = makeConfig({ timeRange: 'week' });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toHaveLength(2);
    });

    it('separates configs with different aggregationMode', () => {
        const a = makeConfig({ aggregationMode: 'count' });
        const b = makeConfig({ aggregationMode: 'rps' });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toHaveLength(2);
    });

    it('separates configs with different labelSelectors', () => {
        const a = makeConfig({ labelSelectors: { env: ['prod'] } });
        const b = makeConfig({ labelSelectors: { env: ['staging'] } });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toHaveLength(2);
    });

    it('separates configs with different yAxisMin', () => {
        const a = makeConfig({ yAxisMin: 'auto' });
        const b = makeConfig({ yAxisMin: 'zero' });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toHaveLength(2);
    });

    it('treats label selectors as equal regardless of key order', () => {
        const a = makeConfig({
            labelSelectors: { env: ['prod'], region: ['eu'] },
        });
        const b = makeConfig({
            labelSelectors: { region: ['eu'], env: ['prod'] },
        });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toEqual([
            expect.objectContaining({
                timeRange: 'day',
                aggregationMode: 'count',
                labelSelectors: { env: ['prod'], region: ['eu'] },
                configs: [a, b],
            }),
        ]);
    });

    it('treats label selectors as equal regardless of value order', () => {
        const a = makeConfig({
            labelSelectors: { env: ['prod', 'staging'] },
        });
        const b = makeConfig({
            labelSelectors: { env: ['staging', 'prod'] },
        });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toHaveLength(1);
    });

    it('preserves insertion order within groups', () => {
        const a = makeConfig({
            displayName: 'First',
            metricName: 'metric_a',
        });
        const b = makeConfig({
            displayName: 'Second',
            metricName: 'metric_b',
        });
        const c = makeConfig({
            displayName: 'Third',
            metricName: 'metric_c',
        });
        const groups = groupImpactConfigs([a, b, c]);
        expect(groups[0].configs.map((c) => c.displayName)).toEqual([
            'First',
            'Second',
            'Third',
        ]);
    });

    it('never groups safeguard charts (mode === read)', () => {
        const a = makeConfig({
            displayName: 'A',
            metricName: 'metric_a',
            mode: 'read',
        });
        const b = makeConfig({
            displayName: 'B',
            metricName: 'metric_b',
            mode: 'read',
        });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toEqual([
            expect.objectContaining({ configs: [a] }),
            expect.objectContaining({ configs: [b] }),
        ]);
    });

    it('does not group a read-mode config with matching write-mode configs', () => {
        const writable1 = makeConfig({
            displayName: 'W1',
            metricName: 'metric_w1',
        });
        const safeguard = makeConfig({
            displayName: 'S',
            metricName: 'metric_s',
            mode: 'read',
        });
        const writable2 = makeConfig({
            displayName: 'W2',
            metricName: 'metric_w2',
        });
        const groups = groupImpactConfigs([writable1, safeguard, writable2]);
        expect(groups).toEqual([
            expect.objectContaining({
                timeRange: 'day',
                aggregationMode: 'count',
                configs: [writable1, writable2],
            }),
            expect.objectContaining({
                configs: [safeguard],
            }),
        ]);
    });

    it('creates multiple groups for mixed configs', () => {
        const dayCount1 = makeConfig({
            displayName: 'A',
            timeRange: 'day',
            aggregationMode: 'count',
        });
        const dayCount2 = makeConfig({
            displayName: 'B',
            timeRange: 'day',
            aggregationMode: 'count',
        });
        const weekRps = makeConfig({
            displayName: 'C',
            timeRange: 'week',
            aggregationMode: 'rps',
        });
        const groups = groupImpactConfigs([dayCount1, dayCount2, weekRps]);
        expect(groups).toEqual([
            expect.objectContaining({
                timeRange: 'day',
                aggregationMode: 'count',
                configs: [dayCount1, dayCount2],
            }),
            expect.objectContaining({
                timeRange: 'week',
                aggregationMode: 'rps',
                configs: [weekRps],
            }),
        ]);
    });
});

describe('multimetricFirst', () => {
    it('moves multi-config groups ahead of solo groups', () => {
        const solo = makeConfig({ displayName: 'solo', timeRange: 'week' });
        const paired1 = makeConfig({ displayName: 'A', timeRange: 'day' });
        const paired2 = makeConfig({ displayName: 'B', timeRange: 'day' });
        const groups = groupImpactConfigs([solo, paired1, paired2]);
        const ordered = multimetricFirst(groups);
        expect(ordered.map((group) => group.configs.length)).toEqual([2, 1]);
    });

    it('preserves relative order within each partition', () => {
        const firstPair = [
            makeConfig({ displayName: 'A1', timeRange: 'day' }),
            makeConfig({ displayName: 'A2', timeRange: 'day' }),
        ];
        const firstSolo = makeConfig({
            displayName: 'S1',
            timeRange: 'week',
        });
        const secondPair = [
            makeConfig({ displayName: 'B1', timeRange: 'month' }),
            makeConfig({ displayName: 'B2', timeRange: 'month' }),
        ];
        const secondSolo = makeConfig({
            displayName: 'S2',
            timeRange: 'hour',
        });
        const groups = groupImpactConfigs([
            ...firstPair,
            firstSolo,
            ...secondPair,
            secondSolo,
        ]);
        const ordered = multimetricFirst(groups);
        expect(ordered.map((group) => group.timeRange)).toEqual([
            'day',
            'month',
            'week',
            'hour',
        ]);
    });

    it('returns an empty array when no groups are provided', () => {
        expect(multimetricFirst([])).toEqual([]);
    });
});
