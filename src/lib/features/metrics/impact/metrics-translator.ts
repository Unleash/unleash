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

    private transformLabels(
        labels: Record<string, string | number>,
    ): Record<string, string | number> {
        return Object.fromEntries(
            Object.entries(labels).map(([labelKey, value]) => [
                `unleash_${this.sanitizeName(labelKey)}`,
                value,
            ]),
        );
    }

    private addOriginLabel(
        sample: NumericMetricSample,
    ): Record<string, string | number> {
        return {
            ...(sample.labels || {}),
            origin: sample.labels?.origin || 'sdk',
        };
    }

    translateMetric(
        metric: Metric,
    ): Counter<string> | Gauge<string> | BatchHistogram | null {
        const sanitizedName = this.sanitizeName(metric.name);
        const prefixedName = `unleash_${metric.type}_${sanitizedName}`;
        const existingMetric = this.registry.getSingleMetric(prefixedName);

        const allLabelNames = new Set<string>();
        allLabelNames.add('unleash_origin');
        for (const sample of metric.samples) {
            if (sample.labels) {
                Object.keys(sample.labels).forEach((label) => {
                    allLabelNames.add(`unleash_${label}`);
                });
            }
        }
        const labelNames = Array.from(allLabelNames).map((labelName) =>
            this.sanitizeName(labelName),
        );

        if (metric.type === 'counter') {
            let counter: Counter<string>;

            if (existingMetric && existingMetric instanceof Counter) {
                if (this.hasNewLabels(existingMetric, labelNames)) {
                    this.registry.removeSingleMetric(prefixedName);

                    counter = new Counter({
                        name: prefixedName,
                        help: metric.help,
                        registers: [this.registry],
                        labelNames,
                    });
                } else {
                    counter = existingMetric as Counter<string>;
                }
            } else {
                counter = new Counter({
                    name: prefixedName,
                    help: metric.help,
                    registers: [this.registry],
                    labelNames,
                });
            }

            for (const sample of metric.samples) {
                counter.inc(
                    this.transformLabels(this.addOriginLabel(sample)),
                    sample.value,
                );
            }

            return counter;
        } else if (metric.type === 'gauge') {
            let gauge: Gauge<string>;

            if (existingMetric && existingMetric instanceof Gauge) {
                if (this.hasNewLabels(existingMetric, labelNames)) {
                    this.registry.removeSingleMetric(prefixedName);

                    gauge = new Gauge({
                        name: prefixedName,
                        help: metric.help,
                        registers: [this.registry],
                        labelNames,
                    });
                } else {
                    gauge = existingMetric as Gauge<string>;
                }
            } else {
                gauge = new Gauge({
                    name: prefixedName,
                    help: metric.help,
                    registers: [this.registry],
                    labelNames,
                });
            }

            for (const sample of metric.samples) {
                gauge.set(
                    this.transformLabels(this.addOriginLabel(sample)),
                    sample.value,
                );
            }

            return gauge;
        } else if (metric.type === 'histogram') {
            if (!metric.samples || metric.samples.length === 0) {
                return null;
            }

            let histogram: BatchHistogram;

            if (existingMetric && existingMetric instanceof BatchHistogram) {
                const firstSample = metric.samples[0]; // all samples should have same buckets
                const needsRecreation =
                    !firstSample?.buckets ||
                    this.hasNewLabels(existingMetric, labelNames) ||
                    this.hasNewBuckets(existingMetric, firstSample.buckets);

                if (needsRecreation) {
                    this.registry.removeSingleMetric(prefixedName);

                    histogram = new BatchHistogram({
                        name: prefixedName,
                        help: metric.help,
                        registry: this.registry,
                        labelNames,
                    });
                } else {
                    histogram = existingMetric as BatchHistogram;
                }
            } else {
                histogram = new BatchHistogram({
                    name: prefixedName,
                    help: metric.help,
                    registry: this.registry,
                    labelNames,
                });
            }

            for (const sample of metric.samples) {
                const transformedLabels = this.transformLabels({
                    ...sample.labels,
                    origin: sample.labels?.origin || 'sdk',
                });

                histogram.recordBatch(transformedLabels, {
                    count: sample.count,
                    sum: sample.sum,
                    buckets: sample.buckets,
                });
            }

            return histogram;
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
