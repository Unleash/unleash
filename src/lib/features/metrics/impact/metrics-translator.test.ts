import { MetricsTranslator } from './metrics-translator.js';
import { Registry } from '@prometheus-io/client';

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

    it('should translate counters, gauges, and histograms under sanitized names', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'labeled-counter',
                help: 'with labels',
                type: 'counter' as const,
                samples: [{ labels: { appName: 'web' }, value: 5 }],
            },
            {
                name: 'test.gauge',
                help: 'gauge test',
                type: 'gauge' as const,
                samples: [{ labels: { environment: 'prod' }, value: 10 }],
            },
            {
                name: 'response time',
                help: 'response time',
                type: 'histogram' as const,
                samples: [
                    {
                        labels: { appName: 'api' },
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
            'labeled_counter{origin="sdk",metric_type="counter",appName="web"} 5',
        );
        expect(result).toContain(
            'test_gauge{origin="sdk",metric_type="gauge",environment="prod"} 10',
        );
        expect(result).toContain(
            'response_time_bucket{appName="api",metric_type="histogram",origin="sdk",le="1"} 3',
        );
    });

    it('skips metrics without samples', async () => {
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
            {
                name: 'empty_counter',
                help: 'empty',
                type: 'counter' as const,
                samples: [],
            },
            {
                name: 'empty_gauge',
                help: 'empty',
                type: 'gauge' as const,
                samples: [],
            },
        ]);

        expect(result).toBe(
            [
                '# HELP test_counter test counter',
                '# TYPE test_counter counter',
                'test_counter{origin="sdk",metric_type="counter"} 1',
                '',
            ].join('\n'),
        );
    });

    it('keeps only appName, environment and origin from the labels a sender provides', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'requests',
                help: 'requests',
                type: 'counter' as const,
                samples: [
                    {
                        labels: {
                            appName: 'web',
                            environment: 'production',
                            origin: 'admin-api',
                            user: 'a'.repeat(101),
                            metric_type: 'histogram',
                        },
                        value: 1,
                    },
                ],
            },
        ]);

        expect(result).toBe(
            [
                '# HELP requests requests',
                '# TYPE requests counter',
                'requests{origin="admin-api",metric_type="counter",appName="web",environment="production"} 1',
                '',
            ].join('\n'),
        );
    });

    it('drops samples with a label value longer than 100 characters, and a metric left with no samples', async () => {
        const longestAllowed = 'a'.repeat(100);
        const tooLong = 'a'.repeat(101);

        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'requests',
                help: 'requests',
                type: 'counter' as const,
                samples: [
                    { labels: { appName: longestAllowed }, value: 1 },
                    { labels: { appName: tooLong }, value: 1 },
                ],
            },
            {
                name: 'only_too_long',
                help: 'only too long',
                type: 'counter' as const,
                samples: [{ labels: { appName: tooLong }, value: 1 }],
            },
        ]);

        expect(result).toBe(
            [
                '# HELP requests requests',
                '# TYPE requests counter',
                `requests{origin="sdk",metric_type="counter",appName="${longestAllowed}"} 1`,
                '',
            ].join('\n'),
        );
    });

    it('keeps a known origin and records any other origin as sdk', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'requests',
                help: 'requests',
                type: 'counter' as const,
                samples: [
                    { labels: { origin: 'edge' }, value: 1 },
                    { labels: { origin: 'anything-else' }, value: 1 },
                ],
            },
        ]);

        expect(result).toBe(
            [
                '# HELP requests requests',
                '# TYPE requests counter',
                'requests{origin="edge",metric_type="counter"} 1',
                'requests{origin="sdk",metric_type="counter"} 1',
                '',
            ].join('\n'),
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

    const web = { appName: 'web' };
    const ios = { appName: 'ios' };
    const android = { appName: 'android' };

    const counter = (name: string, labels: Record<string, string>) => ({
        name,
        help: name,
        type: 'counter' as const,
        samples: [{ labels, value: 1 }],
    });

    const gauge = (name: string, labels: Record<string, string>) => ({
        name,
        help: name,
        type: 'gauge' as const,
        samples: [{ labels, value: 5 }],
    });

    const histogram = (name: string, labels: Record<string, string>) => ({
        name,
        help: name,
        type: 'histogram' as const,
        samples: [
            {
                labels,
                count: 1,
                sum: 1,
                buckets: [{ le: '+Inf' as const, count: 1 }],
            },
        ],
    });

    const translatorWithRoomFor = (maxSeries: number) =>
        new MetricsTranslator(new Registry(), maxSeries);

    it('removes the series written longest ago from a counter once there are more than the limit', async () => {
        const limited = translatorWithRoomFor(2);
        limited.translateMetrics([counter('requests', web)]);
        limited.translateMetrics([counter('requests', ios)]);

        const result = await limited.translateAndSerializeMetrics([
            counter('requests', android),
        ]);

        expect(result).toBe(
            [
                '# HELP requests requests',
                '# TYPE requests counter',
                'requests{origin="sdk",metric_type="counter",appName="ios"} 1',
                'requests{origin="sdk",metric_type="counter",appName="android"} 1',
                '',
            ].join('\n'),
        );
    });

    it('removes the series written longest ago from a histogram once there are more than the limit', async () => {
        const limited = translatorWithRoomFor(2);
        limited.translateMetrics([histogram('latency', web)]);
        limited.translateMetrics([histogram('latency', ios)]);

        const result = await limited.translateAndSerializeMetrics([
            histogram('latency', android),
        ]);

        expect(result).toBe(
            [
                '# HELP latency latency',
                '# TYPE latency histogram',
                'latency_bucket{appName="ios",metric_type="histogram",origin="sdk",le="+Inf"} 1',
                'latency_sum{appName="ios",metric_type="histogram",origin="sdk"} 1',
                'latency_count{appName="ios",metric_type="histogram",origin="sdk"} 1',
                'latency_bucket{appName="android",metric_type="histogram",origin="sdk",le="+Inf"} 1',
                'latency_sum{appName="android",metric_type="histogram",origin="sdk"} 1',
                'latency_count{appName="android",metric_type="histogram",origin="sdk"} 1',
                '',
            ].join('\n'),
        );
    });

    it('removes a metric together with its last series', async () => {
        const limited = translatorWithRoomFor(1);
        limited.translateMetrics([counter('requests', web)]);

        const result = await limited.translateAndSerializeMetrics([
            gauge('memory', web),
        ]);

        expect(result).toBe(
            [
                '# HELP memory memory',
                '# TYPE memory gauge',
                'memory{origin="sdk",metric_type="gauge",appName="web"} 5',
                '',
            ].join('\n'),
        );
    });

    it('a histogram sample dropped for a too long label value does not decide the buckets', async () => {
        translator.translateMetrics([histogram('latency', web)]);
        const tooLongWithOtherBuckets = {
            labels: { appName: 'a'.repeat(101) },
            count: 1,
            sum: 1,
            buckets: [{ le: 1, count: 1 }],
        };

        const result = await translator.translateAndSerializeMetrics([
            {
                ...histogram('latency', web),
                samples: [
                    tooLongWithOtherBuckets,
                    ...histogram('latency', web).samples,
                ],
            },
        ]);

        expect(result).toBe(
            [
                '# HELP latency latency',
                '# TYPE latency histogram',
                'latency_bucket{appName="web",metric_type="histogram",origin="sdk",le="+Inf"} 2',
                'latency_sum{appName="web",metric_type="histogram",origin="sdk"} 2',
                'latency_count{appName="web",metric_type="histogram",origin="sdk"} 2',
                '',
            ].join('\n'),
        );
    });

    it('the old series of a histogram recreated with other buckets take no room in the series limit', async () => {
        const limited = translatorWithRoomFor(2);
        limited.translateMetrics([
            counter('written_first', web),
            histogram('latency', web),
        ]);
        const iosWithOtherBuckets = {
            labels: ios,
            count: 1,
            sum: 1,
            buckets: [{ le: 1, count: 1 }],
        };

        const result = await limited.translateAndSerializeMetrics([
            { ...histogram('latency', ios), samples: [iosWithOtherBuckets] },
        ]);

        expect(result).toBe(
            [
                '# HELP written_first written_first',
                '# TYPE written_first counter',
                'written_first{origin="sdk",metric_type="counter",appName="web"} 1',
                '',
                '# HELP latency latency',
                '# TYPE latency histogram',
                'latency_bucket{appName="ios",metric_type="histogram",origin="sdk",le="1"} 1',
                'latency_sum{appName="ios",metric_type="histogram",origin="sdk"} 1',
                'latency_count{appName="ios",metric_type="histogram",origin="sdk"} 1',
                '',
            ].join('\n'),
        );
    });

    it('tells how many series a request evicted', () => {
        const limited = translatorWithRoomFor(1);
        limited.translateMetrics([counter('requests', web)]);
        limited.translateMetrics([counter('requests', ios)]);

        const summary = limited.translateMetrics([
            counter('requests', android),
            gauge('memory', web),
        ]);

        expect(summary).toEqual({ evictedSeries: 2 });
    });

    it('an empty counter left by a refused negative sample is evicted like any other metric', async () => {
        const limited = translatorWithRoomFor(1);
        const refunds = {
            name: 'refunds',
            help: 'refunds',
            type: 'counter' as const,
            samples: [{ value: -1 }],
        };
        expect(() => limited.translateMetrics([refunds])).toThrow(
            'It is not possible to decrease a counter',
        );

        const result = await limited.translateAndSerializeMetrics([
            gauge('memory', web),
        ]);

        expect(result).toBe(
            [
                '# HELP memory memory',
                '# TYPE memory gauge',
                'memory{origin="sdk",metric_type="gauge",appName="web"} 5',
                '',
            ].join('\n'),
        );
    });

    it('ignores histogram samples whose buckets differ from the ones the histogram was created with', async () => {
        const result = await translator.translateAndSerializeMetrics([
            {
                name: 'latency',
                help: 'latency',
                type: 'histogram' as const,
                samples: [
                    { count: 1, sum: 1, buckets: [{ le: 1, count: 1 }] },
                    { count: 1, sum: 1, buckets: [{ le: 2, count: 1 }] },
                ],
            },
        ]);

        expect(result).toBe(
            [
                '# HELP latency latency',
                '# TYPE latency histogram',
                'latency_bucket{metric_type="histogram",origin="sdk",le="1"} 1',
                'latency_sum{metric_type="histogram",origin="sdk"} 1',
                'latency_count{metric_type="histogram",origin="sdk"} 1',
                '',
            ].join('\n'),
        );
    });
});
