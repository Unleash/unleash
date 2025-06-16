import { Counter, Gauge, type Registry } from 'prom-client';

interface MetricSample {
    labels?: Record<string, string | number>;
    value: number;
}

interface Metric {
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

    private hasNewLabels(
        existingMetric: Counter<string> | Gauge<string>,
        newLabelNames: string[],
    ): boolean {
        const existingLabelNames = (existingMetric as any).labelNames || [];

        return newLabelNames.some(
            (label) => !existingLabelNames.includes(label),
        );
    }

    translateMetric(metric: Metric): Counter<string> | Gauge<string> | null {
        const existingMetric = this.registry.getSingleMetric(metric.name);

        const allLabelNames = new Set<string>();
        for (const sample of metric.samples) {
            if (sample.labels) {
                Object.keys(sample.labels).forEach((label) =>
                    allLabelNames.add(label),
                );
            }
        }
        const labelNames = Array.from(allLabelNames);

        if (metric.type === 'counter') {
            let counter: Counter<string>;

            if (existingMetric && existingMetric instanceof Counter) {
                if (this.hasNewLabels(existingMetric, labelNames)) {
                    this.registry.removeSingleMetric(metric.name);

                    counter = new Counter({
                        name: metric.name,
                        help: metric.help,
                        registers: [this.registry],
                        labelNames,
                    });
                } else {
                    counter = existingMetric as Counter<string>;
                }
            } else {
                counter = new Counter({
                    name: metric.name,
                    help: metric.help,
                    registers: [this.registry],
                    labelNames,
                });
            }

            for (const sample of metric.samples) {
                if (sample.labels) {
                    counter.inc(sample.labels, sample.value);
                } else {
                    counter.inc(sample.value);
                }
            }

            return counter;
        } else if (metric.type === 'gauge') {
            let gauge: Gauge<string>;

            if (existingMetric && existingMetric instanceof Gauge) {
                if (this.hasNewLabels(existingMetric, labelNames)) {
                    this.registry.removeSingleMetric(metric.name);

                    gauge = new Gauge({
                        name: metric.name,
                        help: metric.help,
                        registers: [this.registry],
                        labelNames,
                    });
                } else {
                    gauge = existingMetric as Gauge<string>;
                }
            } else {
                gauge = new Gauge({
                    name: metric.name,
                    help: metric.help,
                    registers: [this.registry],
                    labelNames,
                });
            }

            for (const sample of metric.samples) {
                if (sample.labels) {
                    gauge.set(sample.labels, sample.value);
                } else {
                    gauge.set(sample.value);
                }
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
