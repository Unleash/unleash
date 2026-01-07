import type { Store } from '../../../types/stores/store.js';

export interface IClientMetricsEnvKey {
    featureName: string;
    appName: string;
    environment: string;
    timestamp: Date;
}

export interface IClientMetricsEnv extends IClientMetricsEnvKey {
    yes: number;
    no: number;
    variants?: Record<string, number>;
}

export interface IClientMetricsEnvVariant extends IClientMetricsEnvKey {
    variant: string;
    count: number;
}

export interface IClientMetricsStoreV2
    extends Store<IClientMetricsEnv, IClientMetricsEnvKey> {
    batchInsertMetrics(metrics: IClientMetricsEnv[] | undefined): Promise<void>;
    getMetricsForFeatureToggle(
        featureName: string,
        hoursBack?: number,
    ): Promise<IClientMetricsEnv[]>;
    getMetricsForFeatureToggleV2(
        featureName: string,
        hoursBack?: number,
    ): Promise<IClientMetricsEnv[]>;
    getSeenAppsForFeatureToggle(
        featureName: string,
        hoursBack?: number,
    ): Promise<string[]>;
    getSeenTogglesForApp(
        appName: string,
        hoursBack?: number,
    ): Promise<string[]>;
    clearMetrics(hoursAgo: number): Promise<void>;
    clearDailyMetrics(daysAgo: number): Promise<void>;
    countPreviousDayHourlyMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }>;
    countPreviousDayMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }>;
    aggregateDailyMetrics(): Promise<void>;
    getFeatureFlagNames(): Promise<string[]>;
}
