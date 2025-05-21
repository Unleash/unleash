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
    // In-memory store for custom metrics organized by metric name
    private customMetricsStore: Map<string, StoredCustomMetric[]> = new Map();

    constructor(config: IUnleashConfig) {
        this.logger = config.getLogger('custom-metrics-store');
    }

    addMetric(metric: Omit<StoredCustomMetric, 'timestamp'>): void {
        const timestamp = new Date();
        const storedMetric: StoredCustomMetric = {
            ...metric,
            timestamp,
        };

        // Get or create array for this metric name
        if (!this.customMetricsStore.has(metric.name)) {
            this.customMetricsStore.set(metric.name, []);
        }

        // Add the metric to the array for this name
        this.customMetricsStore.get(metric.name)?.push(storedMetric);
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
        const allMetrics: StoredCustomMetric[] = [];
        // Flatten the map into a single array
        for (const metricsArray of this.customMetricsStore.values()) {
            allMetrics.push(...metricsArray);
        }
        return allMetrics;
    }

    getMetricsByName(name: string): StoredCustomMetric[] {
        return this.customMetricsStore.get(name) || [];
    }

    getMetricNames(): string[] {
        return Array.from(this.customMetricsStore.keys());
    }

    getPrometheusMetrics(): string {
        // Prometheus formatted output
        let output = '';

        // Process each metric name
        for (const [metricName, metrics] of this.customMetricsStore.entries()) {
            if (metrics.length === 0) continue;

            // Add metric help and type comments
            output += `# HELP ${metricName} Custom metric reported to Unleash\n`;
            output += `# TYPE ${metricName} counter\n`;

            // Add each metric instance
            for (const metric of metrics) {
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
