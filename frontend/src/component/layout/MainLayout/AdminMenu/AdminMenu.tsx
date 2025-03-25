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
import HomeIcon from '@mui/icons-material/Home';
import LaptopIcon from '@mui/icons-material/Laptop';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import CloudIcon from '@mui/icons-material/Cloud';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BillingIcon from '@mui/icons-material/CreditCardOutlined';
import { AdminListItem, AdminSubListItem, MenuGroup } from './AdminListItem';
import { useLocation } from 'react-router-dom';
import { Sticky } from 'component/common/Sticky/Sticky';
import { adminRoutes } from 'component/admin/adminRoutes';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { filterByConfig } from 'component/common/util';
import { filterAdminRoutes } from 'component/admin/filterAdminRoutes';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

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
        marginLeft: theme.spacing(7),
        marginRight: theme.spacing(7),
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

const StyledPeopleOutlineRoundedIcon = styled(PeopleOutlineRoundedIcon)(
    ({ theme }) => ({
        color: theme.palette.primary.main,
    }),
);

const StyledKeyRoundedIcon = styled(KeyRoundedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledCloudIcon = styled(CloudIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledHubOutlinedIcon = styled(HubOutlinedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledBuildOutlinedIcon = styled(BuildOutlinedIcon)(({ theme }) => ({
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

interface IMenuLinkItem {
    href: string;
    text: string;
    icon: ReactNode;
}

interface IMenuItem {
    href?: string;
    text: string;
    icon: ReactNode;
    activeIcon?: ReactNode;
    items?: IMenuLinkItem[];
}

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

    const template: Record<string, IMenuItem> = {
        '/admin': { href: '/admin', text: 'Admin home', icon: <HomeIcon /> },
        users: {
            text: 'User administration',
            icon: <PeopleOutlineRoundedIcon />,
            activeIcon: <StyledPeopleOutlineRoundedIcon />,
            items: [],
        },
        '/admin/service-accounts': {
            href: '/admin/service-accounts',
            text: 'Service accounts',
            icon: <LaptopIcon />,
        },
        access: {
            text: 'Access control',
            icon: <KeyRoundedIcon />,
            activeIcon: <StyledKeyRoundedIcon />,
            items: [],
        },
        sso: {
            text: 'Single sign-on',
            icon: <CloudIcon />,
            activeIcon: <StyledCloudIcon />,
            items: [],
        },
        network: {
            text: 'Network',
            icon: <HubOutlinedIcon />,
            activeIcon: <StyledHubOutlinedIcon />,
            items: [],
        },
        instance: {
            text: 'Instance configuration',
            icon: <BuildOutlinedIcon />,
            activeIcon: <StyledBuildOutlinedIcon />,
            items: [],
        },
        '/admin/billing': {
            href: '/admin/billing',
            text: 'Billing & licensing',
            icon: <BillingIcon />,
        },
        '/history': {
            href: '/history',
            text: 'Event log',
            icon: <EventNoteIcon />,
        },
    };

    const menuStructure: Record<string, IMenuItem> = {};

    for (const route of routes) {
        if (route.group && template[route.group]) {
            if (!menuStructure[route.group]) {
                menuStructure[route.group] = template[route.group];
            }
            menuStructure[route.group].items?.push({
                href: route.path,
                text: route.title,
                icon: <StopRoundedIcon />,
            });
        }
        if (!route.group && template[route.path]) {
            menuStructure[route.path] = template[route.path];
        }
    }

    const items = Object.values(menuStructure);

    return (
        <>
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
                                                icon={item.icon}
                                                activeIcon={item.activeIcon}
                                                isActiveMenu={Boolean(
                                                    isActiveMenu,
                                                )}
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
                                    if (!item.href) {
                                        return null;
                                    }
                                    return (
                                        <AdminListItem
                                            href={item.href}
                                            text={item.text}
                                            selected={isActiveItem(item.href)}
                                            onClick={onClick}
                                            key={item.href}
                                        >
                                            {item.icon}
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
        </>
    );
};
