import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { adminRoutes as oldAdminRoutes } from './oldAdminRoutes';
import { adminRoutes } from './adminRoutes';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { filterRoutesByPlanData } from './filterRoutesByPlanData';
import { filterByConfig, mapRouteLink } from 'component/common/util';
import { useUiFlag } from 'hooks/useUiFlag';

export const useAdminRoutes = () => {
    const newAdminUIEnabled = useUiFlag('adminNavUI');
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const routes = newAdminUIEnabled ? [...adminRoutes] : [...oldAdminRoutes];

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
        .map(mapRouteLink);
};
