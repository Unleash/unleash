import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { EEA, P, RE, SE, UG } from 'component/common/flags';
import Login from 'component/user/Login/Login';
import { INavigationMenuItem, IRoute } from 'interfaces/route';
import { SplashPage } from 'component/splash/SplashPage/SplashPage';
import { AdminRedirect } from 'component/admin/AdminRedirect';
import RedirectFeatureView from 'component/feature/RedirectFeatureView/RedirectFeatureView';
import RedirectArchive from 'component/archive/RedirectArchive';

function lazyWithPreload<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
) {
    const Component: LazyExoticComponent<T> & { preload?: () => void } =
        lazy(factory);
    Component.preload = factory;
    return Component;
}

const ForgottenPassword = lazyWithPreload(() =>
    import('component/user/ForgottenPassword/ForgottenPassword').then(
        module => ({ default: module.ForgottenPassword })
    )
);
const CreateEnvironment = lazyWithPreload(() =>
    import('component/environments/CreateEnvironment/CreateEnvironment').then(
        module => ({ default: module.CreateEnvironment })
    )
);
const EditEnvironment = lazyWithPreload(() =>
    import('component/environments/EditEnvironment/EditEnvironment').then(
        module => ({ default: module.EditEnvironment })
    )
);
const EditTagType = lazyWithPreload(() =>
    import('component/tags/EditTagType/EditTagType').then(module => ({
        default: module.EditTagType,
    }))
);
const CreateTagType = lazyWithPreload(() =>
    import('component/tags/CreateTagType/CreateTagType').then(module => ({
        default: module.CreateTagType,
    }))
);
const EditProject = lazyWithPreload(() =>
    import('component/project/Project/EditProject/EditProject').then(
        module => ({ default: module.EditProject })
    )
);
const CreateFeature = lazyWithPreload(() =>
    import('component/feature/CreateFeature/CreateFeature').then(module => ({
        default: module.CreateFeature,
    }))
);
const EditFeature = lazyWithPreload(() =>
    import('component/feature/EditFeature/EditFeature').then(module => ({
        default: module.EditFeature,
    }))
);
const ContextList = lazyWithPreload(() =>
    import('component/context/ContextList/ContextList').then(module => ({
        default: module.ContextList,
    }))
);
const Playground = lazyWithPreload(() =>
    import('component/playground/Playground/Playground').then(module => ({
        default: module.Playground,
    }))
);
const FeatureView = lazyWithPreload(() =>
    import('component/feature/FeatureView/FeatureView').then(module => ({
        default: module.FeatureView,
    }))
);
const ResetPassword = lazyWithPreload(
    () => import('component/user/ResetPassword/ResetPassword')
);
const FeatureToggleListTable = lazyWithPreload(() =>
    import('component/feature/FeatureToggleList/FeatureToggleListTable').then(
        module => ({ default: module.FeatureToggleListTable })
    )
);
const StrategyView = lazyWithPreload(() =>
    import('component/strategies/StrategyView/StrategyView').then(module => ({
        default: module.StrategyView,
    }))
);
const StrategiesList = lazyWithPreload(() =>
    import('component/strategies/StrategiesList/StrategiesList').then(
        module => ({ default: module.StrategiesList, preload: true })
    )
);
const TagTypeList = lazyWithPreload(() =>
    import('component/tags/TagTypeList/TagTypeList').then(module => ({
        default: module.TagTypeList,
    }))
);
const AddonList = lazyWithPreload(() =>
    import('component/addons/AddonList/AddonList').then(module => ({
        default: module.AddonList,
    }))
);
const NewUser = lazyWithPreload(() =>
    import('component/user/NewUser/NewUser').then(module => ({
        default: module.NewUser,
    }))
);
const ProjectList = lazyWithPreload(() =>
    import('component/project/ProjectList/ProjectList').then(module => ({
        default: module.ProjectList,
    }))
);
const EditContext = lazyWithPreload(() =>
    import('component/context/EditContext/EditContext').then(module => ({
        default: module.EditContext,
    }))
);
const ApplicationEdit = lazyWithPreload(() =>
    import('component/application/ApplicationEdit/ApplicationEdit').then(
        module => ({ default: module.ApplicationEdit })
    )
);
const ApplicationList = lazyWithPreload(() =>
    import('component/application/ApplicationList/ApplicationList').then(
        module => ({ default: module.ApplicationList })
    )
);
const CreateAddon = lazyWithPreload(() =>
    import('component/addons/CreateAddon/CreateAddon').then(module => ({
        default: module.CreateAddon,
    }))
);
const EditAddon = lazyWithPreload(() =>
    import('component/addons/EditAddon/EditAddon').then(module => ({
        default: module.EditAddon,
    }))
);
const CopyFeatureToggle = lazyWithPreload(() =>
    import('component/feature/CopyFeature/CopyFeature').then(module => ({
        default: module.CopyFeatureToggle,
    }))
);
const EventPage = lazyWithPreload(() =>
    import('component/events/EventPage/EventPage').then(module => ({
        default: module.EventPage,
    }))
);
const CreateStrategy = lazyWithPreload(() =>
    import('component/strategies/CreateStrategy/CreateStrategy').then(
        module => ({ default: module.CreateStrategy })
    )
);
const EditStrategy = lazyWithPreload(() =>
    import('component/strategies/EditStrategy/EditStrategy').then(module => ({
        default: module.EditStrategy,
    }))
);
const CreateUnleashContextPage = lazyWithPreload(() =>
    import(
        'component/context/CreateUnleashContext/CreateUnleashContextPage'
    ).then(module => ({ default: module.CreateUnleashContextPage }))
);
const CreateSegment = lazyWithPreload(() =>
    import('component/segments/CreateSegment/CreateSegment').then(module => ({
        default: module.CreateSegment,
    }))
);
const EditSegment = lazyWithPreload(() =>
    import('component/segments/EditSegment/EditSegment').then(module => ({
        default: module.EditSegment,
    }))
);
const EnvironmentTable = lazyWithPreload(() =>
    import('component/environments/EnvironmentTable/EnvironmentTable').then(
        module => ({ default: module.EnvironmentTable })
    )
);
const SegmentTable = lazyWithPreload(() =>
    import('../segments/SegmentTable/SegmentTable').then(module => ({
        default: module.SegmentTable,
    }))
);
const FeaturesArchiveTable = lazyWithPreload(() =>
    import('../archive/FeaturesArchiveTable').then(module => ({
        default: module.FeaturesArchiveTable,
    }))
);
const Profile = lazyWithPreload(() =>
    import('component/user/Profile/Profile').then(module => ({
        default: module.Profile,
    }))
);
const LoginHistory = lazyWithPreload(() =>
    import('component/loginHistory/LoginHistory').then(module => ({
        default: module.LoginHistory,
        preload: true,
    }))
);
const CreateProject = lazyWithPreload(() =>
    import('component/project/Project/CreateProject/CreateProject').then(
        module => ({ default: module.CreateProject })
    )
);
const LazyAdmin = lazyWithPreload(() =>
    import('component/admin/Admin').then(module => ({
        default: module.Admin,
    }))
);
const Project = lazyWithPreload(() =>
    import('component/project/Project/Project').then(module => ({
        default: module.Project,
    }))
);

export const preload = () => {
    const components = [
        ForgottenPassword,
        CreateEnvironment,
        EditEnvironment,
        EditTagType,
        CreateTagType,
        EditProject,
        CreateFeature,
        EditFeature,
        ContextList,
        Playground,
        FeatureView,
        ResetPassword,
        FeatureToggleListTable,
        StrategyView,
        StrategiesList,
        TagTypeList,
        AddonList,
        NewUser,
        ProjectList,
        EditContext,
        ApplicationEdit,
        ApplicationList,
        CreateAddon,
        EditAddon,
        CopyFeatureToggle,
        EventPage,
        CreateStrategy,
        EditStrategy,
        CreateUnleashContextPage,
        CreateSegment,
        EditSegment,
        EnvironmentTable,
        SegmentTable,
        FeaturesArchiveTable,
        Profile,
        LoginHistory,
        CreateProject,
        LazyAdmin,
        Project,
    ];
    components.forEach(component => {
        if (component.preload) {
            component.preload();
        }
    });
};

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
        component: ProjectList,
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
        component: Playground,
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
