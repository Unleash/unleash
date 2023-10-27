import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { adminRoutes } from './adminRoutes';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { filterAdminRoutes } from './filterAdminRoutes';
import { filterByConfig, mapRouteLink } from 'component/common/util';

export const useAdminRoutes = () => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const routes = [...adminRoutes];

    if (uiConfig.flags.UNLEASH_CLOUD) {
        const adminBillingMenuItem = adminRoutes.findIndex(
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
            filterAdminRoutes(route?.menu, {
                enterprise: isEnterprise(),
                pro: isPro(),
                billing: isBilling,
            }),
        )
        .map(mapRouteLink);
};
