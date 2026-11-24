import { matchPath, useLocation } from 'react-router';
import type { INavigationMenuItem } from 'interfaces/route';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useRoutes } from '../../MainLayout/NavigationSidebar/useRoutes.ts';
import { getProjectPage } from '../projects/getProjectPage.ts';
import { useProjectNavItems } from '../projects/useProjectNavItems.ts';
import {
    type AppNavigationLink,
    appNavigationLinks,
    workspaceSectionLinks,
} from '../sidebar/appNavigationLinks.ts';
import {
    findCurrentRoute,
    isWithinPath,
} from '../sidebar/createPageMatcher.ts';
import { sidebarSectionLabels } from '../sidebar/sidebarSectionLabels.ts';
import { type EntityPage, useEntityName } from './entityPages.ts';
import { useVisibleAppNavigationLinks } from '../sidebar/useVisibleAppNavigationLinks.ts';

export type PageBreadcrumb = { label: string; to?: string };

const workspaceBreadcrumb: PageBreadcrumb = {
    label: sidebarSectionLabels.workspace,
    to: appNavigationLinks.projects.to,
};

const useProjectBreadcrumbs = (
    pathname: string,
): PageBreadcrumb[] | undefined => {
    const { projects } = useProjects();
    const projectId = matchPath('/projects/:projectId/*', pathname)?.params
        .projectId;
    const project = projects.find(({ id }) => id === projectId);
    const { primary, more } = useProjectNavItems(project?.id ?? '');

    if (!project) return undefined;

    const currentPage = getProjectPage(pathname, project.id);
    const item = [...primary, ...more].find(({ page }) => page === currentPage);

    return [
        { label: project.name, to: `/projects/${project.id}` },
        ...(item ? [{ label: item.label, to: item.to }] : []),
    ];
};

const getAdminSettingsBreadcrumbs = (
    pathname: string,
    adminRoutes: INavigationMenuItem[],
): PageBreadcrumb[] | undefined => {
    const adminSettingsRoutes = adminRoutes.filter(
        (route) => route.menu.adminSettings,
    );
    const route = findCurrentRoute(pathname, adminSettingsRoutes);
    if (!route) return undefined;

    return [
        { label: sidebarSectionLabels.adminSettings },
        { label: route.title, to: route.path },
    ];
};

const getConfigureWorkspaceBreadcrumbs = (
    pathname: string,
    workspaceRoutes: INavigationMenuItem[],
): PageBreadcrumb[] | undefined => {
    const route = findCurrentRoute(pathname, workspaceRoutes);
    if (!route) return undefined;

    return [
        workspaceBreadcrumb,
        { label: sidebarSectionLabels.configureWorkspace },
        { label: route.title, to: route.path },
    ];
};

const getAppBreadcrumbs = (
    pathname: string,
    visibleLinks: AppNavigationLink[],
): PageBreadcrumb[] | undefined => {
    const link = visibleLinks.find(({ to, end }) =>
        end ? pathname === to : isWithinPath(pathname, to),
    );

    if (!link) return undefined;

    return [
        ...(workspaceSectionLinks.includes(link) ? [workspaceBreadcrumb] : []),
        { label: link.label, to: link.to },
    ];
};

const useMenuBreadcrumbs = (pathname: string): PageBreadcrumb[] => {
    const { mainNavRoutes, adminRoutes } = useRoutes().routes;
    const visibleLinks = useVisibleAppNavigationLinks();
    const projectBreadcrumbs = useProjectBreadcrumbs(pathname);

    return (
        projectBreadcrumbs ??
        getAdminSettingsBreadcrumbs(pathname, adminRoutes) ??
        getConfigureWorkspaceBreadcrumbs(pathname, mainNavRoutes) ??
        getAppBreadcrumbs(pathname, visibleLinks) ??
        []
    );
};

export const usePageBreadcrumbs = (
    entityPage?: EntityPage,
): PageBreadcrumb[] => {
    const { pathname } = useLocation();
    const menuBreadcrumbs = useMenuBreadcrumbs(pathname);
    const entityName = useEntityName(entityPage);

    return entityPage && entityName && menuBreadcrumbs.length > 0
        ? [...menuBreadcrumbs, { label: entityName, to: entityPage.to }]
        : menuBreadcrumbs;
};
