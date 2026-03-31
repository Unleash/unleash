import { Counter, Gauge, type Registry } from 'prom-client';
import { BatchHistogram } from './batch-histogram.js';

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

export class MetricsTranslator {
    private registry: Registry;

    constructor(registry: Registry) {
        this.registry = registry;
    }

    sanitizeName(name: string): string {
        const regex = /[^a-zA-Z0-9_]/g;

        return name.replace(regex, '_');
    }

    private hasNewLabels(
        existingMetric: Counter<string> | Gauge<string> | BatchHistogram,
        newLabelNames: string[],
    ): boolean {
        const existingLabelNames = (existingMetric as any).labelNames || [];

        return newLabelNames.some(
            (label) => !existingLabelNames.includes(label),
        );
    }

    private hasNewBuckets(
        existingHistogram: BatchHistogram,
        newBuckets: Array<{ le: number | '+Inf'; count: number }>,
    ): boolean {
        const existingBoundaries = existingHistogram.bucketBoundaries;

        if (existingBoundaries.size !== newBuckets.length) {
            return true;
        }

        for (const bucket of newBuckets) {
            if (!existingBoundaries.has(bucket.le)) {
                return true;
            }
        }

        return false;
    }

    private buildLabels(
        sample: NumericMetricSample | BucketMetricSample,
        type: string,
    ): Record<string, string | number> {
        const result: Record<string, string | number> = {
            origin: sample.labels?.origin || 'sdk',
            metric_type: type,
        };
        if (sample.labels) {
            for (const [key, value] of Object.entries(sample.labels)) {
                const sanitized = this.sanitizeName(key);
                if (/^[a-zA-Z_]/.test(sanitized)) {
                    result[sanitized] = value;
                }
            }
        }
        return result;
    }

    private resolveCounter(
        name: string,
        help: string,
        labelNames: string[],
    ): Counter<string> {
        const existing = this.registry.getSingleMetric(name);

        if (existing && existing instanceof Counter) {
            if (!this.hasNewLabels(existing, labelNames)) {
                return existing as Counter<string>;
            }
            this.registry.removeSingleMetric(name);
        }

        return new Counter({
            name,
            help,
            registers: [this.registry],
            labelNames,
        });
    }

    private resolveGauge(
        name: string,
        help: string,
        labelNames: string[],
    ): Gauge<string> {
        const existing = this.registry.getSingleMetric(name);

        if (existing && existing instanceof Gauge) {
            if (!this.hasNewLabels(existing, labelNames)) {
                return existing as Gauge<string>;
            }
            this.registry.removeSingleMetric(name);
        }

        return new Gauge({
            name,
            help,
            registers: [this.registry],
            labelNames,
        });
    }

    private resolveHistogram(
        name: string,
        help: string,
        labelNames: string[],
        samples: BucketMetricSample[],
    ): BatchHistogram {
        const existing = this.registry.getSingleMetric(name);

        if (existing && existing instanceof BatchHistogram) {
            const firstSample = samples[0];
            const needsRecreation =
                !firstSample?.buckets ||
                this.hasNewLabels(existing, labelNames) ||
                this.hasNewBuckets(existing, firstSample.buckets);

            if (!needsRecreation) {
                return existing as BatchHistogram;
            }
            this.registry.removeSingleMetric(name);
        }

        return new BatchHistogram({
            name,
            help,
            registry: this.registry,
            labelNames,
        });
    }

    private collectLabelNames(metric: Metric): string[] {
        const allPlain = new Set<string>(['origin', 'metric_type']);

        for (const sample of metric.samples) {
            if (sample.labels) {
                for (const label of Object.keys(sample.labels)) {
                    allPlain.add(label);
                }
            }
        }

        return Array.from(allPlain)
            .map((l) => this.sanitizeName(l))
            .filter((l) => /^[a-zA-Z_]/.test(l));
    }

    translateMetric(
        metric: Metric,
    ): Counter<string> | Gauge<string> | BatchHistogram | null {
        const sanitizedName = this.sanitizeName(metric.name);
        const validName = /^[a-zA-Z_]/.test(sanitizedName);
        const labelNames = this.collectLabelNames(metric);

        if (!validName) {
            return null;
        }

        if (metric.type === 'counter') {
            const counter = this.resolveCounter(
                sanitizedName,
                metric.help,
                labelNames,
            );
            for (const sample of metric.samples) {
                counter.inc(
                    this.buildLabels(sample, metric.type),
                    sample.value,
                );
            }

            return null;
        } else if (metric.type === 'gauge') {
            const gauge = this.resolveGauge(
                sanitizedName,
                metric.help,
                labelNames,
            );
            for (const sample of metric.samples) {
                gauge.set(this.buildLabels(sample, metric.type), sample.value);
            }

            return null;
        } else if (metric.type === 'histogram') {
            if (!metric.samples || metric.samples.length === 0) {
                return null;
            }

            const histogram = this.resolveHistogram(
                sanitizedName,
                metric.help,
                labelNames,
                metric.samples,
            );
            for (const sample of metric.samples) {
                histogram.recordBatch(this.buildLabels(sample, metric.type), {
                    count: sample.count,
                    sum: sample.sum,
                    buckets: sample.buckets,
                });
            }

            return null;
        }

        return null;
    }

    translateMetrics(metrics: Metric[]): Registry {
        for (const metric of metrics) {
            this.translateMetric(metric);
        }

        return this.registry;
    }

    serializeMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    translateAndSerializeMetrics(metrics: Metric[]): Promise<string> {
        this.translateMetrics(metrics);
        return this.serializeMetrics();
    }
}
