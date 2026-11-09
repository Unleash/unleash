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
import { useUiFlagEvaluator } from 'hooks/useUiFlag';

const filterMapRoutes =
    (
        uiConfig: IUiConfig,
        evaluateFlag: ReturnType<typeof useUiFlagEvaluator>,
        planData: PlanData,
    ) =>
    (routes: INavigationMenuItem[]) => {
        return routes
            .filter(filterByConfig(uiConfig, evaluateFlag))
            .filter((route) => filterRoutesByPlanData(route?.menu, planData))
            .map(normalizeRoutePath);
    };

export const useRoutes = () => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const routes = getNavRoutes();
    const adminRoutes = useAdminRoutes();
    const primaryRoutes = getPrimaryRoutes();
    const evaluateFlag = useUiFlagEvaluator();

    const planData: PlanData = {
        enterprise: isEnterprise(),
        pro: isPro(),
        billing: isBilling,
    };

    const processRoutes = filterMapRoutes(uiConfig, evaluateFlag, planData);

    const filteredMainRoutes = {
        mainNavRoutes: processRoutes(routes),
        adminRoutes,
        primaryRoutes: processRoutes(primaryRoutes),
    };

    return { routes: filteredMainRoutes };
};
