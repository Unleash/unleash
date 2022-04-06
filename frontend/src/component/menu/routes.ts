import { FeatureToggleListContainer } from 'component/feature/FeatureToggleList/FeatureToggleListContainer';
import { StrategyView } from 'component/strategies/StrategyView/StrategyView';
import { StrategiesList } from 'component/strategies/StrategiesList/StrategiesList';
import { ArchiveListContainer } from 'component/archive/ArchiveListContainer';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import { AddonList } from 'component/addons/AddonList/AddonList';
import Admin from 'component/admin';
import AdminApi from 'component/admin/api';
import AdminInvoice from 'component/admin/invoice/InvoiceAdminPage';
import AdminUsers from 'component/admin/users/UsersAdmin';
import { AuthSettings } from 'component/admin/auth/AuthSettings';
import Login from 'component/user/Login/Login';
import { C, EEA, P, RE, SE } from 'component/common/flags';
import { NewUser } from 'component/user/NewUser/NewUser';
import ResetPassword from 'component/user/ResetPassword/ResetPassword';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { ProjectListNew } from 'component/project/ProjectList/ProjectList';
import Project from 'component/project/Project/Project';
import RedirectArchive from 'component/archive/RedirectArchive';
import EnvironmentList from 'component/environments/EnvironmentList/EnvironmentList';
import { FeatureView } from 'component/feature/FeatureView/FeatureView';
import ProjectRoles from 'component/admin/projectRoles/ProjectRoles/ProjectRoles';
import CreateProjectRole from 'component/admin/projectRoles/CreateProjectRole/CreateProjectRole';
import EditProjectRole from 'component/admin/projectRoles/EditProjectRole/EditProjectRole';
import CreateUser from 'component/admin/users/CreateUser/CreateUser';
import EditUser from 'component/admin/users/EditUser/EditUser';
import { CreateApiToken } from 'component/admin/apiToken/CreateApiToken/CreateApiToken';
import CreateEnvironment from 'component/environments/CreateEnvironment/CreateEnvironment';
import EditEnvironment from 'component/environments/EditEnvironment/EditEnvironment';
import { EditContext } from 'component/context/EditContext/EditContext';
import EditTagType from 'component/tags/EditTagType/EditTagType';
import CreateTagType from 'component/tags/CreateTagType/CreateTagType';
import EditProject from 'component/project/Project/EditProject/EditProject';
import CreateProject from 'component/project/Project/CreateProject/CreateProject';
import CreateFeature from 'component/feature/CreateFeature/CreateFeature';
import EditFeature from 'component/feature/EditFeature/EditFeature';
import { ApplicationEdit } from 'component/application/ApplicationEdit/ApplicationEdit';
import { ApplicationList } from 'component/application/ApplicationList/ApplicationList';
import ContextList from 'component/context/ContextList/ContextList';
import RedirectFeatureView from 'component/feature/RedirectFeatureView/RedirectFeatureView';
import { CreateAddon } from 'component/addons/CreateAddon/CreateAddon';
import { EditAddon } from 'component/addons/EditAddon/EditAddon';
import { CopyFeatureToggle } from 'component/feature/CopyFeature/CopyFeature';
import { EventHistoryPage } from 'component/history/EventHistoryPage/EventHistoryPage';
import { FeatureEventHistoryPage } from 'component/history/FeatureEventHistoryPage/FeatureEventHistoryPage';
import { CreateStrategy } from 'component/strategies/CreateStrategy/CreateStrategy';
import { EditStrategy } from 'component/strategies/EditStrategy/EditStrategy';
import { SplashPage } from 'component/splash/SplashPage/SplashPage';
import { CreateUnleashContextPage } from 'component/context/CreateUnleashContext/CreateUnleashContextPage';
import { CreateSegment } from 'component/segments/CreateSegment/CreateSegment';
import { EditSegment } from 'component/segments/EditSegment/EditSegment';
import { SegmentsList } from 'component/segments/SegmentList/SegmentList';
import { IRoute } from 'interfaces/route';

