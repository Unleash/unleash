import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { getCondensedRoutes, getRoutes } from 'component/menu/routes';
import { useAdminRoutes } from 'component/admin/useAdminRoutes';
import { filterByConfig, mapRouteLink } from 'component/common/util';

export const useRoutes = () => {
    const { uiConfig } = useUiConfig();
    const routes = getRoutes();
    const adminRoutes = useAdminRoutes();

    const filteredMainRoutes = {
        mainNavRoutes: getCondensedRoutes(routes.mainNavRoutes)
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        mobileRoutes: getCondensedRoutes(routes.mobileRoutes)
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        adminRoutes,
    };

    return { routes: filteredMainRoutes };
};
