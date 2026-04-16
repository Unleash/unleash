import { describe, expect, it } from 'vitest';
import { groupImpactConfigs } from './groupImpactConfigs';
import type { ImpactMetricsConfigSchema } from 'openapi';

const makeConfig = (
    overrides: Partial<ImpactMetricsConfigSchema> = {},
): ImpactMetricsConfigSchema => ({
    id: crypto.randomUUID(),
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
        expect(groups).toHaveLength(1);
        expect(groups[0].configs).toEqual([config]);
    });

    it('groups configs with same timeRange, aggregationMode, and labelSelectors', () => {
        const a = makeConfig({ displayName: 'A', metricName: 'metric_a' });
        const b = makeConfig({ displayName: 'B', metricName: 'metric_b' });
        const groups = groupImpactConfigs([a, b]);
        expect(groups).toHaveLength(1);
        expect(groups[0].configs).toEqual([a, b]);
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
        expect(groups).toHaveLength(1);
        expect(groups[0].configs).toEqual([a, b]);
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
        expect(groups).toHaveLength(2);
        expect(groups[0].configs).toEqual([a]);
        expect(groups[1].configs).toEqual([b]);
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
        expect(groups).toHaveLength(2);
        // writable configs grouped together
        expect(groups[0].configs).toEqual([writable1, writable2]);
        // safeguard stays solo
        expect(groups[1].configs).toEqual([safeguard]);
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
        expect(groups).toHaveLength(2);
        expect(groups[0].configs).toEqual([dayCount1, dayCount2]);
        expect(groups[1].configs).toEqual([weekRps]);
    });
});