export const routes: IRoute[] = [
    // Splash
    {
        path: '/splash/:splashId',
        title: 'Unleash',
        component: SplashPage,
        type: 'protected',
        menu: {},
    },

    // Project
    {
        path: '/projects/create',
        parent: '/projects',
        title: 'Create',
        component: CreateProject,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:id/edit',
        parent: '/projects',
        title: ':id',
        component: EditProject,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:id/archived',
        title: ':name',
        parent: '/archive',
        component: RedirectArchive,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:id/features/:name/:activeTab/copy',
        parent: '/projects/:id/features/:name/:activeTab',
        title: 'Copy',
        component: CopyFeatureToggle,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId/edit',
        parent: '/projects',
        title: 'Edit Feature',
        component: EditFeature,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId',
        parent: '/projects',
        title: 'FeatureView',
        component: FeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:id/features/:name/:activeTab',
        parent: '/projects',
        title: ':name',
        component: FeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/create-toggle',
        parent: '/projects/:id/features',
        title: 'Create feature toggle',
        component: CreateFeature,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features2/:name',
        parent: '/features',
        title: ':name',
        component: RedirectFeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:id/:activeTab',
        parent: '/projects',
        title: ':id',
        component: Project,
        flag: P,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:id',
        parent: '/projects',
        title: ':id',
        component: Project,
        flag: P,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects',
        title: 'Projects',
        component: ProjectListNew,
        type: 'protected',
        menu: { mobile: true },
    },

    // Features
    {
        path: '/features/:activeTab/:name',
        parent: '/features',
        title: ':name',
        component: RedirectFeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/features',
        title: 'Feature Toggles',
        component: FeatureToggleListContainer,
        type: 'protected',
        menu: { mobile: true },
    },

    // Applications
    {
        path: '/applications/:name',
        title: ':name',
        parent: '/applications',
        component: ApplicationEdit,
        type: 'protected',
        menu: {},
    },
    {
        path: '/applications',
        title: 'Applications',
        component: ApplicationList,
        type: 'protected',
        menu: { mobile: true, advanced: true },
    },

    // Context
    {
        path: '/context/create',
        parent: '/context',
        title: 'Create',
        component: CreateUnleashContextPage,
        type: 'protected',
        flag: C,
        menu: {},
    },
    {
        path: '/context/edit/:name',
        parent: '/context',
        title: ':name',
        component: EditContext,
        type: 'protected',
        flag: C,
        menu: {},
    },
    {
        path: '/context',
        title: 'Context Fields',
        component: ContextList,
        type: 'protected',
        flag: C,
        menu: { mobile: true, advanced: true },
    },

    // Strategies
    {
        path: '/strategies/create',
        title: 'Create',
        parent: '/strategies',
        component: CreateStrategy,
        type: 'protected',
        menu: {},
    },
    {
        path: '/strategies/:name/edit',
        title: ':name',
        parent: '/strategies',
        component: EditStrategy,
        type: 'protected',
        menu: {},
    },
    {
        path: '/strategies/:name',
        title: ':name',
        parent: '/strategies',
        component: StrategyView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/strategies',
        title: 'Strategies',
        component: StrategiesList,
        type: 'protected',
        menu: { mobile: true, advanced: true },
    },
    {
        path: '/environments/create',
        title: 'Environments',
        component: CreateEnvironment,
        parent: '/environments',
        type: 'protected',
        menu: {},
    },
    {
        path: '/environments/:id',
        title: 'Edit',
        component: EditEnvironment,
        type: 'protected',
        menu: {},
    },
    {
        path: '/environments',
        title: 'Environments',
        component: EnvironmentList,
        type: 'protected',
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
        menu: {},
    },
    {
        path: '/tag-types/edit/:name',
        parent: '/tag-types',
        title: ':name',
        component: EditTagType,
        type: 'protected',
        menu: {},
    },
    {
        path: '/tag-types',
        title: 'Tag types',
        component: TagTypeList,
        type: 'protected',
        menu: { mobile: true, advanced: true },
    },

    // Addons
    {
        path: '/addons/create/:providerId',
        parent: '/addons',
        title: 'Create',
        component: CreateAddon,
        type: 'protected',
        menu: {},
    },
    {
        path: '/addons/edit/:addonId',
        parent: '/addons',
        title: 'Edit',
        component: EditAddon,
        type: 'protected',
        menu: {},
    },
    {
        path: '/addons',
        title: 'Addons',
        component: AddonList,
        hidden: false,
        type: 'protected',
        menu: { mobile: true, advanced: true },
    },

    // Segments
    {
        path: '/segments/create',
        title: 'Segments',
        component: CreateSegment,
        hidden: false,
        type: 'protected',
        layout: 'main',
        menu: {},
        flag: SE,
    },
    {
        path: '/segments/edit/:segmentId',
        title: 'Segments',
        component: EditSegment,
        hidden: false,
        type: 'protected',
        layout: 'main',
        menu: {},
        flag: SE,
    },
    {
        path: '/segments',
        title: 'Segments',
        component: SegmentsList,
        hidden: false,
        type: 'protected',
        menu: { mobile: true, advanced: true },
        flag: SE,
    },

    // History
    {
        path: '/history/:toggleName',
        title: ':toggleName',
        parent: '/history',
        component: FeatureEventHistoryPage,
        type: 'protected',
        menu: {},
    },
    {
        path: '/history',
        title: 'Event History',
        component: EventHistoryPage,
        type: 'protected',
        menu: { adminSettings: true },
    },

    // Archive
    {
        path: '/archive',
        title: 'Archived Toggles',
        component: ArchiveListContainer,
        type: 'protected',
        menu: {},
    },

    // Admin
    {
        path: '/admin/api/create-token',
        parent: '/admin',
        title: 'API access',
        component: CreateApiToken,
        type: 'protected',
        menu: {},
    },
    {
        path: '/admin/create-project-role',
        title: 'Create',
        component: CreateProjectRole,
        type: 'protected',
        menu: {},
        flag: RE,
    },
    {
        path: '/admin/roles/:id/edit',
        title: 'Edit',
        component: EditProjectRole,
        type: 'protected',
        menu: {},
        flag: RE,
    },
    {
        path: '/admin/users/:id/edit',
        title: 'Edit',
        component: EditUser,
        type: 'protected',
        menu: {},
        hidden: true,
    },
    {
        path: '/admin/api',
        parent: '/admin',
        title: 'API access',
        component: AdminApi,
        type: 'protected',
        menu: { mobile: true, advanced: true },
    },
    {
        path: '/admin/users',
        parent: '/admin',
        title: 'Users',
        component: AdminUsers,
        type: 'protected',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/create-user',
        parent: '/admin',
        title: 'Users',
        component: CreateUser,
        type: 'protected',
        menu: {},
    },
    {
        path: '/admin/roles',
        parent: '/admin',
        title: 'Project Roles',
        component: ProjectRoles,
        type: 'protected',
        flag: RE,
        menu: { adminSettings: true },
    },
    {
        path: '/admin/auth',
        parent: '/admin',
        title: 'Single Sign-On',
        component: AuthSettings,
        type: 'protected',
        menu: { adminSettings: true },
    },
    {
        path: '/admin-invoices',
        title: 'Invoices',
        component: AdminInvoice,
        hidden: true,
        type: 'protected',
        menu: { adminSettings: true },
    },
    {
        path: '/admin',
        title: 'Admin',
        component: Admin,
        hidden: false,
        type: 'protected',
        menu: {},
    },

    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/login',
        title: 'Log in',
        component: Login,
        type: 'unprotected',
        hidden: true,
        menu: {},
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/new-user',
        title: 'New user',
        hidden: true,
        component: NewUser,
        type: 'unprotected',
        menu: {},
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/reset-password',
        title: 'Reset password',
        hidden: true,
        component: ResetPassword,
        type: 'unprotected',
        menu: {},
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/forgotten-password',
        title: 'Forgotten password',
        hidden: true,
        component: ForgottenPassword,
        type: 'unprotected',
        menu: {},
    },
];

export const getRoute = (path: string) =>
    routes.find(route => route.path === path);

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
