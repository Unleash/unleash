import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { getNavRoutes } from 'component/menu/routes';
import { useAdminRoutes } from 'component/admin/useAdminRoutes';
import { filterByConfig, mapRouteLink } from 'component/common/util';

export const useRoutes = () => {
    const { uiConfig } = useUiConfig();
    const routes = getNavRoutes();
    const adminRoutes = useAdminRoutes();

    const filteredMainRoutes = {
        mainNavRoutes: routes
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        adminRoutes,
    };

    return { routes: filteredMainRoutes };
};
