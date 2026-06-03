import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

// Reachable even without a configured source, so self-hosted users can set one up.
export const useImpactMetricsConfigEnabled = (): boolean => {
    const { impactMetrics } = useUiConfig().uiConfig;

    return impactMetrics !== undefined && impactMetrics !== 'disabled';
};

export const useImpactMetricsEnabled = (): boolean => {
    const { impactMetrics } = useUiConfig().uiConfig;

    return (
        impactMetrics === 'external' ||
        impactMetrics === 'internal' ||
        impactMetrics === 'full'
    );
};
