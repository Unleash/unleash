import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';

const proPlanIncludedRequests = 53_000_000;
const paygPlanIncludedRequests = proPlanIncludedRequests;

export const useTrafficLimit = () => {
    const { isPro, isEnterprise, uiConfig } = useUiConfig();
    const isEnterprisePaygEnabled = useUiFlag('enterprise-payg');

    if (isPro()) {
        return proPlanIncludedRequests;
    }

    if (
        isEnterprisePaygEnabled &&
        isEnterprise() &&
        uiConfig.billing === 'pay-as-you-go'
    ) {
        return paygPlanIncludedRequests;
    }

    return 0;
};
