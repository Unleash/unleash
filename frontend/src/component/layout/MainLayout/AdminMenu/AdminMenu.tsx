import {
    Grid,
    styled,
    Paper,
    Typography,
    Button,
    List,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import type { ReactNode } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { AdminListItem, AdminSubListItem, MenuGroup } from './AdminListItem';
import { useLocation } from 'react-router-dom';
import { Sticky } from 'component/common/Sticky/Sticky';
import { adminRoutes, adminGroups } from 'component/admin/adminRoutes';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { filterByConfig } from 'component/common/util';
import { filterAdminRoutes } from 'component/admin/filterAdminRoutes';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { IconRenderer } from './AdminMenuIcons';

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

const StyledAdminMainGrid = styled(Grid)(({ theme }) => ({
    minWidth: 0, // this is a fix for overflowing flex
    maxWidth: '1812px',
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(2156)]: {
        width: '100%',
    },
    [theme.breakpoints.down(2156)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: '1550px',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down(1024)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
    },
    minHeight: '94vh',
}));

const StyledMenuPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    minWidth: 320,
    padding: theme.spacing(3),
    marginTop: theme.spacing(6.5),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
}));

const StickyContainer = styled(Sticky)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
}));

const SettingsHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    paddingLeft: theme.spacing(0),
    marginBottom: theme.spacing(3),
}));

const StyledStopRoundedIcon = styled(StopRoundedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

interface IWrapIfAdminSubpageProps {
    children: ReactNode;
}

export const WrapIfAdminSubpage = ({ children }: IWrapIfAdminSubpageProps) => {
    const newAdminUIEnabled = useUiFlag('adminNavUI');
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const showAdminMenu =
        !isSmallScreen &&
        newAdminUIEnabled &&
        location.pathname.indexOf('/admin') === 0;

    if (showAdminMenu) {
        return <AdminMenu>{children}</AdminMenu>;
    }

    return <>{children}</>;
};

const DashboardLink = () => {
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

interface IAdminMenuProps {
    children: ReactNode;
}

export const AdminMenu = ({ children }: IAdminMenuProps) => {
    const { uiConfig, isPro, isEnterprise } = useUiConfig();
    const { isBilling } = useInstanceStatus();
    const isActiveItem = (item?: string) =>
        item !== undefined && location.pathname === item;
    const theme = useTheme();
    const isBreakpoint = useMediaQuery(theme.breakpoints.down(1350));
    const onClick = () => {
        scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
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
        <StyledAdminMainGrid container spacing={1}>
            <Grid item>
                <StickyContainer>
                    <StyledMenuPaper>
                        <SettingsHeader>Admin settings</SettingsHeader>
                        <DashboardLink />
                        <List>
                            {items.map((item) => {
                                if (item.items) {
                                    const isActiveMenu = item.items.find(
                                        (itm) => isActiveItem(itm.href),
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
                                        >
                                            {item.items.map((subItem) => (
                                                <AdminSubListItem
                                                    href={subItem.href}
                                                    text={subItem.text}
                                                    selected={isActiveItem(
                                                        subItem.href,
                                                    )}
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
                                        <IconRenderer
                                            path={item.href}
                                            active={false}
                                        />
                                    </AdminListItem>
                                );
                            })}
                        </List>
                    </StyledMenuPaper>
                </StickyContainer>
            </Grid>
            <Grid item md={isBreakpoint ? true : 9}>
                {children}
            </Grid>
        </StyledAdminMainGrid>
    );
};
