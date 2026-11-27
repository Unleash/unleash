import type { ComponentType } from 'react';
import { matchPath, useLocation } from 'react-router';
import type { SvgIconProps } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import type { INavigationMenuItem } from 'interfaces/route';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { ProjectSchemaMode } from 'openapi';
import { useRoutes } from '../../MainLayout/NavigationSidebar/useRoutes.ts';
import { getProjectPage } from '../projects/getProjectPage.ts';
import {
    PrivateProjectIcon,
    ProtectedProjectIcon,
} from '../projects/ProjectModeIcons.tsx';
import { useProjectNavItems } from '../projects/useProjectNavItems.ts';
import {
    type AppNavigationLink,
    appNavigationLinks,
} from '../sidebar/appNavigationLinks.ts';
import {
    findCurrentRoute,
    isWithinPath,
} from '../sidebar/createPageMatcher.ts';
import { sidebarSectionLabels } from '../sidebar/sidebarSectionLabels.ts';
import { type EntityPage, useEntityName } from './entityPages.ts';
import { useVisibleAppNavigationLinks } from '../sidebar/useVisibleAppNavigationLinks.ts';

export type PageBreadcrumb = {
    label: string;
    to?: string;
    icon?: ComponentType<SvgIconProps>;
    badge?: ComponentType;
};

const homeBreadcrumb: PageBreadcrumb = {
    label: appNavigationLinks.home.label,
    to: appNavigationLinks.home.to,
    icon: HomeOutlinedIcon,
};

const projectModeBadges: Partial<Record<ProjectSchemaMode, ComponentType>> = {
    private: PrivateProjectIcon,
    protected: ProtectedProjectIcon,
};

const projectsBreadcrumb: PageBreadcrumb = {
    label: appNavigationLinks.projects.label,
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
        projectsBreadcrumb,
        {
            label: project.name,
            to: `/projects/${project.id}`,
            badge: project.mode && projectModeBadges[project.mode],
        },
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

    return link === appNavigationLinks.home
        ? []
        : [{ label: link.label, to: link.to }];
};

const useMenuBreadcrumbs = (pathname: string): PageBreadcrumb[] => {
    const { mainNavRoutes, adminRoutes } = useRoutes().routes;
    const visibleLinks = useVisibleAppNavigationLinks();
    const projectBreadcrumbs = useProjectBreadcrumbs(pathname);

    const trailBelowHome =
        projectBreadcrumbs ??
        getAdminSettingsBreadcrumbs(pathname, adminRoutes) ??
        getConfigureWorkspaceBreadcrumbs(pathname, mainNavRoutes) ??
        getAppBreadcrumbs(pathname, visibleLinks);

    return trailBelowHome ? [homeBreadcrumb, ...trailBelowHome] : [];
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
