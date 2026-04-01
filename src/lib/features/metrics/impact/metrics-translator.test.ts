import { MetricsTranslator } from './metrics-translator.js';
import { Registry } from 'prom-client';

describe('MetricsTranslator', () => {
    let translator: MetricsTranslator;

    beforeEach(() => {
        translator = new MetricsTranslator(new Registry());
    });

    describe('sanitizeName', () => {
        it('should not modify valid names', () => {
            expect(translator.sanitizeName('valid_name')).toBe('valid_name');
            expect(translator.sanitizeName('validName')).toBe('validName');
            expect(translator.sanitizeName('_valid_name')).toBe('_valid_name');
        });

        it('should replace invalid characters with underscores', () => {
            expect(translator.sanitizeName('invalid-name')).toBe(
                'invalid_name',
            );
            expect(translator.sanitizeName('invalid.name')).toBe(
                'invalid_name',
            );
            expect(translator.sanitizeName('invalid@name')).toBe(
                'invalid_name',
            );
            expect(translator.sanitizeName('invalid name')).toBe(
                'invalid_name',
            );
            expect(translator.sanitizeName('invalid:name')).toBe(
                'invalid_name',
            );
        });
    });

    it('should translate counters, gauges, and histograms', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'labeled_counter',
                help: 'with labels',
                type: 'counter' as const,
                samples: [{ labels: { foo: 'bar' }, value: 5 }],
            },
            {
                name: 'test_gauge',
                help: 'gauge test',
                type: 'gauge' as const,
                samples: [{ labels: { env: 'prod' }, value: 10 }],
            },
            {
                name: 'response_time',
                help: 'response time',
                type: 'histogram' as const,
                samples: [
                    {
                        labels: { service: 'api' },
                        count: 5,
                        sum: 2.5,
                        buckets: [
                            { le: 1, count: 3 },
                            { le: '+Inf' as const, count: 5 },
                        ],
                    },
                ],
            },
        ]);

        expect(result).toContain(
            'labeled_counter{origin="sdk",metric_type="counter",foo="bar"} 5',
        );
        expect(result).toContain(
            'test_gauge{origin="sdk",metric_type="gauge",env="prod"} 10',
        );
        expect(result).toContain(
            'response_time_bucket{metric_type="histogram",origin="sdk",service="api",le="1"} 3',
        );
    });

    it('should skip histograms with empty samples', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'test_counter',
                help: 'test counter',
                type: 'counter' as const,
                samples: [{ value: 1 }],
            },
            {
                name: 'empty_histogram',
                help: 'empty',
                type: 'histogram' as const,
                samples: [],
            },
        ]);

        expect(result).toContain('# HELP test_counter test counter');
        expect(result).not.toContain('empty_histogram');
    });

    it('should sanitize metric names and label names', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'invalid-metric-name',
                help: 'metric with invalid name',
                type: 'counter' as const,
                samples: [
                    {
                        labels: { 'invalid-label': 'value', '1numeric': 123 },
                        value: 5,
                    },
                ],
            },
            {
                name: '_valid_metric',
                help: 'metric with valid prefix',
                type: 'gauge' as const,
                samples: [
                    {
                        labels: {
                            'invalid:colon': 'value',
                            'space label': 'test',
                        },
                        value: 10,
                    },
                ],
            },
        ]);

        expect(result).toContain('# HELP invalid_metric_name');
        expect(result).toContain(
            'invalid_metric_name{origin="sdk",metric_type="counter",invalid_label="value"} 5',
        );
        expect(result).toContain(
            '_valid_metric{origin="sdk",metric_type="gauge",invalid_colon="value",space_label="test"} 10',
        );
    });

    it('should handle re-labeling of metrics', async () => {
        await translator.translateAndSerializeMetrics([
            {
                name: 'counter_with_labels',
                help: 'counter with labels',
                type: 'counter' as const,
                samples: [{ labels: { foo: 'bar' }, value: 5 }],
            },
            {
                name: 'gauge_with_labels',
                help: 'gauge with labels',
                type: 'gauge' as const,
                samples: [{ labels: { env: 'prod' }, value: 10 }],
            },
            {
                name: 'histogram_with_labels',
                help: 'histogram with labels',
                type: 'histogram' as const,
                samples: [
                    {
                        labels: { service: 'api' },
                        count: 5,
                        sum: 2.5,
                        buckets: [
                            { le: 1, count: 3 },
                            { le: '+Inf' as const, count: 5 },
                        ],
                    },
                ],
            },
        ]);

        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'counter_with_labels',
                help: 'counter with labels',
                type: 'counter' as const,
                samples: [{ labels: { foo: 'bar', baz: 'qux' }, value: 15 }],
            },
            {
                name: 'gauge_with_labels',
                help: 'gauge with labels',
                type: 'gauge' as const,
                samples: [
                    { labels: { env: 'prod', region: 'us-east' }, value: 20 },
                ],
            },
            {
                name: 'histogram_with_labels',
                help: 'histogram with labels',
                type: 'histogram' as const,
                samples: [
                    {
                        labels: { service: 'api', region: 'us-east' },
                        count: 3,
                        sum: 1.8,
                        buckets: [
                            { le: 1, count: 2 },
                            { le: '+Inf' as const, count: 3 },
                        ],
                    },
                ],
            },
        ]);

        expect(result).toContain(
            'counter_with_labels{origin="sdk",metric_type="counter",foo="bar",baz="qux"} 15',
        );
        expect(result).toContain(
            'gauge_with_labels{origin="sdk",metric_type="gauge",env="prod",region="us-east"} 20',
        );
        expect(result).toContain(
            'histogram_with_labels_count{metric_type="histogram",origin="sdk",region="us-east",service="api"} 3',
        );
        expect(result).not.toContain(
            'histogram_with_labels_count{metric_type="histogram",origin="sdk",service="api"} 5',
        );
    });

    it('should handle histogram bucket changes', async () => {
        await translator.translateAndSerializeMetrics([
            {
                name: 'test_histogram',
                help: 'test histogram',
                type: 'histogram' as const,
                samples: [
                    {
                        count: 5,
                        sum: 2.5,
                        buckets: [
                            { le: 1, count: 3 },
                            { le: '+Inf' as const, count: 5 },
                        ],
                    },
                ],
            },
        ]);

        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'test_histogram',
                help: 'test histogram',
                type: 'histogram' as const,
                samples: [
                    {
                        count: 7,
                        sum: 3.5,
                        buckets: [
                            { le: 0.5, count: 4 }, // Different bucket boundary
                            { le: '+Inf' as const, count: 7 },
                        ],
                    },
                ],
            },
        ]);

        expect(result).toContain(
            'test_histogram_bucket{metric_type="histogram",origin="sdk",le="0.5"} 4',
        );
        expect(result).toContain(
            'test_histogram_count{metric_type="histogram",origin="sdk"} 7',
        );
        expect(result).not.toContain(
            'test_histogram_count{metric_type="histogram",origin="sdk"} 5',
        );
    });

    it('should skip metrics with names starting with a number', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: '1numeric-metric',
                help: 'metric with numeric prefix',
                type: 'gauge' as const,
                samples: [{ value: 10 }],
            },
        ]);

        expect(result).not.toContain('1numeric');
    });
});
