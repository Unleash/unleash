import { lazy } from 'react';
import { EEA, P, RE, SE, UG } from 'component/common/flags';
import Login from 'component/user/Login/Login';
import { INavigationMenuItem, IRoute } from 'interfaces/route';
import { SplashPage } from 'component/splash/SplashPage/SplashPage';
import { LazyPlayground } from 'component/playground/Playground/LazyPlayground';
import { LazyCreateProject } from 'component/project/Project/CreateProject/LazyCreateProject';
import { LazyFeatureView } from 'component/feature/FeatureView/LazyFeatureView';
import { LazyAdmin } from 'component/admin/LazyAdmin';
import { LazyProject } from 'component/project/Project/LazyProject';

const ResetPassword = lazy(
    () => import('component/user/ResetPassword/ResetPassword')
);
const FeatureToggleListTable = lazy(() =>
    import('component/feature/FeatureToggleList/FeatureToggleListTable').then(
        module => ({ default: module.FeatureToggleListTable })
    )
);
const ForgottenPassword = lazy(
    () => import('component/user/ForgottenPassword/ForgottenPassword')
);
const RedirectArchive = lazy(() => import('component/archive/RedirectArchive'));
const CreateEnvironment = lazy(
    () => import('component/environments/CreateEnvironment/CreateEnvironment')
);
const EditEnvironment = lazy(
    () => import('component/environments/EditEnvironment/EditEnvironment')
);
const EditTagType = lazy(
    () => import('component/tags/EditTagType/EditTagType')
);
const CreateTagType = lazy(
    () => import('component/tags/CreateTagType/CreateTagType')
);
const EditProject = lazy(
    () => import('component/project/Project/EditProject/EditProject')
);
const CreateFeature = lazy(
    () => import('component/feature/CreateFeature/CreateFeature')
);
const EditFeature = lazy(
    () => import('component/feature/EditFeature/EditFeature')
);
const ContextList = lazy(
    () => import('component/context/ContextList/ContextList')
);
const RedirectFeatureView = lazy(
    () => import('component/feature/RedirectFeatureView/RedirectFeatureView')
);
const StrategyView = lazy(() =>
    import('component/strategies/StrategyView/StrategyView').then(module => ({
        default: module.StrategyView,
    }))
);
const StrategiesList = lazy(() =>
    import('component/strategies/StrategiesList/StrategiesList').then(
        module => ({ default: module.StrategiesList })
    )
);
const TagTypeList = lazy(() =>
    import('component/tags/TagTypeList/TagTypeList').then(module => ({
        default: module.TagTypeList,
    }))
);
const AddonList = lazy(() =>
    import('component/addons/AddonList/AddonList').then(module => ({
        default: module.AddonList,
    }))
);
const NewUser = lazy(() =>
    import('component/user/NewUser/NewUser').then(module => ({
        default: module.NewUser,
    }))
);
const ProjectListNew = lazy(() =>
    import('component/project/ProjectList/ProjectList').then(module => ({
        default: module.ProjectListNew,
    }))
);
const EditContext = lazy(() =>
    import('component/context/EditContext/EditContext').then(module => ({
        default: module.EditContext,
    }))
);
const ApplicationEdit = lazy(() =>
    import('component/application/ApplicationEdit/ApplicationEdit').then(
        module => ({ default: module.ApplicationEdit })
    )
);
const ApplicationList = lazy(() =>
    import('component/application/ApplicationList/ApplicationList').then(
        module => ({ default: module.ApplicationList })
    )
);
const CreateAddon = lazy(() =>
    import('component/addons/CreateAddon/CreateAddon').then(module => ({
        default: module.CreateAddon,
    }))
);
const EditAddon = lazy(() =>
    import('component/addons/EditAddon/EditAddon').then(module => ({
        default: module.EditAddon,
    }))
);
const CopyFeatureToggle = lazy(() =>
    import('component/feature/CopyFeature/CopyFeature').then(module => ({
        default: module.CopyFeatureToggle,
    }))
);
const EventPage = lazy(() =>
    import('component/events/EventPage/EventPage').then(module => ({
        default: module.EventPage,
    }))
);
const CreateStrategy = lazy(() =>
    import('component/strategies/CreateStrategy/CreateStrategy').then(
        module => ({ default: module.CreateStrategy })
    )
);
const EditStrategy = lazy(() =>
    import('component/strategies/EditStrategy/EditStrategy').then(module => ({
        default: module.EditStrategy,
    }))
);
const CreateUnleashContextPage = lazy(() =>
    import(
        'component/context/CreateUnleashContext/CreateUnleashContextPage'
    ).then(module => ({ default: module.CreateUnleashContextPage }))
);
const CreateSegment = lazy(() =>
    import('component/segments/CreateSegment/CreateSegment').then(module => ({
        default: module.CreateSegment,
    }))
);
const EditSegment = lazy(() =>
    import('component/segments/EditSegment/EditSegment').then(module => ({
        default: module.EditSegment,
    }))
);
const EnvironmentTable = lazy(() =>
    import('component/environments/EnvironmentTable/EnvironmentTable').then(
        module => ({ default: module.EnvironmentTable })
    )
);
const SegmentTable = lazy(() =>
    import('../segments/SegmentTable/SegmentTable').then(module => ({
        default: module.SegmentTable,
    }))
);
const FeaturesArchiveTable = lazy(() =>
    import('../archive/FeaturesArchiveTable').then(module => ({
        default: module.FeaturesArchiveTable,
    }))
);
const Profile = lazy(() =>
    import('component/user/Profile/Profile').then(module => ({
        default: module.Profile,
    }))
);

