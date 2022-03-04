import { FeatureToggleListContainer } from '../feature/FeatureToggleList/FeatureToggleListContainer';
import { StrategyView } from '../strategies/StrategyView/StrategyView';
import { StrategiesList } from '../strategies/StrategiesList/StrategiesList';
import { ArchiveListContainer } from '../archive/ArchiveListContainer';
import { TagTypeList } from '../tags/TagTypeList/TagTypeList';
import { AddonList } from '../addons/AddonList/AddonList';
import Admin from '../admin';
import AdminApi from '../admin/api';
import AdminInvoice from '../admin/invoice/InvoiceAdminPage';
import AdminUsers from '../admin/users/UsersAdmin';
import { AuthSettings } from '../admin/auth/AuthSettings';
import Login from '../user/Login/Login';
import { P, C, E, EEA, RE } from '../common/flags';
import { NewUser } from '../user/NewUser/NewUser';
import ResetPassword from '../user/ResetPassword/ResetPassword';
import ForgottenPassword from '../user/ForgottenPassword/ForgottenPassword';
import { ProjectListNew } from '../project/ProjectList/ProjectList';
import Project from '../project/Project/Project';
import RedirectArchive from '../archive/RedirectArchive';
import EnvironmentList from '../environments/EnvironmentList/EnvironmentList';
import { FeatureView } from '../feature/FeatureView/FeatureView';
import ProjectRoles from '../admin/project-roles/ProjectRoles/ProjectRoles';
import CreateProjectRole from '../admin/project-roles/CreateProjectRole/CreateProjectRole';
import EditProjectRole from '../admin/project-roles/EditProjectRole/EditProjectRole';
import CreateUser from '../admin/users/CreateUser/CreateUser';
import EditUser from '../admin/users/EditUser/EditUser';
import { CreateApiToken } from '../admin/api-token/CreateApiToken/CreateApiToken';
import CreateEnvironment from '../environments/CreateEnvironment/CreateEnvironment';
import EditEnvironment from '../environments/EditEnvironment/EditEnvironment';
import { CreateContext } from '../context/CreateContext/CreateContext';
import { EditContext } from '../context/EditContext/EditContext';
import EditTagType from '../tags/EditTagType/EditTagType';
import CreateTagType from '../tags/CreateTagType/CreateTagType';
import EditProject from '../project/Project/EditProject/EditProject';
import CreateProject from '../project/Project/CreateProject/CreateProject';
import CreateFeature from '../feature/CreateFeature/CreateFeature';
import EditFeature from '../feature/EditFeature/EditFeature';
import { ApplicationEdit } from '../application/ApplicationEdit/ApplicationEdit';
import { ApplicationList } from '../application/ApplicationList/ApplicationList';
import ContextList from '../context/ContextList/ContextList';
import RedirectFeatureView from '../feature/RedirectFeatureView/RedirectFeatureView';
import { CreateAddon } from '../addons/CreateAddon/CreateAddon';
import { EditAddon } from '../addons/EditAddon/EditAddon';
import { CopyFeatureToggle } from '../feature/CopyFeature/CopyFeature';
import { EventHistoryPage } from '../history/EventHistoryPage/EventHistoryPage';
import { FeatureEventHistoryPage } from '../history/FeatureEventHistoryPage/FeatureEventHistoryPage';
import { CreateStrategy } from '../strategies/CreateStrategy/CreateStrategy';
import { EditStrategy } from '../strategies/EditStrategy/EditStrategy';

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
        path: '/projects/:id/edit',
        parent: '/projects',
        title: ':id',
        component: EditProject,
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
        path: '/projects/:id/features/:name/:activeTab/copy',
        parent: '/projects/:id/features/:name/:activeTab',
        title: 'Copy',
        component: CopyFeatureToggle,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId/edit',
        parent: '/projects',
        title: 'Edit Feature',
        component: EditFeature,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId',
        parent: '/projects',
        title: 'FeatureView',
        component: FeatureView,
        type: 'protected',
        layout: 'main',
        flags: E,
        menu: {},
    },
    {
        path: '/projects/:id/features/:name/:activeTab',
        parent: '/projects',
        title: ':name',
        component: FeatureView,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/create-toggle',
        parent: '/projects/:id/features',
        title: 'Create feature toggle',
        component: CreateFeature,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/projects/:projectId/features2/:name',
        parent: '/features',
        title: ':name',
        component: RedirectFeatureView,
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
        component: RedirectFeatureView,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/features',
        title: 'Feature Toggles',
        component: FeatureToggleListContainer,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true },
    },

    // Applications
    {
        path: '/applications/:name',
        title: ':name',
        parent: '/applications',
        component: ApplicationEdit,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/applications',
        title: 'Applications',
        component: ApplicationList,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },

    // Context
    {
        path: '/context/create',
        parent: '/context',
        title: 'Create',
        component: CreateContext,
        type: 'protected',
        layout: 'main',
        flag: C,
        menu: {},
    },
    {
        path: '/context/edit/:name',
        parent: '/context',
        title: ':name',
        component: EditContext,
        type: 'protected',
        layout: 'main',
        flag: C,
        menu: {},
    },
    {
        path: '/context',
        title: 'Context Fields',
        component: ContextList,
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
        component: CreateStrategy,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/strategies/:name/edit',
        title: ':name',
        parent: '/strategies',
        component: EditStrategy,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/strategies/:name',
        title: ':name',
        parent: '/strategies',
        component: StrategyView,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/strategies',
        title: 'Strategies',
        component: StrategiesList,
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
        component: TagTypeList,
        type: 'protected',
        layout: 'main',
        menu: { mobile: true, advanced: true },
    },

    // Addons
    {
        path: '/addons/create/:providerId',
        parent: '/addons',
        title: 'Create',
        component: CreateAddon,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/addons/edit/:addonId',
        parent: '/addons',
        title: 'Edit',
        component: EditAddon,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/addons',
        title: 'Addons',
        component: AddonList,
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
        component: FeatureEventHistoryPage,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/history',
        title: 'Event History',
        component: EventHistoryPage,
        type: 'protected',
        layout: 'main',
        menu: { adminSettings: true },
    },

    // Archive
    {
        path: '/archive',
        title: 'Archived Toggles',
        component: ArchiveListContainer,
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
        path: '/admin/users/:id/edit',
        title: 'Edit',
        component: EditUser,
        type: 'protected',
        layout: 'main',
        menu: {},
        hidden: true,
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
        path: '/admin/create-user',
        parent: '/admin',
        title: 'Users',
        component: CreateUser,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/admin/auth',
        parent: '/admin',
        title: 'Single Sign-On',
        component: AuthSettings,
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
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */

    {
        path: '/login',
        title: 'Log in',
        component: Login,
        type: 'unprotected',
        hidden: true,
        layout: 'standalone',
        menu: {},
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/new-user',
        title: 'New user',
        hidden: true,
        component: NewUser,
        type: 'unprotected',
        layout: 'standalone',
        menu: {},
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
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
