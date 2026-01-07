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

    addMetric(metric: Omit<StoredCustomMetric, 'timestamp'>): void {
        this.store.addMetric(metric);
    }

    addMetrics(metrics: Omit<StoredCustomMetric, 'timestamp'>[]): void {
        this.store.addMetrics(metrics);
    }

    getMetrics(): StoredCustomMetric[] {
        return this.store.getMetrics();
    }

    getMetricNames(): string[] {
        return this.store.getMetricNames();
    }

    getPrometheusMetrics(): string {
        return this.store.getPrometheusMetrics();
    }

    clearMetricsForTesting(): void {
        if (this.store instanceof CustomMetricsStore) {
            (this.store as any).customMetricsStore = new Map();
        } else {
            this.logger.warn(
                'Cannot clear metrics - store is not an instance of CustomMetricsStore',
            );
        }
    }
}
