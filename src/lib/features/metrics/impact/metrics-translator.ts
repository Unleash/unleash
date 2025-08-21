import { Counter, Gauge, type Registry } from 'prom-client';

export interface MetricSample {
    labels?: Record<string, string | number>;
    value: number;
}

export interface Metric {
    name: string;
    help: string;
    type: 'counter' | 'gauge';
    samples: MetricSample[];
}

export class MetricsTranslator {
    private registry: Registry;

    constructor(registry: Registry) {
        this.registry = registry;
    }

    sanitizeName(name: string): string {
        const regex = /[^a-zA-Z0-9_]/g;

        const sanitized = name.replace(regex, '_');

        return sanitized;
    }

    private hasNewLabels(
        existingMetric: Counter<string> | Gauge<string>,
        newLabelNames: string[],
    ): boolean {
        const existingLabelNames = (existingMetric as any).labelNames || [];

        return newLabelNames.some(
            (label) => !existingLabelNames.includes(label),
        );
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
        sample: MetricSample,
    ): Record<string, string | number> {
        return {
            ...(sample.labels || {}),
            origin: sample.labels?.origin || 'sdk',
        };
    }

    translateMetric(metric: Metric): Counter<string> | Gauge<string> | null {
        const sanitizedName = this.sanitizeName(metric.name);
        const prefixedName = `unleash_${metric.type}_${sanitizedName}`;
        const existingMetric = this.registry.getSingleMetric(prefixedName);

        const allLabelNames = new Set<string>();
        allLabelNames.add('unleash_origin');
        for (const sample of metric.samples) {
            if (sample.labels) {
                Object.keys(sample.labels).forEach((label) =>
                    allLabelNames.add(`unleash_${label}`),
                );
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
