import { translateAndSerializeMetrics } from './translate-metrics.js';
import { Registry } from 'prom-client';

describe('translate-metrics', () => {
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
        const result = await translateAndSerializeMetrics(metrics, registry);
        expect(typeof result).toBe('string');
        expect(result).toContain('# HELP labeled_counter with labels');
        expect(result).toContain('# TYPE labeled_counter counter');
        expect(result).toContain('labeled_counter{foo="bar"} 5');
        expect(result).toContain('test_gauge{env="prod"} 10');
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
        const result = await translateAndSerializeMetrics(metrics, registry);
        expect(typeof result).toBe('string');
        expect(result).toContain('# HELP test_counter test counter');
        expect(result).toContain('# TYPE test_counter counter');
        expect(result).toContain('# HELP test_gauge gauge test');
        expect(result).toContain('# TYPE test_gauge gauge');
        expect(result).not.toContain('unsupported');
    });

    it('should handle re-labeling of metrics', async () => {
        const registry = new Registry();

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

        const result1 = await translateAndSerializeMetrics(metrics1, registry);
        expect(result1).toContain('counter_with_labels{foo="bar"} 5');
        expect(result1).toContain('gauge_with_labels{env="prod"} 10');

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

        const result2 = await translateAndSerializeMetrics(metrics2, registry);

        expect(result2).toContain(
            'counter_with_labels{foo="bar",baz="qux"} 15',
        );
        expect(result2).toContain(
            'gauge_with_labels{env="prod",region="us-east"} 20',
        );
    });
});
