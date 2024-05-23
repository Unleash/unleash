import {
    Box,
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
import { type FC, useCallback } from 'react';
import { getCondensedRoutes, getRoutes } from '../../../menu/routes';
import { useAdminRoutes } from '../../../admin/useAdminRoutes';
import { filterByConfig, mapRouteLink } from '../../../common/util';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { INavigationMenuItem } from 'interfaces/route';

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

const StyledListItem: FC<{ href: string; text: string; badge?: boolean }> = ({
    href,
    text,
    badge = false,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton dense={true} component={Link} to={href}>
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText primary={text} />
                <ConditionallyRender
                    condition={badge}
                    show={
                        <Tooltip title='This is an Enterprise feature'>
                            <StyledBadgeContainer>
                                <EnterpriseBadge />
                            </StyledBadgeContainer>
                        </Tooltip>
                    }
                />
            </ListItemButton>
        </ListItem>
    );
};

export const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    pt: theme.spacing(3),
    pb: theme.spacing(3),
    minHeight: '95vh',
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

export const NavigationSidebar = () => {
    const { routes, showBadge } = useRoutes();

    return (
        <StyledBox>
            <List>
                <StyledListItem href='/projects' text='Projects'>
                    <StyledProjectIcon />
                </StyledListItem>
                <StyledListItem href='/search' text='Search'>
                    <SearchIcon />
                </StyledListItem>
                <StyledListItem href='/playground' text='Playground'>
                    <PlaygroundIcon />
                </StyledListItem>
                <StyledListItem href='/insights' text='Insights'>
                    <InsightsIcon />
                </StyledListItem>
            </List>
            <Accordion disableGutters={true} sx={{ boxShadow: 'none' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='configure-content'
                    id='configure-header'
                >
                    <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                        Configure
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <List>
                        {routes.mainNavRoutes.map((route) => (
                            <StyledListItem
                                href={route.path}
                                text={route.title}
                            >
                                <IconRenderer path={route.path} />
                            </StyledListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
            <Accordion disableGutters={true} sx={{ boxShadow: 'none' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='admin-content'
                    id='admin-header'
                >
                    <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                        Admin
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <List>
                        {routes.adminRoutes.map((route) => (
                            <StyledListItem
                                href={route.path}
                                text={route.title}
                                badge={showBadge(route?.menu?.mode)}
                            >
                                <IconRenderer path={route.path} />
                            </StyledListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        </StyledBox>
    );
};
