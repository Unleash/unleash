import { MetricsTranslator } from './metrics-translator.js';
import { Registry } from 'prom-client';

describe('MetricsTranslator', () => {
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
        ];

        const result1 = await translator.translateAndSerializeMetrics(metrics1);
        expect(result1).toContain(
            'unleash_counter_counter_with_labels{unleash_foo="bar",unleash_origin="sdk"} 5',
        );
        expect(result1).toContain(
            'unleash_gauge_gauge_with_labels{unleash_env="prod",unleash_origin="sdk"} 10',
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
        ];

        const result2 = await translator.translateAndSerializeMetrics(metrics2);

        expect(result2).toContain(
            'unleash_counter_counter_with_labels{unleash_foo="bar",unleash_baz="qux",unleash_origin="sdk"} 15',
        );
        expect(result2).toContain(
            'unleash_gauge_gauge_with_labels{unleash_env="prod",unleash_region="us-east",unleash_origin="sdk"} 20',
        );
    });
});
