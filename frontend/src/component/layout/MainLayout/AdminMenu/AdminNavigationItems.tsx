import { Button, styled, Typography, List } from '@mui/material';
import { OtherLinksList } from '../NavigationSidebar/NavigationList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { AdminListItem, AdminSubListItem, MenuGroup } from './AdminListItem';
import { IconRenderer } from './AdminMenuIcons';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { useLocation } from 'react-router-dom';
import { filterByConfig } from 'component/common/util';
import { filterAdminRoutes } from 'component/admin/filterAdminRoutes';
import { adminGroups, adminRoutes } from 'component/admin/adminRoutes';
import type { ReactNode } from 'react';

interface IMenuLinkItem {
    href: string;
    text: string;
    icon: ReactNode;
}

interface IMenuItem {
    href: string;
    text: string;
    items?: IMenuLinkItem[];
}

const SettingsHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    paddingLeft: theme.spacing(0),
    marginBottom: theme.spacing(3),
}));

const StyledDiv = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 2.5, 0, 2.5),
}));

const StyledStopRoundedIcon = styled(StopRoundedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

export const DashboardLink = () => {
    return (
        <>
            <StyledButton
                href='/personal'
                rel='noreferrer'
                startIcon={<ArrowBackIcon />}
            >
                Back to Unleash
            </StyledButton>
        </>
    );
};

export const AdminMobileNavigation = ({ onClick }: { onClick: () => void }) => {
    return (
        <>
            <StyledDiv>
                <AdminNavigationHeader />
            </StyledDiv>

            <AdminNavigationItems staticExpanded={true} onClick={onClick} />

            <OtherLinksList />
        </>
    );
};

export const AdminMenuNavigation = ({ onClick }: { onClick: () => void }) => {
    return (
        <>
            <AdminNavigationHeader />
            <AdminNavigationItems onClick={onClick} />
        </>
    );
};

export const AdminNavigationHeader = () => {
    return (
        <>
            <SettingsHeader>Admin settings</SettingsHeader>
            <DashboardLink />
        </>
    );
};

export const AdminNavigationItems = ({
    onClick,
    staticExpanded,
}: { onClick: () => void; staticExpanded?: true | undefined }) => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const isActiveItem = (item?: string) =>
        item !== undefined && location.pathname === item;
    const location = useLocation();

    const routes = adminRoutes
        .filter(filterByConfig(uiConfig))
        .filter((route) =>
            filterAdminRoutes(route?.menu, {
                enterprise: isEnterprise(),
                pro: isPro(),
                billing: isBilling,
            }),
        );

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
                });
            }
            if (!route.group) {
                acc[route.path] = {
                    href: route.path,
                    text: route.title,
                };
            }
            return acc;
        },
        {},
    );

    const items = Object.values(menuStructure);
    return (
        <>
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
                                    <IconRenderer
                                        path={item.href}
                                        active={false}
                                    />
                                }
                                activeIcon={
                                    <IconRenderer
                                        path={item.href}
                                        active={true}
                                    />
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
                                    >
                                        <StyledStopRoundedIcon />
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
                        >
                            <IconRenderer path={item.href} active={false} />
                        </AdminListItem>
                    );
                })}
            </List>
        </>
    );
};
