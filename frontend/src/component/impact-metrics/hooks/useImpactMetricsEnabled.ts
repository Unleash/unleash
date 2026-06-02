import { useUiFlag } from 'hooks/useUiFlag.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

/**
 * Impact metrics is an enterprise feature, guarded by the
 * `disableImpactMetrics` killswitch. It is available only when the instance is
 * enterprise and the killswitch is not turned on.
 */
export const useImpactMetricsEnabled = (): boolean => {
    const { isEnterprise } = useUiConfig();
    const disableImpactMetrics = useUiFlag('disableImpactMetrics');

    return isEnterprise() && !disableImpactMetrics;
};
