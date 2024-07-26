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
import SearchIcon from '@mui/icons-material/Search';
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
import type { FC } from 'react';

// TODO: move to routes
const icons: Record<string, typeof SvgIcon> = {
    '/search': SearchIcon,
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

const findIcon = (key: string) => {
    return icons[key] || EmptyIcon;
};

export const IconRenderer: FC<{ path: string }> = ({ path }) => {
    const IconComponent = findIcon(path); // Fallback to 'default' if the type is not found

    return <IconComponent />;
};
