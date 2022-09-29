import { FeatureToggleListTable } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import { StrategyView } from 'component/strategies/StrategyView/StrategyView';
import { StrategiesList } from 'component/strategies/StrategiesList/StrategiesList';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import { AddonList } from 'component/addons/AddonList/AddonList';
import Admin from 'component/admin';
import AdminApi from 'component/admin/api';
import AdminUsers from 'component/admin/users/UsersAdmin';
import { GroupsAdmin } from 'component/admin/groups/GroupsAdmin';
import { AuthSettings } from 'component/admin/auth/AuthSettings';
import Login from 'component/user/Login/Login';
import { EEA, P, RE, SE, UG } from 'component/common/flags';
import { NewUser } from 'component/user/NewUser/NewUser';
import ResetPassword from 'component/user/ResetPassword/ResetPassword';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { ProjectListNew } from 'component/project/ProjectList/ProjectList';
import Project from 'component/project/Project/Project';
import RedirectArchive from 'component/archive/RedirectArchive';
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
import { EventPage } from 'component/events/EventPage/EventPage';
import { CreateStrategy } from 'component/strategies/CreateStrategy/CreateStrategy';
import { EditStrategy } from 'component/strategies/EditStrategy/EditStrategy';
import { SplashPage } from 'component/splash/SplashPage/SplashPage';
import { CreateUnleashContextPage } from 'component/context/CreateUnleashContext/CreateUnleashContextPage';
import { CreateSegment } from 'component/segments/CreateSegment/CreateSegment';
import { EditSegment } from 'component/segments/EditSegment/EditSegment';
import { IRoute } from 'interfaces/route';
import { EnvironmentTable } from 'component/environments/EnvironmentTable/EnvironmentTable';
import { SegmentTable } from 'component/segments/SegmentTable/SegmentTable';
import FlaggedBillingRedirect from 'component/admin/billing/FlaggedBillingRedirect/FlaggedBillingRedirect';
import { FeaturesArchiveTable } from '../archive/FeaturesArchiveTable';
import { Billing } from 'component/admin/billing/Billing';
import { Group } from 'component/admin/groups/Group/Group';
import { CreateGroup } from 'component/admin/groups/CreateGroup/CreateGroup';
import { EditGroup } from 'component/admin/groups/EditGroup/EditGroup';
import { LazyPlayground } from 'component/playground/Playground/LazyPlayground';
import { CorsAdmin } from 'component/admin/cors';
import { InviteLink } from 'component/admin/users/InviteLink/InviteLink';
import { Profile } from 'component/user/Profile/Profile';

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
        enterprise: true,
        menu: {},
    },
    {
        path: '/projects/:projectId/edit',
        parent: '/projects',
        title: ':projectId',
        component: EditProject,
        type: 'protected',
        enterprise: true,
        menu: {},
    },
    {
        path: '/projects/:projectId/archived',
        title: ':projectId',
        parent: '/archive',
        component: RedirectArchive,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId/:activeTab/copy',
        parent: '/projects/:projectId/features/:featureId/:activeTab',
        title: 'Copy',
        component: CopyFeatureToggle,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId/edit',
        parent: '/projects',
        title: 'Edit feature',
        component: EditFeature,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId/*',
        parent: '/projects',
        title: 'FeatureView',
        component: FeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/create-toggle',
        parent: '/projects/:projectId/features',
        title: 'Create feature toggle',
        component: CreateFeature,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features2/:featureId',
        parent: '/features',
        title: ':featureId',
        component: RedirectFeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/*',
        parent: '/projects',
        title: ':projectId',
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
        path: '/features/:activeTab/:featureId',
        parent: '/features',
        title: ':featureId',
        component: RedirectFeatureView,
        type: 'protected',
        menu: {},
    },
    {
        path: '/features',
        title: 'Feature toggles',
        component: FeatureToggleListTable,
        type: 'protected',
        menu: { mobile: true },
    },

    // Playground
    {
        path: '/playground',
        title: 'Playground',
        component: LazyPlayground,
        hidden: false,
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
        menu: {},
    },
    {
        path: '/context/edit/:name',
        parent: '/context',
        title: ':name',
        component: EditContext,
        type: 'protected',
        menu: {},
    },
    {
        path: '/context',
        title: 'Context fields',
        component: ContextList,
        type: 'protected',
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
        title: 'Strategy types',
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
        component: EnvironmentTable,
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
        component: SegmentTable,
        hidden: false,
        type: 'protected',
        menu: { mobile: true, advanced: true },
        flag: SE,
    },

    // History
    {
        path: '/history',
        title: 'Event log',
        component: EventPage,
        type: 'protected',
        menu: { adminSettings: true },
    },

    // Archive
    {
        path: '/archive',
        title: 'Archived toggles',
        component: FeaturesArchiveTable,
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
        path: '/admin/invite-link',
        parent: '/admin',
        title: 'Invite link',
        component: InviteLink,
        type: 'protected',
        menu: {},
    },
    {
        path: '/admin/groups',
        parent: '/admin',
        title: 'Groups',
        component: GroupsAdmin,
        type: 'protected',
        menu: { adminSettings: true },
        flag: UG,
    },
    {
        path: '/admin/groups/:groupId',
        parent: '/admin',
        title: ':groupId',
        component: Group,
        type: 'protected',
        menu: {},
        flag: UG,
    },
    {
        path: '/admin/groups/create-group',
        parent: '/admin/groups',
        title: 'Create group',
        component: CreateGroup,
        type: 'protected',
        menu: {},
        flag: UG,
    },
    {
        path: '/admin/groups/:groupId/edit',
        parent: '/admin/groups',
        title: 'Edit group',
        component: EditGroup,
        type: 'protected',
        menu: {},
        flag: UG,
    },
    {
        path: '/admin/roles',
        parent: '/admin',
        title: 'Project roles',
        component: ProjectRoles,
        type: 'protected',
        flag: RE,
        menu: { adminSettings: true },
    },
    {
        path: '/admin/auth',
        parent: '/admin',
        title: 'Single sign-on',
        component: AuthSettings,
        type: 'protected',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/cors',
        parent: '/admin',
        title: 'CORS origins',
        component: CorsAdmin,
        type: 'protected',
        flag: 'embedProxyFrontend',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/billing',
        parent: '/admin',
        title: 'Billing',
        component: Billing,
        type: 'protected',
        menu: {},
    },
    {
        path: '/admin-invoices',
        parent: '/admin',
        title: 'Billing & invoices',
        component: FlaggedBillingRedirect,
        type: 'protected',
        menu: { adminSettings: true, isEnterprise: true },
    },
    {
        path: '/admin',
        title: 'Admin',
        component: Admin,
        hidden: false,
        type: 'protected',
        menu: {},
    },
    {
        path: '/profile/*',
        title: 'Profile',
        component: Profile,
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
