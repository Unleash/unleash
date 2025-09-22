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
                    { le: '+Inf', count: 10 },
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
                    { le: '+Inf', count: 5 },
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
                    { le: '+Inf', count: 3 },
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

    test('should record different labels separately and handle special characters', async () => {
        histogram.recordBatch(
            { service: 'api', url: 'http://example.com:8080/api' },
            {
                count: 3,
                sum: 1.5,
                buckets: [
                    { le: 1, count: 2 },
                    { le: '+Inf', count: 3 },
                ],
            },
        );

        histogram.recordBatch(
            { service: 'web', url: 'https://app.example.com/dashboard' },
            {
                count: 2,
                sum: 3.0,
                buckets: [
                    { le: 1, count: 1 },
                    { le: '+Inf', count: 2 },
                ],
            },
        );

        const metrics = await registry.metrics();

        expect(metrics).toMatch(
            /test_histogram_bucket{service="api",url="http:\/\/example\.com:8080\/api",le="1"} 2/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{service="api",url="http:\/\/example\.com:8080\/api",le="\+Inf"} 3/,
        );
        expect(metrics).toMatch(
            /test_histogram_sum{service="api",url="http:\/\/example\.com:8080\/api"} 1\.5/,
        );
        expect(metrics).toMatch(
            /test_histogram_count{service="api",url="http:\/\/example\.com:8080\/api"} 3/,
        );

        // Web service metrics (with HTTPS URL)
        expect(metrics).toMatch(
            /test_histogram_bucket{service="web",url="https:\/\/app\.example\.com\/dashboard",le="1"} 1/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{service="web",url="https:\/\/app\.example\.com\/dashboard",le="\+Inf"} 2/,
        );
        expect(metrics).toMatch(
            /test_histogram_sum{service="web",url="https:\/\/app\.example\.com\/dashboard"} 3/,
        );
        expect(metrics).toMatch(
            /test_histogram_count{service="web",url="https:\/\/app\.example\.com\/dashboard"} 2/,
        );
    });

    test('should handle "+Inf" string from SDK serialization', async () => {
        histogram.recordBatch(
            { client: 'sdk' },
            {
                count: 5,
                sum: 12.3,
                buckets: [
                    { le: 1, count: 3 },
                    { le: '+Inf', count: 5 }, // String instead of Infinity
                ],
            },
        );

        const metrics = await registry.metrics();

        expect(metrics).toMatch(/test_histogram_bucket{client="sdk",le="1"} 3/);
        expect(metrics).toMatch(
            /test_histogram_bucket{client="sdk",le="\+Inf"} 5/,
        );
        expect(metrics).toMatch(/test_histogram_sum{client="sdk"} 12\.3/);
        expect(metrics).toMatch(/test_histogram_count{client="sdk"} 5/);
    });

    test('should handle unsorted bucket input', async () => {
        histogram.recordBatch(
            { service: 'test' },
            {
                count: 5,
                sum: 7.5,
                buckets: [
                    { le: '+Inf', count: 5 }, // Infinity first (unsorted)
                    { le: 2.5, count: 4 }, // Out of order
                    { le: 0.5, count: 2 }, // Out of order
                    { le: 1, count: 3 }, // Out of order
                ],
            },
        );

        const metrics = await registry.metrics();

        expect(metrics).toMatch(
            /test_histogram_bucket{service="test",le="0.5"} 2/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{service="test",le="1"} 3/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{service="test",le="2.5"} 4/,
        );
        expect(metrics).toMatch(
            /test_histogram_bucket{service="test",le="\+Inf"} 5/,
        );
        expect(metrics).toMatch(/test_histogram_sum{service="test"} 7\.5/);
        expect(metrics).toMatch(/test_histogram_count{service="test"} 5/);
    });
});
