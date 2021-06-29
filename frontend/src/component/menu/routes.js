import CreateFeatureToggle from '../../page/features/create';
import CopyFeatureToggle from '../../page/features/copy';
import ViewFeatureToggle from '../../page/features/show';
import Features from '../../page/features';
import CreateStrategies from '../../page/strategies/create';
import StrategyView from '../../page/strategies/show';
import Strategies from '../../page/strategies';
import HistoryPage from '../../page/history';
import HistoryTogglePage from '../../page/history/toggle';
import ShowArchive from '../../page/archive/show';
import Archive from '../../page/archive';
import Applications from '../../page/applications';
import ApplicationView from '../../page/applications/view';
import ContextFields from '../../page/context';
import CreateContextField from '../../page/context/create';
import EditContextField from '../../page/context/edit';
import LogoutFeatures from '../../page/user/logout';
import ListProjects from '../../page/project';
import CreateProject from '../../page/project/create';
import EditProject from '../../page/project/edit';
import ViewProject from '../../page/project/view';
import EditProjectAccess from '../../page/project/access';
import ListTagTypes from '../../page/tag-types';
import CreateTagType from '../../page/tag-types/create';
import EditTagType from '../../page/tag-types/edit';
import ListTags from '../../page/tags';
import CreateTag from '../../page/tags/create';
import Addons from '../../page/addons';
import AddonsCreate from '../../page/addons/create';
import AddonsEdit from '../../page/addons/edit';
import Admin from '../../page/admin';
import AdminApi from '../../page/admin/api';
import AdminUsers from '../../page/admin/users';
import AdminInvoice from '../../page/admin/invoice';
import AdminAuth from '../../page/admin/auth';
import Reporting from '../../page/reporting';
import Login from '../user/Login';
import { P, C } from '../common/flags';
import NewUser from '../user/NewUser';
import ResetPassword from '../user/ResetPassword/ResetPassword';
import ForgottenPassword from '../user/ForgottenPassword/ForgottenPassword';

import {
    List,
    Extension,
    History,
    Archive as ArchiveIcon,
    Apps,
    Label,
    DeviceHub,
    Album,
    ExitToApp,
    FolderOpen,
    Report,
    Money,
    Person,
} from '@material-ui/icons';

