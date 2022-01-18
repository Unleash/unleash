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
import CreateProject from '../../page/project/create';
import ListTagTypes from '../../page/tag-types';
import CreateTagType from '../../page/tag-types/create';
import EditTagType from '../../page/tag-types/edit';
import ListTags from '../../page/tags';
import CreateTag from '../../page/tags/create';
import Addons from '../../page/addons';
import AddonsCreate from '../../page/addons/create';
import AddonsEdit from '../../page/addons/edit';
import Admin from '../admin';
import AdminApi from '../admin/api';
import AdminUsers from '../admin/users';
import AdminInvoice from '../admin/invoice';
import AdminAuth from '../admin/auth';
import Login from '../user/Login/Login';
import { P, C, E, EEA, RE } from '../common/flags';
import NewUser from '../user/NewUser';
import ResetPassword from '../user/ResetPassword/ResetPassword';
import ForgottenPassword from '../user/ForgottenPassword/ForgottenPassword';
import ProjectListNew from '../project/ProjectList/ProjectList';
import Project from '../project/Project/Project';
import RedirectFeatureViewPage from '../../page/features/redirect';
import RedirectArchive from '../feature/RedirectArchive/RedirectArchive';
import EnvironmentList from '../environments/EnvironmentList/EnvironmentList';
import FeatureView2 from '../feature/FeatureView2/FeatureView2';
import FeatureCreate from '../feature/FeatureCreate/FeatureCreate';
import ProjectRoles from '../admin/project-roles/ProjectRoles/ProjectRoles';
import CreateProjectRole from '../admin/project-roles/CreateProjectRole/CreateProjectRole';
import EditProjectRole from '../admin/project-roles/EditProjectRole/EditProjectRole';
import CreateApiToken from '../admin/api-token/CreateApiToken/CreateApiToken';
import CreateEnvironment from '../environments/CreateEnvironment/CreateEnvironment';
import EditEnvironment from '../environments/EditEnvironment/EditEnvironment';


