import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';

export const useExtendedFeatureMetrics = () => {
    const { isEnterprise } = useUiConfig();
    const extendedUsageMetrics = useUiFlag('extendedUsageMetricsUI');
    const extendedOptions = isEnterprise() && extendedUsageMetrics;

    return extendedOptions;
};