export const routes = [
    // Features
    {
        path: '/features/create',
        parent: '/features',
        title: 'Create',
        component: CreateFeatureToggle,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/features/copy/:copyToggle',
        parent: '/features',
        title: 'Copy',
        component: CopyFeatureToggle,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/features/:activeTab/:name',
        parent: '/features',
        title: ':name',
        component: ViewFeatureToggle,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/features',
        title: 'Feature Toggles',
        icon: List,
        component: Features,
        type: 'protected',
        layout: 'main',
    },

    // Strategies
    {
        path: '/strategies/create',
        title: 'Create',
        parent: '/strategies',
        component: CreateStrategies,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/strategies/:activeTab/:strategyName',
        title: ':strategyName',
        parent: '/strategies',
        component: StrategyView,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/strategies',
        title: 'Strategies',
        icon: Extension,
        component: Strategies,
        type: 'protected',
        layout: 'main',
    },

    // History
    {
        path: '/history/:toggleName',
        title: ':toggleName',
        parent: '/history',
        component: HistoryTogglePage,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/history',
        title: 'Event History',
        icon: History,
        component: HistoryPage,
        type: 'protected',
        layout: 'main',
    },

    // Archive
    {
        path: '/archive/:activeTab/:name',
        title: ':name',
        parent: '/archive',
        component: ShowArchive,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/archive',
        title: 'Archived Toggles',
        icon: ArchiveIcon,
        component: Archive,
        type: 'protected',
        layout: 'main',
    },

    // Applications
    {
        path: '/applications/:name',
        title: ':name',
        parent: '/applications',
        component: ApplicationView,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/applications',
        title: 'Applications',
        icon: Apps,
        component: Applications,
        type: 'protected',
        layout: 'main',
    },

    // Context
    {
        path: '/context/create',
        parent: '/context',
        title: 'Create',
        component: CreateContextField,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/context/edit/:name',
        parent: '/context',
        title: ':name',
        component: EditContextField,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/context',
        title: 'Context Fields',
        icon: Album,
        component: ContextFields,
        type: 'protected',
        flag: C,
        layout: 'main',
    },

    // Project
    {
        path: '/projects/create',
        parent: '/projects',
        title: 'Create',
        component: CreateProject,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/projects/edit/:id',
        parent: '/projects',
        title: ':id',
        component: EditProject,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/projects/view/:id',
        parent: '/projects',
        title: ':id',
        component: ViewProject,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/projects/:id/access',
        parent: '/projects',
        title: ':id',
        component: EditProjectAccess,
        type: 'protected',
        layout: 'main',
    },

    {
        path: '/projects',
        title: 'Projects',
        icon: FolderOpen,
        component: ListProjects,
        flag: P,
        type: 'protected',
        layout: 'main',
    },

    {
        path: '/tag-types/create',
        parent: '/tag-types',
        title: 'Create',
        component: CreateTagType,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/tag-types/edit/:name',
        parent: '/tag-types',
        title: ':name',
        component: EditTagType,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/tag-types',
        title: 'Tag types',
        icon: Label,
        component: ListTagTypes,
        type: 'protected',
        layout: 'main',
    },

    {
        path: '/tags/create',
        parent: '/tags',
        title: 'Create',
        component: CreateTag,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/tags',
        title: 'Tags',
        icon: Label,
        component: ListTags,
        hidden: true,
        type: 'protected',
        layout: 'main',
    },

    // Addons
    {
        path: '/addons/create/:provider',
        parent: '/addons',
        title: 'Create',
        component: AddonsCreate,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/addons/edit/:id',
        parent: '/addons',
        title: 'Edit',
        component: AddonsEdit,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/addons',
        title: 'Addons',
        icon: DeviceHub,
        component: Addons,
        hidden: false,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/reporting',
        title: 'Reporting',
        icon: Report,
        component: Reporting,
        type: 'protected',
        layout: 'main',
    },
    // Admin
    {
        path: '/admin/api',
        parent: '/admin',
        title: 'API access',
        component: AdminApi,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/admin/users',
        parent: '/admin',
        title: 'Users',
        component: AdminUsers,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/admin/auth',
        parent: '/admin',
        title: 'Authentication',
        component: AdminAuth,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/admin-invoices',
        title: 'Invoices',
        icon: Money,
        component: AdminInvoice,
        hidden: true,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/admin',
        title: 'Admin',
        icon: Album,
        component: Admin,
        hidden: false,
        type: 'protected',
        layout: 'main',
    },
    {
        path: '/logout',
        title: 'Sign out',
        icon: ExitToApp,
        component: LogoutFeatures,
        type: 'unprotected',
        layout: 'main',
    },
    {
        path: '/login',
        title: 'Log in',
        icon: Person,
        component: Login,
        type: 'unprotected',
        hidden: true,
        layout: 'standalone',
    },
    {
        path: '/new-user',
        title: 'New user',
        hidden: true,
        component: NewUser,
        type: 'unprotected',
        layout: 'standalone',
    },
    {
        path: '/reset-password',
        title: 'reset-password',
        hidden: true,
        component: ResetPassword,
        type: 'unprotected',
        layout: 'standalone',
    },
    {
        path: '/forgotten-password',
        title: 'reset-password',
        hidden: true,
        component: ForgottenPassword,
        type: 'unprotected',
        layout: 'standalone',
    },
];

export const getRoute = path => routes.find(route => route.path === path);

export const baseRoutes = routes
    .filter(route => !route.hidden)
    .filter(route => !route.parent);
