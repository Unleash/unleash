import { Counter, Gauge, type Registry } from '@prometheus-io/client';
import { BatchHistogram } from './batch-histogram.js';
import { SeriesLimiter } from './series-limiter.js';
import { MAX_IMPACT_METRIC_SERIES } from './series-lru-cache.js';

export interface NumericMetricSample {
    labels?: Record<string, string | number>;
    value: number;
}

export interface BucketMetricSample {
    labels?: Record<string, string | number>;
    count: number;
    sum: number;
    buckets: Array<{ le: number | '+Inf'; count: number }>;
}

export interface NumericMetric {
    name: string;
    help: string;
    type: 'counter' | 'gauge';
    samples: NumericMetricSample[];
}

export interface BucketMetric {
    name: string;
    help: string;
    type: 'histogram';
    samples: BucketMetricSample[];
}

export type Metric = NumericMetric | BucketMetric;

const SDK_LABEL_NAMES = ['appName', 'environment'];
const LABEL_NAMES = ['origin', 'metric_type', ...SDK_LABEL_NAMES];
const ORIGINS = ['sdk', 'admin-api', 'edge'];
const MAX_LABEL_VALUE_LENGTH = 100;

export class MetricsTranslator {
    private registry: Registry;

    private seriesLimiter: SeriesLimiter;

    constructor(registry: Registry, maxSeries = MAX_IMPACT_METRIC_SERIES) {
        this.registry = registry;
        this.seriesLimiter = new SeriesLimiter(registry, maxSeries);
    }

    private trackSeries(
        name: string,
        sample: NumericMetricSample | BucketMetricSample,
        type: string,
    ): Record<string, string | number> {
        const labels = this.buildLabels(sample, type);
        this.seriesLimiter.track(name, labels);
        return labels;
    }

    sanitizeName(name: string): string {
        const regex = /[^a-zA-Z0-9_]/g;

        return name.replace(regex, '_');
    }

    private knownOrigin(origin: string | number | undefined): string {
        return ORIGINS.find((known) => known === origin) ?? 'sdk';
    }

    private buildLabels(
        sample: NumericMetricSample | BucketMetricSample,
        type: string,
    ): Record<string, string | number> {
        const result: Record<string, string | number> = {
            origin: this.knownOrigin(sample.labels?.origin),
            metric_type: type,
        };
        for (const name of SDK_LABEL_NAMES) {
            const value = sample.labels?.[name];
            if (value !== undefined) {
                result[name] = value;
            }
        }
        return result;
    }

    private withShortLabelValues<
        Sample extends NumericMetricSample | BucketMetricSample,
    >(samples: Sample[], type: string): Sample[] {
        return samples.filter((sample) =>
            Object.values(this.buildLabels(sample, type)).every(
                (value) => String(value).length <= MAX_LABEL_VALUE_LENGTH,
            ),
        );
    }

    private resolveCounter(name: string, help: string): Counter<string> {
        const existing = this.registry.getSingleMetric(name);
        if (existing instanceof Counter) {
            return existing;
        }
        return new Counter({
            name,
            help,
            registers: [this.registry],
            labelNames: LABEL_NAMES,
        });
    }

    private resolveGauge(name: string, help: string): Gauge<string> {
        const existing = this.registry.getSingleMetric(name);
        if (existing instanceof Gauge) {
            return existing;
        }
        return new Gauge({
            name,
            help,
            registers: [this.registry],
            labelNames: LABEL_NAMES,
        });
    }

    private resolveHistogram(
        name: string,
        help: string,
        buckets: BucketMetricSample['buckets'],
    ): BatchHistogram {
        const existing = this.registry.getSingleMetric(name);
        if (
            existing instanceof BatchHistogram &&
            existing.acceptsBuckets(buckets)
        ) {
            return existing;
        }
        if (existing instanceof BatchHistogram) {
            this.seriesLimiter.removeMetric(name);
        }
        return new BatchHistogram({
            name,
            help,
            registry: this.registry,
        });
    }

    translateMetric(
        metric: Metric,
    ): Counter<string> | Gauge<string> | BatchHistogram | null {
        const sanitizedName = this.sanitizeName(metric.name);
        const validName = /^[a-zA-Z_]/.test(sanitizedName);

        if (!validName) {
            return null;
        }

        if (metric.type === 'counter') {
            const samples = this.withShortLabelValues(
                metric.samples,
                metric.type,
            );
            if (samples.length === 0) {
                return null;
            }
            const counter = this.resolveCounter(sanitizedName, metric.help);
            for (const sample of samples) {
                const labels = this.trackSeries(
                    sanitizedName,
                    sample,
                    metric.type,
                );
                counter.inc(labels, sample.value);
            }

            return null;
        } else if (metric.type === 'gauge') {
            const samples = this.withShortLabelValues(
                metric.samples,
                metric.type,
            );
            if (samples.length === 0) {
                return null;
            }
            const gauge = this.resolveGauge(sanitizedName, metric.help);
            for (const sample of samples) {
                const labels = this.trackSeries(
                    sanitizedName,
                    sample,
                    metric.type,
                );
                gauge.set(labels, sample.value);
            }

            return null;
        } else if (metric.type === 'histogram') {
            const samples = this.withShortLabelValues(
                metric.samples,
                metric.type,
            );
            const [first] = samples;
            if (!first) {
                return null;
            }
            const histogram = this.resolveHistogram(
                sanitizedName,
                metric.help,
                first.buckets,
            );
            for (const sample of samples) {
                if (!histogram.acceptsBuckets(sample.buckets)) {
                    continue;
                }
                const labels = this.trackSeries(
                    sanitizedName,
                    sample,
                    metric.type,
                );
                histogram.recordBatch(labels, {
                    count: sample.count,
                    sum: sample.sum,
                    buckets: sample.buckets,
                });
            }

            return null;
        }

        return null;
    }

    translateMetrics(metrics: Metric[]): { evictedSeries: number } {
        const evictedBefore = this.seriesLimiter.evictedSeries;
        for (const metric of metrics) {
            this.translateMetric(metric);
        }

        return {
            evictedSeries: this.seriesLimiter.evictedSeries - evictedBefore,
        };
    }

    serializeMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    translateAndSerializeMetrics(metrics: Metric[]): Promise<string> {
        this.translateMetrics(metrics);
        return this.serializeMetrics();
    }
}
