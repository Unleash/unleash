import {
    Box,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import IntegrationsIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import EnvironmentsIcon from '@mui/icons-material/CloudOutlined';
import ContextFieldsIcon from '@mui/icons-material/AccountTreeOutlined';
import SegmentsIcon from '@mui/icons-material/DonutLargeOutlined';
import TagTypesIcon from '@mui/icons-material/LabelImportantOutlined';
import ApplicationsIcon from '@mui/icons-material/AppsOutlined';
import CustomStrategiesIcon from '@mui/icons-material/ExtensionOutlined';
import UsersIcon from '@mui/icons-material/GroupOutlined';
import ServiceAccountIcon from '@mui/icons-material/SmartToyOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import RoleIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ApiAccessIcon from '@mui/icons-material/KeyOutlined';
import SingleSignOnIcon from '@mui/icons-material/AssignmentOutlined';
import NetworkIcon from '@mui/icons-material/HubOutlined';
import MaintenanceIcon from '@mui/icons-material/BuildOutlined';
import BannersIcon from '@mui/icons-material/PhotoOutlined';
import InstanceStatsIcon from '@mui/icons-material/QueryStatsOutlined';
import LicenseIcon from '@mui/icons-material/ReceiptLongOutlined';
import InstancePrivacyIcon from '@mui/icons-material/ShieldOutlined';
import LoginHistoryIcon from '@mui/icons-material/HistoryOutlined';
import EventLogIcon from '@mui/icons-material/EventNoteOutlined';
import FlagTypesIcon from '@mui/icons-material/OutlinedFlag';
import EmptyIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CorsIcon from '@mui/icons-material/StorageOutlined';
import BillingIcon from '@mui/icons-material/CreditCardOutlined';
import SignOutIcon from '@mui/icons-material/ExitToApp';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import { type FC, type ReactNode, useCallback, useEffect } from 'react';
import { getCondensedRoutes, getRoutes } from '../../../menu/routes';
import { useAdminRoutes } from '../../../admin/useAdminRoutes';
import { filterByConfig, mapRouteLink } from 'component/common/util';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import type { INavigationMenuItem } from 'interfaces/route';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GitHubIcon from '@mui/icons-material/GitHub';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { basePath } from 'utils/formatPath';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { Theme } from '@mui/material/styles/createTheme';

export const StyledProjectIcon = styled(ProjectIcon)(({ theme }) => ({
    fill: theme.palette.neutral.main,
    stroke: theme.palette.neutral.main,
    // same as built-in icons
    width: theme.spacing(3),
    height: theme.spacing(3),
    fontSize: theme.spacing(3),
}));

const StyledBadgeContainer = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    display: 'flex',
}));

const EnterprisePlanBadge = () => (
    <Tooltip title='This is an Enterprise feature'>
        <StyledBadgeContainer>
            <EnterpriseBadge />
        </StyledBadgeContainer>
    </Tooltip>
);

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&:hover': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
}));

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&:hover': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const FullListItem: FC<{
    href: string;
    text: string;
    badge?: ReactNode;
    onClick?: () => void;
}> = ({ href, text, badge, onClick, children }) => {
    return (
        <ListItem disablePadding onClick={onClick}>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
            >
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText sx={{ whiteSpace: 'nowrap' }} primary={text} />
                {badge}
            </ListItemButton>
        </ListItem>
    );
};

const ExternalFullListItem: FC<{ href: string; text: string }> = ({
    href,
    text,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                rel='noopener noreferrer'
                target='_blank'
            >
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    );
};

const SignOutItem = () => {
    return (
        <form method='POST' action={`${basePath}/logout`}>
            <ListItem disablePadding>
                <ListItemButton dense={true} component='button' type='submit'>
                    <ListItemIcon
                        sx={(theme) => ({ minWidth: theme.spacing(4) })}
                    >
                        <SignOutIcon />
                    </ListItemIcon>
                    <ListItemText primary='Sign out' />
                </ListItemButton>
            </ListItem>
        </form>
    );
};

