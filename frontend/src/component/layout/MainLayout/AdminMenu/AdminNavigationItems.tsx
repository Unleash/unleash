import {
    styled,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    type Theme,
} from '@mui/material';
import { OtherLinksList } from '../NavigationSidebar/NavigationList.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import {
    AdminListItem,
    AdminSubListItem,
    MenuGroup,
} from './AdminListItem.tsx';
import { IconRenderer } from './AdminMenuIcons.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { Link, useLocation } from 'react-router-dom';
import { filterByConfig } from 'component/common/util';
import { filterRoutesByPlanData } from 'component/admin/filterRoutesByPlanData';
import { adminGroups, adminRoutes } from 'component/admin/adminRoutes';
import { useEffect, useState, type ReactNode } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import { useShowBadge } from 'component/layout/components/EnterprisePlanBadge/useShowBadge';
import { EnterprisePlanBadge } from 'component/layout/components/EnterprisePlanBadge/EnterprisePlanBadge';

interface IMenuLinkItem {
    href: string;
    text: string;
    icon: ReactNode;
    menuMode?: INavigationMenuItem['menu']['mode'];
}

interface IMenuItem {
    href: string;
    text: string;
    items?: IMenuLinkItem[];
    menuMode?: INavigationMenuItem['menu']['mode'];
}

const SettingsHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
}));

const CappedText = styled(Typography)(({ theme }) => ({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    paddingTop: theme.spacing(0.25),
    marginLeft: theme.spacing(0.75),
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
}));

const StyledDiv = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 2.5, 0, 2.5),

    '&.MuiButton-root': {
        padding: theme.spacing(0),
    },
}));

const StyledStopRoundedIcon = styled(StopRoundedIcon)(({ theme }) => ({
    color: '#607B81',
}));

const ActiveStyledStopRoundedIcon = styled(StopRoundedIcon)(({ theme }) => ({
    color: theme.palette.common.white,
}));

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    m: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    minHeight: '0px',
    '.MuiAccordionSummary-content': { margin: 0 },
    '&>.MuiAccordionSummary-content.MuiAccordionSummary-content': {
        margin: '0',
        alignItems: 'center',
        padding: theme.spacing(0.1, 0),
    },
});

export const DashboardLink = ({ onClick }: { onClick: () => void }) => {
    return (
        <List>
            <ListItem disablePadding>
                <ListItemButton
                    dense={true}
                    component={Link}
                    to='/personal'
                    sx={listItemButtonStyle}
                    selected={false}
                    onClick={onClick}
                >
                    <ArrowBackIcon />
                    <StyledListItemText>
                        <CappedText>Back to Unleash</CappedText>
                    </StyledListItemText>
                </ListItemButton>
            </ListItem>
        </List>
    );
};

export const AdminMobileNavigation = ({ onClick }: { onClick: () => void }) => {
    return (
        <>
            <StyledDiv>
                <SettingsHeader>Admin settings</SettingsHeader>
            </StyledDiv>
            <DashboardLink onClick={onClick} />

            <AdminNavigationItems staticExpanded={true} onClick={onClick} />

            <OtherLinksList />
        </>
    );
};

export const AdminMenuNavigation = ({ onClick }: { onClick: () => void }) => {
    return (
        <>
            <DashboardLink onClick={onClick} />
            <AdminNavigationItems onClick={onClick} />
        </>
    );
};

export const AdminNavigationItems = ({
    onClick,
    staticExpanded,
}: {
    onClick: () => void;
    staticExpanded?: true | undefined;
}) => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const location = useLocation();
    const showBadge = useShowBadge();

    const routes = adminRoutes
        .filter(filterByConfig(uiConfig))
        .filter((route) =>
            filterRoutesByPlanData(route?.menu, {
                enterprise: isEnterprise(),
                pro: isPro(),
                billing: isBilling,
            }),
        );

    const findActiveItem = () => {
        const activeItem = routes.find(
            (route) => route.path === location.pathname,
        );
        if (!activeItem) {
            return routes.find(
                (route) =>
                    route.path !== '/admin' &&
                    location.pathname.startsWith(route.path),
            )?.path;
        }
        return activeItem.path;
    };
    const [activeItem, setActiveItem] = useState<string | undefined>(
        findActiveItem(),
    );
    const isActiveItem = (item?: string) =>
        item !== undefined && activeItem !== undefined && item === activeItem;
    useEffect(() => {
        setActiveItem(findActiveItem());
    }, [location, location.pathname]);

    const menuStructure = routes.reduce(
        (acc: Record<string, IMenuItem>, route) => {
            if (route.group && adminGroups[route.group]) {
                if (!acc[route.group]) {
                    acc[route.group] = {
                        href: route.group,
                        text: adminGroups[route.group],
                        items: [],
                    };
                }
                acc[route.group].items?.push({
                    href: route.path,
                    text: route.title,
                    icon: <StopRoundedIcon />,
                    menuMode: route?.menu?.mode,
                });
            }
            if (!route.group) {
                acc[route.path] = {
                    href: route.path,
                    text: route.title,
                    menuMode: route?.menu?.mode,
                };
            }
            return acc;
        },
        {},
    );

    const items = Object.values(menuStructure);
    return (
        <List>
            {items.map((item) => {
                if (item.items) {
                    const isActiveMenu = item.items.find((itm) =>
                        isActiveItem(itm.href),
                    );
                    return (
                        <MenuGroup
                            title={item.text}
                            icon={
                                <IconRenderer path={item.href} active={false} />
                            }
                            activeIcon={
                                <IconRenderer path={item.href} active={false} />
                            }
                            isActiveMenu={Boolean(isActiveMenu)}
                            key={item.text}
                            staticExpanded={staticExpanded}
                        >
                            {item.items.map((subItem) => (
                                <AdminSubListItem
                                    href={subItem.href}
                                    text={subItem.text}
                                    selected={isActiveItem(subItem.href)}
                                    onClick={onClick}
                                    key={subItem.href}
                                    badge={
                                        showBadge(subItem.menuMode) ? (
                                            <EnterprisePlanBadge />
                                        ) : null
                                    }
                                >
                                    {isActiveItem(subItem.href) ? (
                                        <ActiveStyledStopRoundedIcon />
                                    ) : (
                                        <StyledStopRoundedIcon />
                                    )}
                                </AdminSubListItem>
                            ))}
                        </MenuGroup>
                    );
                }
                return (
                    <AdminListItem
                        href={item.href}
                        text={item.text}
                        selected={isActiveItem(item.href)}
                        onClick={onClick}
                        key={item.href}
                        badge={
                            showBadge(item.menuMode) ? (
                                <EnterprisePlanBadge />
                            ) : null
                        }
                    >
                        <IconRenderer
                            path={item.href}
                            active={isActiveItem(item.href)}
                        />
                    </AdminListItem>
                );
            })}
        </List>
    );
};
