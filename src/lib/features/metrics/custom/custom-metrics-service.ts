import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/index.js';
import {
    CustomMetricsStore,
    type ICustomMetricsStore,
    type StoredCustomMetric,
} from './custom-metrics-store.js';

export class CustomMetricsService {
    private logger: Logger;
    private store: ICustomMetricsStore;

    constructor(config: IUnleashConfig) {
        this.logger = config.getLogger('custom-metrics-service');
        this.store = new CustomMetricsStore(config);
    }

    /**
     * Add a single metric to the store
     */
    addMetric(metric: Omit<StoredCustomMetric, 'timestamp'>): void {
        this.store.addMetric(metric);
    }

    /**
     * Add multiple metrics to the store
     */
    addMetrics(metrics: Omit<StoredCustomMetric, 'timestamp'>[]): void {
        this.store.addMetrics(metrics);
    }

    /**
     * Get all metrics from the store
     */
    getMetrics(): StoredCustomMetric[] {
        return this.store.getMetrics();
    }

    /**
     * Get names of all metrics in the store
     */
    getMetricNames(): string[] {
        return this.store.getMetricNames();
    }

    /**
     * Get metrics formatted for Prometheus
     */
    getPrometheusMetrics(): string {
        return this.store.getPrometheusMetrics();
    }

    /**
     * Clear all metrics (intended for testing purposes)
     */
    clearMetricsForTesting(): void {
        if (this.store instanceof CustomMetricsStore) {
            // Access the internal Map and reset it to empty
            (this.store as any).customMetricsStore = new Map();
        } else {
            this.logger.warn(
                'Cannot clear metrics - store is not an instance of CustomMetricsStore',
            );
        }
    }
}