const MiniListItem: FC<{ href: string; text: string }> = ({
    href,
    text,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
            >
                <Tooltip title={text} placement='right'>
                    <ListItemIcon
                        sx={(theme) => ({ minWidth: theme.spacing(4) })}
                    >
                        {children}
                    </ListItemIcon>
                </Tooltip>
            </ListItemButton>
        </ListItem>
    );
};

export const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 1, 6, 1),
}));

const icons: Record<string, typeof SvgIcon> = {
    '/applications': ApplicationsIcon,
    '/context': ContextFieldsIcon,
    '/feature-toggle-type': FlagTypesIcon,
    '/integrations': IntegrationsIcon,
    '/segments': SegmentsIcon,
    '/strategies': CustomStrategiesIcon,
    '/tag-types': TagTypesIcon,
    '/environments': EnvironmentsIcon,
    '/admin/users': UsersIcon,
    '/admin/service-accounts': ServiceAccountIcon,
    '/admin/groups': GroupsIcon,
    '/admin/roles': RoleIcon,
    '/admin/api': ApiAccessIcon,
    '/admin/auth': SingleSignOnIcon,
    '/admin/network': NetworkIcon,
    '/admin/maintenance': MaintenanceIcon,
    '/admin/banners': BannersIcon,
    '/admin/instance': InstanceStatsIcon,
    '/admin/license': LicenseIcon,
    '/admin/instance-privacy': InstancePrivacyIcon,
    '/admin/logins': LoginHistoryIcon,
    '/admin/cors': CorsIcon,
    '/admin/billing': BillingIcon,
    '/history': EventLogIcon,
    GitHub: GitHubIcon,
    Documentation: LibraryBooksIcon,
};

const findIconByPath = (path: string) => {
    return icons[path] || EmptyIcon;
};

const IconRenderer: FC<{ path: string }> = ({ path }) => {
    const IconComponent = findIconByPath(path); // Fallback to 'default' if the type is not found

    return <IconComponent />;
};

const ShowHide: FC<{ mode: 'full' | 'mini'; onChange: () => void }> = ({
    mode,
    onChange,
}) => {
    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: theme.spacing(2, 1, 0, mode === 'mini' ? 1 : 2),
            })}
        >
            {mode === 'full' && (
                <Box
                    sx={(theme) => ({
                        color: theme.palette.neutral.main,
                        fontSize: 'small',
                    })}
                >
                    Hide (⌘ + B)
                </Box>
            )}
            <IconButton onClick={onChange}>
                {mode === 'full' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
        </Box>
    );
};

const useRoutes = () => {
    const { uiConfig } = useUiConfig();
    const routes = getRoutes();
    const adminRoutes = useAdminRoutes();

    const filteredMainRoutes = {
        mainNavRoutes: getCondensedRoutes(routes.mainNavRoutes)
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        mobileRoutes: getCondensedRoutes(routes.mobileRoutes)
            .filter(filterByConfig(uiConfig))
            .map(mapRouteLink),
        adminRoutes,
    };

    return { routes: filteredMainRoutes };
};

const useShowBadge = () => {
    const { isPro } = useUiConfig();

    const showBadge = useCallback(
        (mode?: INavigationMenuItem['menu']['mode']) => {
            return !!(
                isPro() &&
                !mode?.includes('pro') &&
                mode?.includes('enterprise')
            );
        },
        [isPro],
    );
    return showBadge;
};

const useNavigationMode = () => {
    const [mode, setMode] = useLocalStorageState<'mini' | 'full'>(
        'navigation-mode:v1',
        'full',
    );
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setMode(mode === 'mini' ? 'full' : 'mini');
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [mode]);

    return [mode, setMode] as const;
};

