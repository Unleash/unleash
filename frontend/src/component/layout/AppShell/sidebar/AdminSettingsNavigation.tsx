import { type FC, useState } from 'react';
import { ButtonBase, styled } from '@mui/material';
import { Link, useLocation } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { adminGroups, adminRoutes } from 'component/admin/adminRoutes';
import { useAdminRoutes } from 'component/admin/useAdminRoutes';
import type { INavigationMenuItem } from 'interfaces/route';
import { IconRenderer as AdminIconRenderer } from '../../MainLayout/AdminMenu/AdminMenuIcons.tsx';
import { SidebarButton } from './SidebarButton.tsx';
import {
    SidebarPendingAccessRequestsIndicator,
    SidebarCaret,
    SidebarItemIcon,
    sidebarItemStyles,
    SUB_ITEM_INDENT,
} from './SidebarItem.styles.ts';
import { SidebarList } from './SidebarList.tsx';
import { SidebarSection } from './SidebarSection.tsx';
import { createPageMatcher, isWithinPath } from './createPageMatcher.ts';

// Matches every admin path regardless of plan: the filtered list depends on
// ui-config and instance status, so a deep link would show the app navigation
// until they load.
export const isAdminSettingsPage = createPageMatcher(
    adminRoutes.map((route) => route.path),
);

type AdminGroup = {
    kind: 'group';
    key: string;
    title: string;
    routes: INavigationMenuItem[];
};
type AdminNavEntry = { kind: 'link'; route: INavigationMenuItem } | AdminGroup;

const groupAdminRoutes = (routes: INavigationMenuItem[]): AdminNavEntry[] => {
    const entries: AdminNavEntry[] = [];
    for (const route of routes) {
        if (!route.group) {
            entries.push({ kind: 'link', route });
            continue;
        }
        const group = entries.find(
            (entry): entry is AdminGroup =>
                entry.kind === 'group' && entry.key === route.group,
        );
        if (group) {
            group.routes.push(route);
        } else {
            entries.push({
                kind: 'group',
                key: route.group,
                title: adminGroups[route.group],
                routes: [route],
            });
        }
    }
    return entries;
};

// The most specific match wins, so Project roles doesn't also mark Root roles.
const findCurrentPath = (pathname: string, routes: INavigationMenuItem[]) =>
    routes
        .map((route) => route.path)
        .filter((path) => isWithinPath(pathname, path))
        .sort((a, b) => b.length - a.length)[0];

const StyledLink = styled(Link)(({ theme }) => sidebarItemStyles(theme));

const StyledSubLink = styled(Link)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    paddingLeft: theme.spacing(SUB_ITEM_INDENT),
}));

const StyledGroupToggle = styled(ButtonBase)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    '&[aria-current="location"]': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

const StyledTrailingCaret = styled(SidebarCaret)({ marginLeft: 'auto' });

const AdminNavGroup: FC<{ group: AdminGroup; currentPath?: string }> = ({
    group,
    currentPath,
}) => {
    const containsCurrent = group.routes.some(
        (route) => route.path === currentPath,
    );
    const [expansion, setExpansion] = useState<'open' | 'closed'>();
    const expanded = expansion ? expansion === 'open' : containsCurrent;

    return (
        <>
            <StyledGroupToggle
                aria-expanded={expanded}
                aria-current={containsCurrent ? 'location' : undefined}
                onClick={() => setExpansion(expanded ? 'closed' : 'open')}
            >
                <SidebarItemIcon>
                    <AdminIconRenderer path={group.key} active={false} />
                </SidebarItemIcon>
                {group.title}
                {!expanded && group.key === 'users' ? (
                    <SidebarPendingAccessRequestsIndicator />
                ) : null}
                <StyledTrailingCaret expanded={expanded} />
            </StyledGroupToggle>
            {expanded ? (
                <SidebarList role='group' aria-label={group.title}>
                    {group.routes.map((route) => (
                        <StyledSubLink
                            key={route.path}
                            to={route.path}
                            aria-current={
                                route.path === currentPath ? 'page' : undefined
                            }
                        >
                            {route.title}
                            {route.path === '/admin/users' ? (
                                <SidebarPendingAccessRequestsIndicator />
                            ) : null}
                        </StyledSubLink>
                    ))}
                </SidebarList>
            ) : null}
        </>
    );
};

export const AdminSettingsNavigation: FC<{ onBack: () => void }> = ({
    onBack,
}) => {
    const { pathname } = useLocation();
    const routes = useAdminRoutes().filter((route) => route.menu.adminSettings);
    const currentPath = findCurrentPath(pathname, routes);

    return (
        <>
            <SidebarButton
                icon={<ArrowBackIcon />}
                label='Back to app'
                onClick={onBack}
            />
            <SidebarSection title='Admin settings'>
                {groupAdminRoutes(routes).map((entry) =>
                    entry.kind === 'group' ? (
                        <AdminNavGroup
                            key={entry.key}
                            group={entry}
                            currentPath={currentPath}
                        />
                    ) : (
                        <StyledLink
                            key={entry.route.path}
                            to={entry.route.path}
                            aria-current={
                                entry.route.path === currentPath
                                    ? 'page'
                                    : undefined
                            }
                        >
                            <SidebarItemIcon>
                                <AdminIconRenderer
                                    path={entry.route.path}
                                    active={false}
                                />
                            </SidebarItemIcon>
                            {entry.route.title}
                        </StyledLink>
                    ),
                )}
            </SidebarSection>
        </>
    );
};
