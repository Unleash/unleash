import { describe, expect, it } from 'vitest';
import { groupImpactMetricConfigs } from './groupImpactMetricConfigs';
import type { ImpactMetricsConfigSchema } from 'openapi';

const base: ImpactMetricsConfigSchema = {
    id: 'id-1',
    metricName: 'unleash_counter_signups',
    displayName: 'Signups',
    timeRange: 'day',
    aggregationMode: 'count',
    yAxisMin: 'auto',
    labelSelectors: {},
};

const make = (
    overrides: Partial<ImpactMetricsConfigSchema>,
): ImpactMetricsConfigSchema => ({ ...base, ...overrides });

describe('groupImpactMetricConfigs', () => {
    it('returns empty groups and singletons for empty input', () => {
        expect(groupImpactMetricConfigs([], true)).toEqual({
            groups: [],
            singletons: [],
        });
    });

    it('returns everything as singletons when disabled', () => {
        const configs = [
            make({ id: 'a' }),
            make({ id: 'b' }),
            make({ id: 'c' }),
        ];
        expect(groupImpactMetricConfigs(configs, false)).toEqual({
            groups: [],
            singletons: configs,
        });
    });

    it('groups two configs that differ only in metric name', () => {
        const a = make({ id: 'a', metricName: 'unleash_counter_a' });
        const b = make({ id: 'b', metricName: 'unleash_counter_b' });
        const result = groupImpactMetricConfigs([a, b], true);
        expect(result.groups).toEqual([[a, b]]);
        expect(result.singletons).toEqual([]);
    });

    it('separates one group from one singleton', () => {
        const a = make({ id: 'a', metricName: 'm_a' });
        const b = make({ id: 'b', metricName: 'm_b' });
        const c = make({
            id: 'c',
            metricName: 'm_c',
            aggregationMode: 'sum',
        });
        const result = groupImpactMetricConfigs([a, b, c], true);
        expect(result.groups).toEqual([[a, b]]);
        expect(result.singletons).toEqual([c]);
    });

    it('treats reordered label keys as the same group', () => {
        const a = make({
            id: 'a',
            metricName: 'm_a',
            labelSelectors: { env: ['prod'], region: ['eu'] },
        });
        const b = make({
            id: 'b',
            metricName: 'm_b',
            labelSelectors: { region: ['eu'], env: ['prod'] },
        });
        expect(groupImpactMetricConfigs([a, b], true).groups).toEqual([[a, b]]);
    });

    it('treats reordered label values as the same group', () => {
        const a = make({
            id: 'a',
            metricName: 'm_a',
            labelSelectors: { env: ['prod', 'stage'] },
        });
        const b = make({
            id: 'b',
            metricName: 'm_b',
            labelSelectors: { env: ['stage', 'prod'] },
        });
        expect(groupImpactMetricConfigs([a, b], true).groups).toEqual([[a, b]]);
    });

    it('groups configs that differ only in source', () => {
        const a = make({ id: 'a', metricName: 'm_a', source: 'internal' });
        const b = make({ id: 'b', metricName: 'm_b', source: 'external' });
        expect(groupImpactMetricConfigs([a, b], true).groups).toEqual([[a, b]]);
    });

    it('does NOT group configs that differ in mode', () => {
        const a = make({ id: 'a', metricName: 'm_a', mode: 'read' });
        const b = make({ id: 'b', metricName: 'm_b', mode: 'write' });
        const result = groupImpactMetricConfigs([a, b], true);
        expect(result.groups).toEqual([]);
        expect(result.singletons).toEqual([a, b]);
    });

    it('does NOT group configs that differ in aggregationMode', () => {
        const a = make({ id: 'a', metricName: 'm_a', aggregationMode: 'avg' });
        const b = make({ id: 'b', metricName: 'm_b', aggregationMode: 'p95' });
        const result = groupImpactMetricConfigs([a, b], true);
        expect(result.groups).toEqual([]);
        expect(result.singletons).toEqual([a, b]);
    });

    it('preserves first-occurrence order across groups and singletons', () => {
        const a = make({ id: 'a', metricName: 'm_a' });
        const x = make({ id: 'x', metricName: 'm_x', aggregationMode: 'sum' });
        const b = make({ id: 'b', metricName: 'm_b' });
        const result = groupImpactMetricConfigs([a, x, b], true);
        expect(result.groups).toEqual([[a, b]]);
        expect(result.singletons).toEqual([x]);
    });
});
