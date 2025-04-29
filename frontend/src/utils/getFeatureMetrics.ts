import type {
    IFeatureEnvironment,
    IFeatureMetrics,
} from '../interfaces/featureToggle.js';

const emptyMetric = (environment: string) => ({
    yes: 0,
    no: 0,
    environment,
    timestamp: '',
});

export const getFeatureMetrics = (
    environments: IFeatureEnvironment[],
    metrics: IFeatureMetrics,
) =>
    environments.map((env) => {
        const envMetric = metrics.lastHourUsage.find(
            (metric) => metric.environment === env.name,
        );
        return envMetric || emptyMetric(env.name);
    });
