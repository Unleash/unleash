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
import { useUiFlag } from 'hooks/useUiFlag';
import { useVariant } from 'hooks/useVariant';
import type { Variant } from 'utils/variants';

const useNewRoute = () => {
    const flag = useUiFlag('newInUnleash');
    return useVariant(flag as Variant);
};

const markRouteIfNew = (
    route: INavigationMenuItem,
    newRouteTitle?: string,
): INavigationMenuItem => {
    if (newRouteTitle?.trim().toLowerCase() === route.title.toLowerCase()) {
        return { ...route, isNew: true };
    }
    return route;
};

const filterMapRoutes =
    (
        uiConfig: IUiConfig,
        { enterprise, pro, billing }: PlanData,
        newRouteTitle?: string,
    ) =>
    (routes: INavigationMenuItem[]) => {
        return routes
            .filter(filterByConfig(uiConfig))
            .filter((route) =>
                filterRoutesByPlanData(route?.menu, {
                    enterprise,
                    pro,
                    billing,
                }),
            )
            .map((route) => {
                const normalized = normalizeRoutePath(route);
                return markRouteIfNew(normalized, newRouteTitle);
            });
    };

export const useRoutes = () => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const routes = getNavRoutes();
    const adminRoutes = useAdminRoutes();
    const primaryRoutes = getPrimaryRoutes();
    const newRoute = useNewRoute();

    const planData: PlanData = {
        enterprise: isEnterprise(),
        pro: isPro(),
        billing: isBilling,
    };

    const processRoutes = filterMapRoutes(uiConfig, planData, newRoute);

    const filteredMainRoutes = {
        mainNavRoutes: processRoutes(routes),
        adminRoutes,
        primaryRoutes: processRoutes(primaryRoutes),
    };

    return { routes: filteredMainRoutes };
};
