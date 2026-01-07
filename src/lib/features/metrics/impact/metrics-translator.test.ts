import { MetricsTranslator } from './metrics-translator.js';
import { Registry } from 'prom-client';

describe('MetricsTranslator', () => {
    describe('Sanitize name', () => {
        let translator: MetricsTranslator;

        beforeEach(() => {
            const registry = new Registry();
            translator = new MetricsTranslator(registry);
        });

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
    it('should handle metrics with labels', async () => {
        const metrics = [
            {
                name: 'labeled_counter',
                help: 'with labels',
                type: 'counter' as const,
                samples: [
                    {
                        labels: { foo: 'bar' },
                        value: 5,
                    },
                ],
            },
            {
                name: 'test_gauge',
                help: 'gauge test',
                type: 'gauge' as const,
                samples: [
                    {
                        labels: { env: 'prod' },
                        value: 10,
                    },
                ],
            },
        ];

        const registry = new Registry();
        const translator = new MetricsTranslator(registry);
        const result = await translator.translateAndSerializeMetrics(metrics);
        expect(typeof result).toBe('string');
        expect(result).toContain(
            '# HELP unleash_counter_labeled_counter with labels',
        );
        expect(result).toContain(
            '# TYPE unleash_counter_labeled_counter counter',
        );
        expect(result).toContain(
            'unleash_counter_labeled_counter{unleash_foo="bar",unleash_origin="sdk"} 5',
        );
        expect(result).toContain(
            'unleash_gauge_test_gauge{unleash_env="prod",unleash_origin="sdk"} 10',
        );
    });

    it('should ignore unsupported metric types', async () => {
        const metrics = [
            {
                name: 'test_counter',
                help: 'test counter',
                type: 'counter' as const,
                samples: [{ value: 1 }],
            },
            {
                name: 'unsupported',
                help: 'unsupported type',
                type: 'histogram' as any,
                samples: [],
            },
            {
                name: 'test_gauge',
                help: 'gauge test',
                type: 'gauge' as const,
                samples: [{ value: 2 }],
            },
        ];

        const registry = new Registry();
        const translator = new MetricsTranslator(registry);
        const result = await translator.translateAndSerializeMetrics(metrics);
        expect(typeof result).toBe('string');
        expect(result).toContain(
            '# HELP unleash_counter_test_counter test counter',
        );
        expect(result).toContain('# TYPE unleash_counter_test_counter counter');
        expect(result).toContain('# HELP unleash_gauge_test_gauge gauge test');
        expect(result).toContain('# TYPE unleash_gauge_test_gauge gauge');
        expect(result).not.toContain('unsupported');
    });

    it('should sanitize metric names and label names', async () => {
        const registry = new Registry();
        const translator = new MetricsTranslator(registry);

        const metrics = [
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
                name: '1numeric-metric',
                help: 'metric with numeric prefix',
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
        ];

        const result = await translator.translateAndSerializeMetrics(metrics);

        expect(result).toContain(
            '# HELP unleash_counter_invalid_metric_name metric with invalid name',
        );
        expect(result).toContain(
            '# TYPE unleash_counter_invalid_metric_name counter',
        );
        expect(result).toContain(
            '# HELP unleash_gauge_1numeric_metric metric with numeric prefix',
        );
        expect(result).toContain('# TYPE unleash_gauge_1numeric_metric gauge');

        expect(result).toContain(
            'unleash_counter_invalid_metric_name{unleash_invalid_label="value",unleash_1numeric="123",unleash_origin="sdk"} 5',
        );
        expect(result).toContain(
            'unleash_gauge_1numeric_metric{unleash_invalid_colon="value",unleash_space_label="test",unleash_origin="sdk"} 10',
        );
    });

    it('should handle re-labeling of metrics', async () => {
        const registry = new Registry();
        const translator = new MetricsTranslator(registry);

        const metrics1 = [
            {
                name: 'counter_with_labels',
                help: 'counter with labels',
                type: 'counter' as const,
                samples: [
                    {
                        labels: { foo: 'bar' },
                        value: 5,
                    },
                ],
            },
            {
                name: 'gauge_with_labels',
                help: 'gauge with labels',
                type: 'gauge' as const,
                samples: [
                    {
                        labels: { env: 'prod' },
                        value: 10,
                    },
                ],
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
        ];

        const result1 = await translator.translateAndSerializeMetrics(metrics1);
        expect(result1).toContain(
            'unleash_counter_counter_with_labels{unleash_foo="bar",unleash_origin="sdk"} 5',
        );
        expect(result1).toContain(
            'unleash_gauge_gauge_with_labels{unleash_env="prod",unleash_origin="sdk"} 10',
        );
        expect(result1).toContain(
            'unleash_histogram_histogram_with_labels_count{unleash_origin="sdk",unleash_service="api"} 5',
        );

        const metrics2 = [
            {
                name: 'counter_with_labels',
                help: 'counter with labels',
                type: 'counter' as const,
                samples: [
                    {
                        labels: { foo: 'bar', baz: 'qux' }, // Added a new label
                        value: 15,
                    },
                ],
            },
            {
                name: 'gauge_with_labels',
                help: 'gauge with labels',
                type: 'gauge' as const,
                samples: [
                    {
                        labels: { env: 'prod', region: 'us-east' }, // Added a new label
                        value: 20,
                    },
                ],
            },
            {
                name: 'histogram_with_labels',
                help: 'histogram with labels',
                type: 'histogram' as const,
                buckets: [1],
                samples: [
                    {
                        labels: { service: 'api', region: 'us-east' }, // Added a new label
                        count: 3,
                        sum: 1.8,
                        buckets: [
                            { le: 1, count: 2 },
                            { le: '+Inf' as const, count: 3 },
                        ],
                    },
                ],
            },
        ];

        const result2 = await translator.translateAndSerializeMetrics(metrics2);

        expect(result2).toContain(
            'unleash_counter_counter_with_labels{unleash_foo="bar",unleash_baz="qux",unleash_origin="sdk"} 15',
        );
        expect(result2).toContain(
            'unleash_gauge_gauge_with_labels{unleash_env="prod",unleash_region="us-east",unleash_origin="sdk"} 20',
        );
        expect(result2).toContain(
            'unleash_histogram_histogram_with_labels_count{unleash_origin="sdk",unleash_region="us-east",unleash_service="api"} 3',
        );
        expect(result2).not.toContain(
            'unleash_histogram_histogram_with_labels_count{unleash_origin="sdk",unleash_service="api"} 5',
        );
    });

    it('should handle histogram bucket changes', async () => {
        const registry = new Registry();
        const translator = new MetricsTranslator(registry);

        // Initial histogram with 2 buckets
        const metrics1 = [
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
        ];

        const result1 = await translator.translateAndSerializeMetrics(metrics1);
        expect(result1).toContain(
            'unleash_histogram_test_histogram_bucket{unleash_origin="sdk",le="1"} 3',
        );
        expect(result1).toContain(
            'unleash_histogram_test_histogram_count{unleash_origin="sdk"} 5',
        );

        // Same histogram with different bucket (0.5 instead of 1)
        const metrics2 = [
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
        ];

        const result2 = await translator.translateAndSerializeMetrics(metrics2);

        expect(result2).toContain(
            'unleash_histogram_test_histogram_bucket{unleash_origin="sdk",le="0.5"} 4',
        );
        expect(result2).toContain(
            'unleash_histogram_test_histogram_count{unleash_origin="sdk"} 7',
        );

        expect(result2).not.toContain(
            'unleash_histogram_test_histogram_count{unleash_origin="sdk"} 5',
        );
    });
});
