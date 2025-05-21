import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/index.js';

// Interface for stored custom metrics
export interface StoredCustomMetric {
    name: string;
    value: number;
    labels?: Record<string, string>;
    timestamp: Date;
}

// Interface for the custom metrics store
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
    // In-memory store for custom metrics organized by metric name and minute
    private customMetricsStore: Map<string, StoredCustomMetric> = new Map();

    constructor(config: IUnleashConfig) {
        this.logger = config.getLogger('custom-metrics-store');
    }

    // Helper to round a date to the previous minute
    private roundToMinute(date: Date): Date {
        const rounded = new Date(date);
        rounded.setSeconds(0);
        rounded.setMilliseconds(0);
        return rounded;
    }

    // Generate a unique key for a metric based on name and labels
    private getMetricKey(
        metric: Omit<StoredCustomMetric, 'timestamp'>,
        timestamp: Date,
    ): string {
        const roundedTimestamp = this.roundToMinute(timestamp);
        const timeKey = roundedTimestamp.toISOString();

        // Base key includes the metric name and time
        let key = `${metric.name}:${timeKey}`;

        // If there are labels, add them to the key
        if (metric.labels && Object.keys(metric.labels).length > 0) {
            // Sort the labels to ensure consistent key generation
            const labelEntries = Object.entries(metric.labels).sort(
                ([keyA], [keyB]) => keyA.localeCompare(keyB),
            );

            // Add each label to the key
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

        // Store the metric with its unique key, overwriting any existing metric with the same key
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
        // Prometheus formatted output
        let output = '';
        const metricsByName = new Map<
            string,
            Map<string, StoredCustomMetric>
        >();

        // Group metrics by name and then by label combination
        for (const metric of this.customMetricsStore.values()) {
            // Initialize map for this metric name if it doesn't exist
            if (!metricsByName.has(metric.name)) {
                metricsByName.set(
                    metric.name,
                    new Map<string, StoredCustomMetric>(),
                );
            }

            // Generate a key for this label combination
            let labelKey = '';
            if (metric.labels && Object.keys(metric.labels).length > 0) {
                // Sort the labels to ensure consistent key generation
                const labelEntries = Object.entries(metric.labels).sort(
                    ([keyA], [keyB]) => keyA.localeCompare(keyB),
                );

                // Generate a string key for the label combination
                labelKey = labelEntries
                    .map(([key, value]) => `${key}=${value}`)
                    .join(',');
            }

            const metricsForName = metricsByName.get(metric.name)!;

            // Only keep the newest metric for this name+label combination
            // If we already have a metric with these labels, check if this one is newer
            if (
                !metricsForName.has(labelKey) ||
                metricsForName.get(labelKey)!.timestamp < metric.timestamp
            ) {
                metricsForName.set(labelKey, metric);
            }
        }

        // Process each metric name
        for (const [metricName, metricsMap] of metricsByName.entries()) {
            if (metricsMap.size === 0) continue;

            // Add metric help and type comments
            output += `# HELP ${metricName} Custom metric reported to Unleash\n`;
            output += `# TYPE ${metricName} counter\n`;

            // Add each metric instance (only the latest for each label combination)
            for (const metric of metricsMap.values()) {
                // Format labels if present
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

                // Add the metric line
                output += `${metricName}${labelStr} ${metric.value}\n`;
            }

            // Add empty line between different metrics
            output += '\n';
        }

        return output;
    }

    // Helper method to escape special characters in Prometheus label values
    private escapePrometheusString(str: string): string {
        return str
            .replace(/\\/g, '\\\\') // Escape backslashes
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/\n/g, '\\n'); // Escape newlines
    }
}
