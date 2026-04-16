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
    it('returns an empty array for empty input', () => {
        expect(groupImpactMetricConfigs([], true)).toEqual([]);
    });

    it('returns every config as its own bucket when disabled', () => {
        const a = make({ id: 'a' });
        const b = make({ id: 'b' });
        const c = make({ id: 'c' });
        expect(groupImpactMetricConfigs([a, b, c], false)).toEqual([
            [a],
            [b],
            [c],
        ]);
    });

    it('groups two configs that differ only in metric name', () => {
        const a = make({ id: 'a', metricName: 'unleash_counter_a' });
        const b = make({ id: 'b', metricName: 'unleash_counter_b' });
        expect(groupImpactMetricConfigs([a, b], true)).toEqual([[a, b]]);
    });

    it('keeps unmatched configs as singleton buckets', () => {
        const a = make({ id: 'a', metricName: 'm_a' });
        const b = make({ id: 'b', metricName: 'm_b' });
        const c = make({
            id: 'c',
            metricName: 'm_c',
            aggregationMode: 'sum',
        });
        expect(groupImpactMetricConfigs([a, b, c], true)).toEqual([
            [a, b],
            [c],
        ]);
    });

    it('treats reordered label keys as the same bucket', () => {
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
        expect(groupImpactMetricConfigs([a, b], true)).toEqual([[a, b]]);
    });

    it('treats reordered label values as the same bucket', () => {
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
        expect(groupImpactMetricConfigs([a, b], true)).toEqual([[a, b]]);
    });

    it('groups configs that differ only in source', () => {
        const a = make({ id: 'a', metricName: 'm_a', source: 'internal' });
        const b = make({ id: 'b', metricName: 'm_b', source: 'external' });
        expect(groupImpactMetricConfigs([a, b], true)).toEqual([[a, b]]);
    });

    it('does NOT group configs that differ in mode', () => {
        const a = make({ id: 'a', metricName: 'm_a', mode: 'read' });
        const b = make({ id: 'b', metricName: 'm_b', mode: 'write' });
        expect(groupImpactMetricConfigs([a, b], true)).toEqual([[a], [b]]);
    });

    it('does NOT group configs that differ in aggregationMode', () => {
        const a = make({ id: 'a', metricName: 'm_a', aggregationMode: 'avg' });
        const b = make({ id: 'b', metricName: 'm_b', aggregationMode: 'p95' });
        expect(groupImpactMetricConfigs([a, b], true)).toEqual([[a], [b]]);
    });

    it('orders buckets by the first-occurrence of their head', () => {
        const a = make({ id: 'a', metricName: 'm_a' });
        const x = make({ id: 'x', metricName: 'm_x', aggregationMode: 'sum' });
        const b = make({ id: 'b', metricName: 'm_b' });
        // a heads bucket-1 at index 0, x heads bucket-2 at index 1,
        // b joins bucket-1. Expected order: [bucket-1, bucket-2].
        expect(groupImpactMetricConfigs([a, x, b], true)).toEqual([
            [a, b],
            [x],
        ]);
    });
});
