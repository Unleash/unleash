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
    const routes = [...adminRoutes];

    if (isCloud) {
        const adminBillingMenuItem = routes.findIndex(
            (route) => route.title === 'Billing & invoices',
        );
        routes[adminBillingMenuItem] = {
            ...routes[adminBillingMenuItem],
            path: '/admin/billing',
        };
    }

    return routes
        .filter((route) => isCloud || route.path !== '/admin/instance-name')
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
