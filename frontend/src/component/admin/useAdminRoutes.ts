import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { adminRoutes } from './adminRoutes.js';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { filterRoutesByPlanData } from './filterRoutesByPlanData.js';
import { filterByConfig, normalizeRoutePath } from 'component/common/util';

export const useAdminRoutes = () => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const routes = [...adminRoutes];

    if (uiConfig.flags.UNLEASH_CLOUD) {
        const adminBillingMenuItem = routes.findIndex(
            (route) => route.title === 'Billing & invoices',
        );
        routes[adminBillingMenuItem] = {
            ...routes[adminBillingMenuItem],
            path: '/admin/billing',
        };
    }

    return routes
        .filter(filterByConfig(uiConfig))
        .filter((route) =>
            filterRoutesByPlanData(route?.menu, {
                enterprise: isEnterprise(),
                pro: isPro(),
                billing: isBilling,
            }),
        )
        .map(normalizeRoutePath);
};
