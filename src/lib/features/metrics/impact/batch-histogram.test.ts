import { Registry } from 'prom-client';
import { BatchHistogram } from './batch-histogram.js';

describe('BatchHistogram', () => {
    let registry: Registry;
    let histogram: BatchHistogram;

    beforeEach(() => {
        registry = new Registry();
        histogram = new BatchHistogram({
            name: 'test_histogram',
            help: 'Test histogram',
            registry: registry,
        });
    });

    test('should record batch data and preserve bucket distribution', async () => {
        histogram.recordBatch(
            { label1: 'value1' },
            {
                count: 10,
                sum: 15.5,
                buckets: [
                    { le: 0.1, count: 2 },
                    { le: 0.5, count: 5 },
                    { le: 1, count: 7 },
                    { le: 2.5, count: 9 },
                    { le: 5, count: 10 },
                    { le: Number.POSITIVE_INFINITY, count: 10 },
                ],
            },
        );

        const metrics = await registry.metrics();

        expect(metrics).toContain('# HELP test_histogram Test histogram');
        expect(metrics).toContain('# TYPE test_histogram histogram');

        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="0.1"} 2/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="0.5"} 5/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="1"} 7/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="2.5"} 9/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="5"} 10/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="\+Inf"} 10/,
        );

        expect(metrics).toMatch(/test_histogram_sum{label1="value1"} 15\.5/);
        expect(metrics).toMatch(/test_histogram_count{label1="value1"} 10/);
    });

    test('should aggregate multiple batches correctly', async () => {
        histogram.recordBatch(
            { label1: 'value1' },
            {
                count: 5,
                sum: 7.5,
                buckets: [
                    { le: 0.1, count: 1 },
                    { le: 0.5, count: 3 },
                    { le: 1, count: 4 },
                    { le: 2.5, count: 5 },
                    { le: 5, count: 5 },
                    { le: Number.POSITIVE_INFINITY, count: 5 },
                ],
            },
        );

        histogram.recordBatch(
            { label1: 'value1' },
            {
                count: 3,
                sum: 4.2,
                buckets: [
                    { le: 0.1, count: 0 },
                    { le: 0.5, count: 1 },
                    { le: 1, count: 2 },
                    { le: 2.5, count: 3 },
                    { le: 5, count: 3 },
                    { le: Number.POSITIVE_INFINITY, count: 3 },
                ],
            },
        );

        const metrics = await registry.metrics();

        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="0.1"} 1/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="0.5"} 4/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="1"} 6/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="2.5"} 8/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="5"} 8/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{label1="value1",le="\+Inf"} 8/,
        );

        expect(metrics).toMatch(/test_histogram_sum{label1="value1"} 11\.7/);
        expect(metrics).toMatch(/test_histogram_count{label1="value1"} 8/);
    });

    test('should record different labels separately', async () => {
        histogram.recordBatch(
            { service: 'api', app: 'my_app' },
            {
                count: 3,
                sum: 1.5,
                buckets: [
                    { le: 1, count: 2 },
                    { le: Number.POSITIVE_INFINITY, count: 3 },
                ],
            },
        );

        histogram.recordBatch(
            { service: 'web', app: 'my_app' },
            {
                count: 2,
                sum: 3.0,
                buckets: [
                    { le: 1, count: 1 },
                    { le: Number.POSITIVE_INFINITY, count: 2 },
                ],
            },
        );

        const metrics = await registry.metrics();

        expect(metrics).toMatch(
            /test_histogram_bucket{app="my_app",service="api",le="1"} 2/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{app="my_app",service="api",le="\+Inf"} 3/,
        );
        expect(metrics).toMatch(
            /test_histogram_sum{app="my_app",service="api"} 1\.5/,
        );
        expect(metrics).toMatch(
            /test_histogram_count{app="my_app",service="api"} 3/,
        );

        expect(metrics).toMatch(
            /test_histogram_bucket{app="my_app",service="web",le="1"} 1/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{app="my_app",service="web",le="\+Inf"} 2/,
        );
        expect(metrics).toMatch(
            /test_histogram_sum{app="my_app",service="web"} 3/,
        );
        expect(metrics).toMatch(
            /test_histogram_count{app="my_app",service="web"} 2/,
        );
    });
});