const AdminRedirect = lazy(() =>
    import('component/admin/AdminRedirect').then(module => ({
        default: module.AdminRedirect,
    }))
);

const LoginHistory = lazy(() =>
    import('component/loginHistory/LoginHistory').then(module => ({
        default: module.LoginHistory,
    }))
);

export const routes: IRoute[] = [
    // Splash
    {
        path: '/splash/:splashId',
        title: 'Unleash',
        component: SplashPage,
        type: 'protected',
        menu: {},
        isStandalone: true,
    },

    // Project
    {
        path: '/projects/create',
        parent: '/projects',
        title: 'Create',
        component: LazyCreateProject,
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
        component: LazyFeatureView,
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
        component: LazyProject,
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

    {
        path: '/admin/logins',
        title: 'Login history',
        component: LoginHistory,
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
        path: '/admin',
        title: 'Admin',
        component: AdminRedirect,
        hidden: false,
        type: 'protected',
        menu: {},
    },
    {
        path: '/admin/*',
        title: 'Admin',
        component: LazyAdmin,
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
        isStandalone: true,
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/new-user',
        title: 'New user',
        hidden: true,
        component: NewUser,
        type: 'unprotected',
        menu: {},
        isStandalone: true,
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/reset-password',
        title: 'Reset password',
        hidden: true,
        component: ResetPassword,
        type: 'unprotected',
        menu: {},
        isStandalone: true,
    },
    /* If you update this route path, make sure you update the path in SWRProvider.tsx */
    {
        path: '/forgotten-password',
        title: 'Forgotten password',
        hidden: true,
        component: ForgottenPassword,
        type: 'unprotected',
        menu: {},
        isStandalone: true,
    },
];

export const adminMenuRoutes: INavigationMenuItem[] = [
    {
        path: '/history',
        title: 'Event log',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/logins',
        title: 'Login history',
        menu: { adminSettings: true, mode: ['enterprise'] },
    },
    {
        path: '/admin/users',
        title: 'Users',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/groups',
        title: 'Groups',
        menu: { adminSettings: true, mode: ['enterprise'] },
        flag: UG,
    },
    {
        path: '/admin/roles',
        title: 'Project roles',
        flag: RE,
        menu: { adminSettings: true, mode: ['enterprise'] },
    },
    {
        path: '/admin/auth',
        title: 'Single sign-on',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/instance',
        title: 'Instance stats',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/service-accounts',
        title: 'Service accounts',
        menu: { adminSettings: true, mode: ['enterprise'] },
    },
    {
        path: '/admin/network/*',
        title: 'Network',
        menu: { adminSettings: true, mode: ['pro', 'enterprise'] },
        configFlag: 'networkViewEnabled',
    },
    {
        path: '/admin/maintenance',
        title: 'Maintenance',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/cors',
        title: 'CORS origins',
        flag: 'embedProxyFrontend',
        menu: { adminSettings: true },
    },
    {
        path: '/admin/admin-invoices',
        title: 'Billing & invoices',
        menu: { adminSettings: true, mode: ['pro'] },
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

export const getCondensedRoutes = (routes: IRoute[]): INavigationMenuItem[] => {
    return routes.map(route => {
        const condensedRoute = {
            path: route.path,
            flag: route.flag,
            title: route.title,
            menu: route.menu,
            configFlag: route.configFlag,
        };
        return condensedRoute;
    });
};

export const getRoutes = computeRoutes();
