import { Counter, Gauge, type Registry } from 'prom-client';
import { BatchHistogram } from './batch-histogram.js';
import type { IFlagResolver } from '../../../types/experimental.js';

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
    private flagResolver: Pick<IFlagResolver, 'isEnabled'>;

    constructor(
        registry: Registry,
        flagResolver: Pick<IFlagResolver, 'isEnabled'>,
    ) {
        this.registry = registry;
        this.flagResolver = flagResolver;
    }

    private isPlainMetricsEnabled(): boolean {
        return this.flagResolver.isEnabled('externalPrometheusImpactMetrics');
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

    private prefixedLabels(
        sample: NumericMetricSample | BucketMetricSample,
    ): Record<string, string | number> {
        return this.transformLabels({
            ...(sample.labels || {}),
            origin: sample.labels?.origin || 'sdk',
        });
    }

    private plainLabels(
        sample: NumericMetricSample | BucketMetricSample,
        type: string,
    ): Record<string, string | number> {
        const result: Record<string, string | number> = {
            origin: sample.labels?.origin || 'sdk',
            type,
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

    private collectLabelNames(metric: Metric): {
        prefixedLabelNames: string[];
        plainLabelNames: string[];
    } {
        const allPrefixed = new Set<string>(['unleash_origin']);
        const allPlain = new Set<string>(['origin', 'type']);

        for (const sample of metric.samples) {
            if (sample.labels) {
                for (const label of Object.keys(sample.labels)) {
                    allPrefixed.add(`unleash_${label}`);
                    allPlain.add(label);
                }
            }
        }

        const prefixedLabelNames = Array.from(allPrefixed).map((l) =>
            this.sanitizeName(l),
        );
        const plainLabelNames = Array.from(allPlain)
            .map((l) => this.sanitizeName(l))
            .filter((l) => /^[a-zA-Z_]/.test(l));

        return { prefixedLabelNames, plainLabelNames };
    }

    translateMetric(
        metric: Metric,
    ): Counter<string> | Gauge<string> | BatchHistogram | null {
        const sanitizedName = this.sanitizeName(metric.name);
        const prefixedName = `unleash_${metric.type}_${sanitizedName}`;
        const plainValid = /^[a-zA-Z_]/.test(sanitizedName);
        const { prefixedLabelNames, plainLabelNames } =
            this.collectLabelNames(metric);

        if (metric.type === 'counter') {
            const counter = this.resolveCounter(
                prefixedName,
                metric.help,
                prefixedLabelNames,
            );

            for (const sample of metric.samples) {
                counter.inc(this.prefixedLabels(sample), sample.value);
            }

            if (this.isPlainMetricsEnabled() && plainValid) {
                const plainCounter = this.resolveCounter(
                    sanitizedName,
                    metric.help,
                    plainLabelNames,
                );
                for (const sample of metric.samples) {
                    plainCounter.inc(
                        this.plainLabels(sample, metric.type),
                        sample.value,
                    );
                }
            }

            return counter;
        } else if (metric.type === 'gauge') {
            const gauge = this.resolveGauge(
                prefixedName,
                metric.help,
                prefixedLabelNames,
            );

            for (const sample of metric.samples) {
                gauge.set(this.prefixedLabels(sample), sample.value);
            }

            if (this.isPlainMetricsEnabled() && plainValid) {
                const plainGauge = this.resolveGauge(
                    sanitizedName,
                    metric.help,
                    plainLabelNames,
                );
                for (const sample of metric.samples) {
                    plainGauge.set(
                        this.plainLabels(sample, metric.type),
                        sample.value,
                    );
                }
            }

            return gauge;
        } else if (metric.type === 'histogram') {
            if (!metric.samples || metric.samples.length === 0) {
                return null;
            }

            const histogram = this.resolveHistogram(
                prefixedName,
                metric.help,
                prefixedLabelNames,
                metric.samples,
            );

            for (const sample of metric.samples) {
                histogram.recordBatch(this.prefixedLabels(sample), {
                    count: sample.count,
                    sum: sample.sum,
                    buckets: sample.buckets,
                });
            }

            if (this.isPlainMetricsEnabled() && plainValid) {
                const plainHistogram = this.resolveHistogram(
                    sanitizedName,
                    metric.help,
                    plainLabelNames,
                    metric.samples,
                );
                for (const sample of metric.samples) {
                    plainHistogram.recordBatch(
                        this.plainLabels(sample, metric.type),
                        {
                            count: sample.count,
                            sum: sample.sum,
                            buckets: sample.buckets,
                        },
                    );
                }
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
