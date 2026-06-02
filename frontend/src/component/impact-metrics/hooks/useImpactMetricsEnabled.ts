import { useUiFlag } from 'hooks/useUiFlag.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const useImpactMetricsEnabled = (): boolean => {
    const { isEnterprise } = useUiConfig();
    const disableImpactMetrics = useUiFlag('disableImpactMetrics');

    return isEnterprise() && !disableImpactMetrics;
};