const MainNavigationList: FC<{ mode: 'mini' | 'full'; onClick?: () => void }> =
    ({ mode, onClick }) => {
        const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

        return (
            <List>
                <DynamicListItem
                    href='/projects'
                    text='Projects'
                    onClick={onClick}
                >
                    <StyledProjectIcon />
                </DynamicListItem>
                <DynamicListItem href='/search' text='Search' onClick={onClick}>
                    <SearchIcon />
                </DynamicListItem>
                <DynamicListItem
                    href='/playground'
                    text='Playground'
                    onClick={onClick}
                >
                    <PlaygroundIcon />
                </DynamicListItem>
                <DynamicListItem
                    href='/insights'
                    text='Insights'
                    onClick={onClick}
                >
                    <InsightsIcon />
                </DynamicListItem>
            </List>
        );
    };

const ConfigureNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: 'mini' | 'full';
    onClick?: () => void;
}> = ({ routes, mode, onClick }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            {routes.map((route) => (
                <DynamicListItem
                    href={route.path}
                    text={route.title}
                    onClick={onClick}
                >
                    <IconRenderer path={route.path} />
                </DynamicListItem>
            ))}
        </List>
    );
};

const AdminNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: 'mini' | 'full';
    badge?: ReactNode;
    onClick?: () => void;
}> = ({ routes, mode, onClick, badge }) => {
    const showBadge = useShowBadge();
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            {routes.map((route) => (
                <DynamicListItem
                    onClick={onClick}
                    href={route.path}
                    text={route.title}
                    badge={
                        showBadge(route?.menu?.mode) ? (
                            <EnterprisePlanBadge />
                        ) : null
                    }
                >
                    <IconRenderer path={route.path} />
                </DynamicListItem>
            ))}
        </List>
    );
};

const OtherLinksList = () => {
    const { uiConfig } = useUiConfig();

    return (
        <List>
            {uiConfig.links.map((link) => (
                <ExternalFullListItem href={link.href} text={link.value}>
                    <IconRenderer path={link.value} />
                </ExternalFullListItem>
            ))}
            <SignOutItem />
        </List>
    );
};

export const MobileNavigationSidebar: FC<{ onClick: () => void }> = ({
    onClick,
}) => {
    const { routes } = useRoutes();

    return (
        <>
            <MainNavigationList mode='full' onClick={onClick} />
            <ConfigureNavigationList
                routes={routes.mainNavRoutes}
                mode='full'
                onClick={onClick}
            />
            <AdminNavigationList
                routes={routes.adminRoutes}
                mode='full'
                onClick={onClick}
            />
            <OtherLinksList />
        </>
    );
};

export const NavigationSidebar = () => {
    const { routes } = useRoutes();

    const [mode, setMode] = useNavigationMode();

    return (
        <StyledBox>
            <MainNavigationList mode={mode} />
            <Accordion disableGutters={true} sx={{ boxShadow: 'none' }}>
                {mode === 'full' && (
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='configure-content'
                        id='configure-header'
                    >
                        <Typography
                            sx={{ fontWeight: 'bold', fontSize: 'small' }}
                        >
                            Configure
                        </Typography>
                    </AccordionSummary>
                )}
                <AccordionDetails sx={{ p: 0 }}>
                    <ConfigureNavigationList
                        routes={routes.mainNavRoutes}
                        mode={mode}
                    />
                </AccordionDetails>
            </Accordion>
            <Accordion disableGutters={true} sx={{ boxShadow: 'none' }}>
                {mode === 'full' && (
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='admin-content'
                        id='admin-header'
                    >
                        <Typography
                            sx={{ fontWeight: 'bold', fontSize: 'small' }}
                        >
                            Admin
                        </Typography>
                    </AccordionSummary>
                )}

                <AccordionDetails sx={{ p: 0 }}>
                    <AdminNavigationList
                        routes={routes.adminRoutes}
                        mode={mode}
                    />
                </AccordionDetails>
            </Accordion>
            <ShowHide
                mode={mode}
                onChange={() => {
                    setMode(mode === 'full' ? 'mini' : 'full');
                }}
            />
        </StyledBox>
    );
};
