import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/index.js';

export interface StoredCustomMetric {
    name: string;
    value: number;
    labels?: Record<string, string>;
    timestamp: Date;
}

export interface ICustomMetricsStore {
    addMetric(metric: Omit<StoredCustomMetric, 'timestamp'>): void;
    addMetrics(metrics: Omit<StoredCustomMetric, 'timestamp'>[]): void;
    getMetrics(): StoredCustomMetric[];
    getMetricsByName(name: string): StoredCustomMetric[];
    getMetricNames(): string[];
    getPrometheusMetrics(): string;
}

export class CustomMetricsStore implements ICustomMetricsStore {
    private logger: Logger;
    private customMetricsStore: Map<string, StoredCustomMetric> = new Map();

    constructor(config: IUnleashConfig) {
        this.logger = config.getLogger('custom-metrics-store');
    }

    private roundToMinute(date: Date): Date {
        const rounded = new Date(date);
        rounded.setSeconds(0);
        rounded.setMilliseconds(0);
        return rounded;
    }

    private getMetricKey(
        metric: Omit<StoredCustomMetric, 'timestamp'>,
        timestamp: Date,
    ): string {
        const roundedTimestamp = this.roundToMinute(timestamp);
        const timeKey = roundedTimestamp.toISOString();

        let key = `${metric.name}:${timeKey}`;

        if (metric.labels && Object.keys(metric.labels).length > 0) {
            const labelEntries = Object.entries(metric.labels).sort(
                ([keyA], [keyB]) => keyA.localeCompare(keyB),
            );

            const labelString = labelEntries
                .map(([key, value]) => `${key}=${value}`)
                .join(',');

            key += `:${labelString}`;
        }

        return key;
    }

    addMetric(metric: Omit<StoredCustomMetric, 'timestamp'>): void {
        const now = new Date();
        const roundedTimestamp = this.roundToMinute(now);
        const metricKey = this.getMetricKey(metric, now);

        const storedMetric: StoredCustomMetric = {
            ...metric,
            timestamp: roundedTimestamp,
        };

        this.customMetricsStore.set(metricKey, storedMetric);
    }

    addMetrics(metrics: Omit<StoredCustomMetric, 'timestamp'>[]): void {
        let storedCount = 0;
        metrics.forEach((metric) => {
            this.addMetric(metric);
            storedCount++;
        });
        this.logger.debug(`Stored ${storedCount} custom metrics`);
    }

    getMetrics(): StoredCustomMetric[] {
        return Array.from(this.customMetricsStore.values());
    }

    getMetricsByName(name: string): StoredCustomMetric[] {
        return Array.from(this.customMetricsStore.values()).filter(
            (metric) => metric.name === name,
        );
    }

    getMetricNames(): string[] {
        const names = new Set<string>();
        for (const metric of this.customMetricsStore.values()) {
            names.add(metric.name);
        }
        return Array.from(names);
    }

    getPrometheusMetrics(): string {
        let output = '';
        const metricsByName = new Map<
            string,
            Map<string, StoredCustomMetric>
        >();

        for (const metric of this.customMetricsStore.values()) {
            if (!metricsByName.has(metric.name)) {
                metricsByName.set(
                    metric.name,
                    new Map<string, StoredCustomMetric>(),
                );
            }

            let labelKey = '';
            if (metric.labels && Object.keys(metric.labels).length > 0) {
                const labelEntries = Object.entries(metric.labels).sort(
                    ([keyA], [keyB]) => keyA.localeCompare(keyB),
                );

                labelKey = labelEntries
                    .map(([key, value]) => `${key}=${value}`)
                    .join(',');
            }

            const metricsForName = metricsByName.get(metric.name)!;

            if (
                !metricsForName.has(labelKey) ||
                metricsForName.get(labelKey)!.timestamp < metric.timestamp
            ) {
                metricsForName.set(labelKey, metric);
            }
        }

        for (const [metricName, metricsMap] of metricsByName.entries()) {
            if (metricsMap.size === 0) continue;

            output += `# HELP ${metricName} Custom metric reported to Unleash\n`;
            output += `# TYPE ${metricName} counter\n`;

            for (const metric of metricsMap.values()) {
                let labelStr = '';
                if (metric.labels && Object.keys(metric.labels).length > 0) {
                    const labelParts = Object.entries(metric.labels)
                        .map(
                            ([key, value]) =>
                                `${key}="${this.escapePrometheusString(value)}"`,
                        )
                        .join(',');
                    labelStr = `{${labelParts}}`;
                }

                output += `${metricName}${labelStr} ${metric.value}\n`;
            }

            output += '\n';
        }

        return output;
    }

    private escapePrometheusString(str: string): string {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n');
    }
}
