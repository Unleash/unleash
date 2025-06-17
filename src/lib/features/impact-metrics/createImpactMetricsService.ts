import type { IUnleashConfig } from '../../types/index.js';
import ImpactMetricsService from './impact-metrics-service.js';

export const createImpactMetricsService = (config: IUnleashConfig) => {
    return new ImpactMetricsService(config);
};

export const createFakeImpactMetricsService = (config: IUnleashConfig) => {
    return new ImpactMetricsService(config);
};
