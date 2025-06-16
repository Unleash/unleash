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

function hasNewLabels(
    existingMetric: Counter<string> | Gauge<string>,
    newLabelNames: string[],
): boolean {
    const existingLabelNames = (existingMetric as any).labelNames || [];

    return newLabelNames.some((label) => !existingLabelNames.includes(label));
}

export function translateMetric(
    metric: Metric,
    registry: Registry,
): Counter<string> | Gauge<string> | null {
    const existingMetric = registry.getSingleMetric(metric.name);

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
            if (hasNewLabels(existingMetric, labelNames)) {
                registry.removeSingleMetric(metric.name);

                counter = new Counter({
                    name: metric.name,
                    help: metric.help,
                    registers: [registry],
                    labelNames,
                });
            } else {
                counter = existingMetric as Counter<string>;
            }
        } else {
            counter = new Counter({
                name: metric.name,
                help: metric.help,
                registers: [registry],
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
            if (hasNewLabels(existingMetric, labelNames)) {
                registry.removeSingleMetric(metric.name);

                gauge = new Gauge({
                    name: metric.name,
                    help: metric.help,
                    registers: [registry],
                    labelNames,
                });
            } else {
                gauge = existingMetric as Gauge<string>;
            }
        } else {
            gauge = new Gauge({
                name: metric.name,
                help: metric.help,
                registers: [registry],
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

export function translateMetrics(registry: Registry) {
    return (metrics: Metric[]): Registry => {
        for (const metric of metrics) {
            translateMetric(metric, registry);
        }

        return registry;
    };
}

export async function serializeMetrics(registry: Registry): Promise<string> {
    return await registry.metrics();
}

export async function translateAndSerializeMetrics(
    metrics: Metric[],
    registry: Registry,
): Promise<string> {
    const translatedRegistry = translateMetrics(registry)(metrics);
    return await serializeMetrics(translatedRegistry);
}
