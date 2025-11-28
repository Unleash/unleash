import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { getNavRoutes, getPrimaryRoutes } from 'component/menu/routes';
import { useAdminRoutes } from 'component/admin/useAdminRoutes';
import { filterByConfig, normalizeRoutePath } from 'component/common/util';
import {
    filterRoutesByPlanData,
    type PlanData,
} from 'component/admin/filterRoutesByPlanData';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import type { INavigationMenuItem } from 'interfaces/route';
import type { IUiConfig } from 'interfaces/uiConfig';

const filterRoutes = (
    routes: INavigationMenuItem[],
    uiConfig: IUiConfig,
    { enterprise, pro, billing }: PlanData,
) => {
    return routes
        .filter(filterByConfig(uiConfig))
        .filter((route) =>
            filterRoutesByPlanData(route?.menu, {
                enterprise,
                pro,
                billing,
            }),
        )
        .map(normalizeRoutePath);
};

export const useRoutes = () => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const routes = getNavRoutes();
    const adminRoutes = useAdminRoutes();
    const primaryRoutes = getPrimaryRoutes();

    const planData: PlanData = {
        enterprise: isEnterprise(),
        pro: isPro(),
        billing: isBilling,
    };

    const filteredMainRoutes = {
        mainNavRoutes: filterRoutes(routes, uiConfig, planData),
        adminRoutes,
        primaryRoutes: filterRoutes(primaryRoutes, uiConfig, planData),
    };

    return { routes: filteredMainRoutes };
};
