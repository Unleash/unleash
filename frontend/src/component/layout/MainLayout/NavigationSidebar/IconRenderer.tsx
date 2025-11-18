import { useMemo, type ComponentProps, type FC } from 'react';
import EmptyIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import ApplicationsIcon from '@mui/icons-material/AppsOutlined';
import ContextFieldsIcon from '@mui/icons-material/AccountTreeOutlined';
import FlagTypesIcon from '@mui/icons-material/OutlinedFlag';
import IntegrationsIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import SegmentsIcon from '@mui/icons-material/DonutLargeOutlined';
import CustomStrategiesIcon from '@mui/icons-material/ExtensionOutlined';
import TagTypesIcon from '@mui/icons-material/LabelImportantOutlined';
import EnvironmentsIcon from '@mui/icons-material/CloudOutlined';
import UsersIcon from '@mui/icons-material/GroupOutlined';
import ServiceAccountIcon from '@mui/icons-material/Computer';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import RoleIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import ImpactMetricsIcon from '@mui/icons-material/TrendingUpOutlined';
import ApiAccessIcon from '@mui/icons-material/KeyOutlined';
import SingleSignOnIcon from '@mui/icons-material/AssignmentOutlined';
import NetworkIcon from '@mui/icons-material/HubOutlined';
import MaintenanceIcon from '@mui/icons-material/BuildOutlined';
import BannersIcon from '@mui/icons-material/ViewCarousel';
import InstanceStatsIcon from '@mui/icons-material/QueryStatsOutlined';
import LicenseIcon from '@mui/icons-material/ReceiptLongOutlined';
import InstancePrivacyIcon from '@mui/icons-material/ShieldOutlined';
import LoginHistoryIcon from '@mui/icons-material/HistoryOutlined';
import CorsIcon from '@mui/icons-material/StorageOutlined';
import BillingIcon from '@mui/icons-material/CreditCardOutlined';
import EventLogIcon from '@mui/icons-material/EventNoteOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PersonalDashboardIcon from '@mui/icons-material/DashboardOutlined';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import BuildIcon from '@mui/icons-material/BuildOutlined';
import { ChangeRequestIcon } from 'component/common/ChangeRequestIcon/ChangeRequestIcon';

// TODO: move to routes
const icons: Record<
    string,
    typeof SvgIcon | FC<ComponentProps<typeof SvgIcon>>
> = {
    '/search': FlagOutlinedIcon,
    '/insights': InsightsIcon,
    '/impact-metrics': ImpactMetricsIcon,
    '/applications': ApplicationsIcon,
    '/context': ContextFieldsIcon,
    '/feature-toggle-type': FlagTypesIcon,
    '/integrations': IntegrationsIcon,
    '/segments': SegmentsIcon,
    '/strategies': CustomStrategiesIcon,
    '/tag-types': TagTypesIcon,
    '/environments': EnvironmentsIcon,
    '/admin': SettingsIcon,
    '/admin/users': UsersIcon,
    '/admin/service-accounts': ServiceAccountIcon,
    '/admin/groups': GroupsIcon,
    '/admin/roles': RoleIcon,
    '/admin/roles/project-roles': RoleIcon,
    '/admin/api': ApiAccessIcon,
    '/admin/auth': SingleSignOnIcon,
    '/admin/auth/oidc': SingleSignOnIcon,
    '/admin/auth/saml': SingleSignOnIcon,
    '/admin/auth/scim': SingleSignOnIcon,
    '/admin/auth/password': SingleSignOnIcon,
    '/admin/auth/google': SingleSignOnIcon,
    '/admin/network': NetworkIcon,
    '/admin/network/traffic': NetworkIcon,
    '/admin/network/data-usage': NetworkIcon,
    '/admin/network/frontend-data-usage': NetworkIcon,
    '/admin/network/connected-edges': NetworkIcon,
    '/admin/network/backend-connections': NetworkIcon,
    '/admin/maintenance': MaintenanceIcon,
    '/admin/banners': BannersIcon,
    '/admin/instance': InstanceStatsIcon,
    '/admin/license': LicenseIcon,
    '/admin/instance-privacy': InstancePrivacyIcon,
    '/admin/logins': LoginHistoryIcon,
    '/admin/cors': CorsIcon,
    '/admin/billing': BillingIcon,
    '/history': EventLogIcon,
    '/release-templates': FactCheckOutlinedIcon,
    '/personal': PersonalDashboardIcon,
    '/projects': ProjectIcon,
    '/playground': PlaygroundIcon,
    '/custom-metrics': RocketLaunchIcon,
    '/change-requests': ChangeRequestIcon,
    GitHub: GitHubIcon,
    Documentation: LibraryBooksIcon,
    Configure: BuildIcon,
};

export const IconRenderer: FC<{ path: string }> = ({ path }) => {
    const IconComponent = useMemo(() => icons[path] || EmptyIcon, [path]); // Fallback to 'default' if the type is not found

    return <IconComponent />;
};
