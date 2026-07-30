import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { MetricSource } from 'component/impact-metrics/types';

// Reachable even without a configured source, so self-hosted users can set one up.
export const useImpactMetricsConfigEnabled = (): boolean => {
    const { impactMetrics } = useUiConfig().uiConfig;

    return impactMetrics !== undefined && impactMetrics !== 'disabled';
};

export const useImpactMetricsEnabled = (source?: MetricSource): boolean => {
    const { impactMetrics } = useUiConfig().uiConfig;

    if (impactMetrics === 'full') return true;

    return source
        ? impactMetrics === source
        : impactMetrics === 'external' || impactMetrics === 'internal';
};
