import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { adminRoutes } from './adminRoutes.js';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { filterRoutesByPlanData } from './filterRoutesByPlanData.js';
import { filterByConfig, normalizeRoutePath } from 'component/common/util';
import { useUiFlagEvaluator } from 'hooks/useUiFlag';

export const useAdminRoutes = () => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const evaluateFlag = useUiFlagEvaluator();
    const isCloud = Boolean(evaluateFlag('UNLEASH_CLOUD'));

    return adminRoutes
        .filter((route) => {
            if (route.deployment === 'cloud') return isCloud;
            if (route.deployment === 'self-hosted') return !isCloud;
            return true;
        })
        .filter(filterByConfig(uiConfig, evaluateFlag))
        .filter((route) =>
            filterRoutesByPlanData(route?.menu, {
                enterprise: isEnterprise(),
                pro: isPro(),
                billing: isBilling,
            }),
        )
        .map(normalizeRoutePath);
};
