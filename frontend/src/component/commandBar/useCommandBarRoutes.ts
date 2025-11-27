import { adminGroups } from 'component/admin/adminRoutes';
import { useRoutes } from 'component/layout/MainLayout/NavigationSidebar/useRoutes';
import type { INavigationMenuItem } from 'interfaces/route';
import { useMemo } from 'react';

interface IPageRouteInfo {
    path: string;
    title: string;
    searchText: string;
}

export const useCommandBarRoutes = () => {
    const { routes } = useRoutes();
    const getSearchText = (route: INavigationMenuItem, title: string) => {
        if (route.group && adminGroups[route.group]) {
            return `${title} ${route.path} ${route.group} ${adminGroups[route.group]}`;
        }

        return `${title} ${route.path}`;
    };

    const getRouteTitle = (route: INavigationMenuItem) => {
        if (route.path === '/admin') {
            return 'Admin settings';
        }

        return route.title;
    };
    return useMemo(() => {
        const allRoutes: Record<string, IPageRouteInfo> = {};
        for (const route of [
            ...routes.mainNavRoutes,
            ...routes.adminRoutes,
            ...routes.primaryRoutes,
        ]) {
            const title = getRouteTitle(route);
            allRoutes[route.path] = {
                path: route.path,
                title: title,
                searchText: getSearchText(route, title),
            };
        }

        return {
            allRoutes,
        };
    }, [routes]);
};
