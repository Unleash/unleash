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
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import {
    type FC,
    type ReactNode,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { getCondensedRoutes, getRoutes } from '../../../menu/routes';
import { useAdminRoutes } from '../../../admin/useAdminRoutes';
import { filterByConfig, mapRouteLink } from 'component/common/util';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import type { INavigationMenuItem } from 'interfaces/route';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

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

const FullListItem: FC<{ href: string; text: string; badge?: ReactNode }> = ({
    href,
    text,
    badge,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton dense={true} component={Link} to={href}>
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText primary={text} />
                {badge}
            </ListItemButton>
        </ListItem>
    );
};

const MiniListItem: FC<{ href: string; text: string }> = ({
    href,
    text,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton dense={true} component={Link} to={href}>
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(6),
    height: '100%',
    position: 'absolute',
    zIndex: theme.zIndex.sticky,
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
                margin: theme.spacing(2, 1, 0, 2),
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
    const { uiConfig, isPro } = useUiConfig();
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

    return { routes: filteredMainRoutes, showBadge };
};

const useNavigationMode = () => {
    const [mode, setMode] = useState<'mini' | 'full'>('full');
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

export const NavigationSidebar = () => {
    const { routes, showBadge } = useRoutes();

    const [mode, setMode] = useNavigationMode();

    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <StyledBox>
            <List>
                <DynamicListItem href='/projects' text='Projects'>
                    <StyledProjectIcon />
                </DynamicListItem>
                <DynamicListItem href='/search' text='Search'>
                    <SearchIcon />
                </DynamicListItem>
                <DynamicListItem href='/playground' text='Playground'>
                    <PlaygroundIcon />
                </DynamicListItem>
                <DynamicListItem href='/insights' text='Insights'>
                    <InsightsIcon />
                </DynamicListItem>
            </List>
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
                    <List>
                        {routes.mainNavRoutes.map((route) => (
                            <DynamicListItem
                                href={route.path}
                                text={route.title}
                            >
                                <IconRenderer path={route.path} />
                            </DynamicListItem>
                        ))}
                    </List>
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
                    <List>
                        {routes.adminRoutes.map((route) => (
                            <DynamicListItem
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