export const routes = [
    // Project

    {
        path: '/projects/create',
        parent: '/projects',
        title: 'Create',
        component: CreateProject,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:id/archived',
        title: ':name',
        parent: '/archive',
        component: RedirectArchive,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:id/features/:name/:activeTab/copy',
        parent: '/projects/:id/features/:name/:activeTab',
        title: 'Copy',
        component: CopyFeatureToggle,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:id/features2/:name/:activeTab/copy',
        parent: '/projects/:id/features/:name/:activeTab',
        title: 'Copy',
        component: CopyFeatureToggle,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/features2/:featureId',
        parent: '/projects',
        title: 'FeatureView2',
        component: FeatureView2,
        type: 'protected',
        layout: 'main',
        flags: E,
        menu: {},
    },
    {
        path: '/projects/:id/features/:name/:activeTab',
        parent: '/projects',
        title: ':name',
        component: ViewFeatureToggle,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/create-toggle',
        parent: '/projects/:id/features',
        title: 'Create feature toggle',
        component: FeatureCreate,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:name',
        parent: '/features',
        title: ':name',
        component: RedirectFeatureViewPage,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:id/:activeTab',
        parent: '/projects',
        title: ':id',
        component: Project,
        flag: P,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:id',
        parent: '/projects',
        title: ':id',
        component: Project,
        flag: P,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects',
        title: 'Projects',
        component: ProjectListNew,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true },
    },

    // Features
    {
        path: '/features/:activeTab/:name',
        parent: '/features',
        title: ':name',
        component: RedirectFeatureViewPage,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/features',
        title: 'Feature Toggles',
        component: Features,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true },
    },

    // Applications
    {
        path: '/applications/:name',
        title: ':name',
        parent: '/applications',
        component: ApplicationView,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/applications',
        title: 'Applications',
        component: Applications,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },

    // Context
    {
        path: '/context/create',
        parent: '/context',
        title: 'Create',
        component: CreateContextField,
        type: 'protected',
        layout: 'main',
        flag: C,
        menu: {},
    },
    {
        path: '/context/edit/:name',
        parent: '/context',
        title: ':name',
        component: EditContextField,
        type: 'protected',
        layout: 'main',
        flag: C,
        menu: {},
    },
    {
        path: '/context',
        title: 'Context Fields',
        component: ContextFields,
        type: 'protected',
        flag: C,
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },

    // Strategies
    {
        path: '/strategies/create',
        title: 'Create',
        parent: '/strategies',
        component: CreateStrategies,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/strategies/:activeTab/:strategyName',
        title: ':strategyName',
        parent: '/strategies',
        component: StrategyView,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/strategies',
        title: 'Strategies',
        component: Strategies,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },
    {
        path: '/environments/create',
        title: 'Environments',
        component: CreateEnvironment,
        parent: '/environments',
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/environments/:id',
        title: 'Edit',
        component: EditEnvironment,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/environments',
        title: 'Environments',
        component: EnvironmentList,
        type: 'protected',
        layout: 'main',
        flag: EEA,
        menu: { mobile: true, advanced: true },
    },

    // Tags
    {
        path: '/tag-types/create',
        parent: '/tag-types',
        title: 'Create',
        component: CreateTagType,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/tag-types/edit/:name',
        parent: '/tag-types',
        title: ':name',
        component: EditTagType,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/tag-types',
        title: 'Tag types',
        component: ListTagTypes,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },
    {
        path: '/tags/create',
        parent: '/tags',
        title: 'Create',
        component: CreateTag,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/tags',
        title: 'Tags',
        component: ListTags,
        hidden: true,
        type: 'protected',
        layout: 'main',
        menu: {},
    },

    // Addons
    {
        path: '/addons/create/:provider',
        parent: '/addons',
        title: 'Create',
        component: AddonsCreate,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/addons/edit/:id',
        parent: '/addons',
        title: 'Edit',
        component: AddonsEdit,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/addons',
        title: 'Addons',
        component: Addons,
        hidden: false,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },

    // History
    {
        path: '/history/:toggleName',
        title: ':toggleName',
        parent: '/history',
        component: HistoryTogglePage,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/history',
        title: 'Event History',
        component: HistoryPage,
        type: 'protected',
        layout: 'main',
        menu: { adminSettings: true },
    },

    // Archive
    {
        path: '/projects/:id/archived/:name/:activeTab',
        title: ':name',
        parent: '/archive',
        component: ShowArchive,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/archive',
        title: 'Archived Toggles',
        component: Archive,
        type: 'protected',
        layout: 'main',
        menu: {},
    },

    // Admin
    {
        path: '/admin/api/create-token',
        parent: '/admin',
        title: 'API access',
        component: CreateApiToken,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/admin/create-project-role',
        title: 'Create',
        component: CreateProjectRole,
        type: 'protected',
        layout: 'main',
        menu: {},
        flag: RE,
    },
    {
        path: '/admin/roles/:id/edit',
        title: 'Edit',
        component: EditProjectRole,
        type: 'protected',
        layout: 'main',
        menu: {},
        flag: RE,
    },
    {
        path: '/admin/api',
        parent: '/admin',
        title: 'API access',
        component: AdminApi,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },
    {
        path: '/admin/users',
        parent: '/admin',
        title: 'Users',
        component: AdminUsers,
        type: 'protected',
        layout: 'main',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/auth',
        parent: '/admin',
        title: 'Single Sign-On',
        component: AdminAuth,
        type: 'protected',
        layout: 'main',
        menu: { adminSettings: true },
    },
    {
        path: '/admin-invoices',
        title: 'Invoices',
        component: AdminInvoice,
        hidden: true,
        type: 'protected',
        layout: 'main',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/roles',
        parent: '/admin',
        title: 'Project Roles',
        component: ProjectRoles,
        type: 'protected',
        layout: 'main',
        flag: RE,
        menu: { adminSettings: true },
    },
    {
        path: '/admin',
        title: 'Admin',
        component: Admin,
        hidden: false,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/login',
        title: 'Log in',
        component: Login,
        type: 'unprotected',
        hidden: true,
        layout: 'standalone',
        menu: {},
    },
    {
        path: '/new-user',
        title: 'New user',
        hidden: true,
        component: NewUser,
        type: 'unprotected',
        layout: 'standalone',
        menu: {},
    },
    {
        path: '/reset-password',
        title: 'reset-password',
        hidden: true,
        component: ResetPassword,
        type: 'unprotected',
        layout: 'standalone',
        menu: {},
    },
    {
        path: '/forgotten-password',
        title: 'reset-password',
        hidden: true,
        component: ForgottenPassword,
        type: 'unprotected',
        layout: 'standalone',
        menu: {},
    },
];

export const getRoute = path => routes.find(route => route.path === path);

export const baseRoutes = routes.filter(route => !route.hidden);

const computeRoutes = () => {
    const mainNavRoutes = baseRoutes.filter(route => route.menu.advanced);
    const adminRoutes = routes.filter(route => route.menu.adminSettings);
    const mobileRoutes = routes.filter(route => route.menu.mobile);

    const computedRoutes = {
        mainNavRoutes,
        adminRoutes,
        mobileRoutes,
    };
    return () => {
        return computedRoutes;
    };
};

export const getRoutes = computeRoutes();
