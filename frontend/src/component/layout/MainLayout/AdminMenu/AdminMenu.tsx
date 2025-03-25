import { Grid, styled, Paper, Typography, Button, List } from '@mui/material';
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
import { AdminListItem, AdminSubListItem, MenuGroup } from './AdminListItem';
import { useLocation } from 'react-router-dom';
import { Sticky } from 'component/common/Sticky/Sticky';

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

const RotatedKeyRoundedIcon = styled(KeyRoundedIcon)(({ theme }) => ({
    transform: 'rotate(-45deg)',
}));

interface IWrapIfAdminSubpageProps {
    children: ReactNode;
}

export const WrapIfAdminSubpage = ({ children }: IWrapIfAdminSubpageProps) => {
    const newAdminUIEnabled = useUiFlag('adminNavUI');
    const showOnlyAdminMenu =
        newAdminUIEnabled && location.pathname.indexOf('/admin') === 0;

    if (showOnlyAdminMenu) {
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
    const isActiveItem = (item: string) => location.pathname === item;
    const onClick = () => {
        scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
    const location = useLocation();

    const userAdmItems = [
        { href: '/admin/users', text: 'Users' },
        { href: '/admin/groups', text: 'Groups' },
        { href: '/admin/roles/project-roles', text: 'Project roles' },
        { href: '/admin/roles', text: 'Root roles' },
        { href: '/admin/logins', text: 'Login history' },
    ];

    const accessControlItems = [
        { href: '/admin/api', text: 'API access' },
        { href: '/admin/cors', text: 'CORS origins' },
    ];

    const ssoItems = [
        { href: '/admin/auth', text: 'OpenID Connect' },
        { href: '/admin/auth/saml', text: 'SAML 2.0' },
        { href: '/admin/auth/password', text: 'Password' },
        { href: '/admin/auth/scim', text: 'SCIM' },
    ];

    const networkItems = [
        { href: '/admin/network', text: 'Overview' },
        { href: '/admin/network/traffic', text: 'Traffic' },
        { href: '/admin/network/connected-edges', text: 'Connected edges' },
        {
            href: '/admin/network/backend-connections',
            text: 'Backend Connections',
        },
        {
            href: '/admin/network/frontend-data-usage',
            text: 'Frontend Traffic',
        },
    ];

    const instanceConfItems = [
        { href: '/admin/maintenance', text: 'Maintenance' },
        { href: '/admin/banners', text: 'Banners' },
        { href: '/admin/license', text: 'License' },
        { href: '/admin/instance', text: 'Instance stats' },
        { href: '/admin/instance-privacy', text: 'Instance privacy' },
    ];

    const items = [
        { href: '/admin', text: 'Admin home', icon: <HomeIcon /> },
        {
            text: 'User administration',
            icon: <PeopleOutlineRoundedIcon />,
            activeIcon: <StyledPeopleOutlineRoundedIcon />,
            items: userAdmItems,
        },
        {
            href: '/admin/service-accounts',
            text: 'Service accounts',
            icon: <LaptopIcon />,
        },
        {
            text: 'Access control',
            icon: <KeyRoundedIcon />,
            activeIcon: <StyledKeyRoundedIcon />,
            items: accessControlItems,
        },
        {
            text: 'Single sign-on',
            icon: <CloudIcon />,
            activeIcon: <StyledCloudIcon />,
            items: ssoItems,
        },
        {
            text: 'Network',
            icon: <HubOutlinedIcon />,
            activeIcon: <StyledHubOutlinedIcon />,
            items: networkItems,
        },
        {
            text: 'Instance configuration',
            icon: <BuildOutlinedIcon />,
            activeIcon: <StyledBuildOutlinedIcon />,
            items: instanceConfItems,
        },
        { href: '/history', text: 'Event log', icon: <EventNoteIcon /> },
    ];

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
                                            >
                                                {item.items.map((subItem) => (
                                                    <AdminSubListItem
                                                        href={subItem.href}
                                                        text={subItem.text}
                                                        selected={isActiveItem(
                                                            subItem.href,
                                                        )}
                                                        onClick={onClick}
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
                                        >
                                            {item.icon}
                                        </AdminListItem>
                                    );
                                })}
                            </List>
                        </StyledMenuPaper>
                    </StickyContainer>
                </Grid>
                <Grid item md={9}>
                    {children}
                </Grid>
            </StyledAdminMainGrid>
        </>
    );
};
