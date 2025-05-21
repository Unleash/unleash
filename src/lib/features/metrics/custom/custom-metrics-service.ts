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
     * Get metrics by name
     */
    getMetricsByName(name: string): StoredCustomMetric[] {
        return this.store.getMetricsByName(name);
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
}
