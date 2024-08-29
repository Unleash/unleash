import { FeatureToggleListTable } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import { StrategyView } from 'component/strategies/StrategyView/StrategyView';
import { StrategiesList } from 'component/strategies/StrategiesList/StrategiesList';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import { IntegrationList } from 'component/integrations/IntegrationList/IntegrationList';
import Login from 'component/user/Login/Login';
import { EEA, P } from 'component/common/flags';
import { NewUser } from 'component/user/NewUser/NewUser';
import ResetPassword from 'component/user/ResetPassword/ResetPassword';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { ProjectList } from 'component/project/ProjectList/ProjectList';
import { ArchiveProjectList } from 'component/project/ProjectList/ArchiveProjectList';
import RedirectArchive from 'component/archive/RedirectArchive';
import CreateEnvironment from 'component/environments/CreateEnvironment/CreateEnvironment';
import EditEnvironment from 'component/environments/EditEnvironment/EditEnvironment';
import { EditContext } from 'component/context/EditContext/EditContext';
import EditTagType from 'component/tags/EditTagType/EditTagType';
import CreateTagType from 'component/tags/CreateTagType/CreateTagType';
import EditFeature from 'component/feature/EditFeature/EditFeature';
import ContextList from 'component/context/ContextList/ContextList/ContextList';
import { CreateIntegration } from 'component/integrations/CreateIntegration/CreateIntegration';
import { EditIntegration } from 'component/integrations/EditIntegration/EditIntegration';
import { CopyFeatureToggle } from 'component/feature/CopyFeature/CopyFeature';
import { EventPage } from 'component/events/EventPage/EventPage';
import { CreateStrategy } from 'component/strategies/CreateStrategy/CreateStrategy';
import { EditStrategy } from 'component/strategies/EditStrategy/EditStrategy';
import { SplashPage } from 'component/splash/SplashPage/SplashPage';
import { CreateUnleashContextPage } from 'component/context/CreateUnleashContext/CreateUnleashContextPage';
import { CreateSegment } from 'component/segments/CreateSegment/CreateSegment';
import { EditSegment } from 'component/segments/EditSegment/EditSegment';
import type { INavigationMenuItem, IRoute } from 'interfaces/route';
import { EnvironmentTable } from 'component/environments/EnvironmentTable/EnvironmentTable';
import { SegmentTable } from '../segments/SegmentTable/SegmentTable';
import { FeaturesArchiveTable } from '../archive/FeaturesArchiveTable';
import { LazyPlayground } from 'component/playground/Playground/LazyPlayground';
import { Profile } from 'component/user/Profile/Profile';
import { LazyFeatureView } from 'component/feature/FeatureView/LazyFeatureView';
import { LazyAdmin } from 'component/admin/LazyAdmin';
import { LazyProject } from 'component/project/Project/LazyProject';
import { LoginHistory } from 'component/loginHistory/LoginHistory';
import { FeatureTypesList } from 'component/featureTypes/FeatureTypesList';
import { ViewIntegration } from 'component/integrations/ViewIntegration/ViewIntegration';
import { PaginatedApplicationList } from '../application/ApplicationList/PaginatedApplicationList';
import { AddonRedirect } from 'component/integrations/AddonRedirect/AddonRedirect';
import { Insights } from '../insights/Insights';
import { FeedbackList } from '../feedbackNew/FeedbackList';
import { Application } from 'component/application/Application';
import { Signals } from 'component/signals/Signals';
import { LazyCreateProject } from '../project/Project/CreateProject/LazyCreateProject';

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
        path: '/projects/:projectId/archived',
        title: ':projectId',
        parent: '/archive',
        component: RedirectArchive,
        type: 'protected',
        menu: {},
    },
    {
        path: '/projects/:projectId/features/:featureId/copy',
        parent: '/projects/:projectId/features/:featureId/',
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
        component: ProjectList,
        type: 'protected',
        menu: { mobile: true },
    },
    {
        path: '/projects-archive',
        title: 'Projects archive',
        component: ArchiveProjectList,
        type: 'protected',
        menu: {},
    },

    // Features
    {
        path: '/search',
        title: 'Search',
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

    // Insights
    {
        path: '/insights',
        title: 'Insights',
        component: Insights,
        type: 'protected',
        menu: { mobile: true },
        notFlag: 'killInsightsUI',
        enterprise: true,
    },

    // Applications
    {
        path: '/applications/:name/*',
        title: ':name',
        parent: '/applications',
        component: Application,
        type: 'protected',
        menu: {},
    },
    {
        path: '/applications',
        title: 'Applications',
        component: PaginatedApplicationList,
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

    // Feature types
    {
        path: '/feature-toggle-type/*',
        title: 'Feature flag types',
        component: FeatureTypesList,
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
    {
        path: '/feedback',
        title: 'Feedback',
        component: FeedbackList,
        type: 'protected',
        flag: 'featureSearchFeedbackPosting',
        menu: {},
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

    // Integrations
    {
        path: '/addons/create/:providerId',
        parent: '/addons',
        title: 'Create',
        component: AddonRedirect,
        type: 'protected',
        menu: {},
    },
    {
        path: '/addons/edit/:addonId',
        parent: '/addons',
        title: 'Edit',
        component: AddonRedirect,
        type: 'protected',
        menu: {},
    },
    {
        path: '/addons',
        title: 'Addons',
        component: AddonRedirect,
        hidden: false,
        type: 'protected',
        menu: {},
    },
    {
        path: '/integrations/create/:providerId',
        parent: '/integrations',
        title: 'Create',
        component: CreateIntegration,
        type: 'protected',
        menu: {},
    },
    {
        path: '/integrations/view/:providerId',
        parent: '/integrations',
        title: 'View',
        component: ViewIntegration,
        type: 'protected',
        menu: {},
    },
    {
        path: '/integrations/edit/:addonId',
        parent: '/integrations',
        title: 'Edit',
        component: EditIntegration,
        type: 'protected',
        menu: {},
    },
    {
        path: '/integrations',
        title: 'Integrations',
        component: IntegrationList,
        hidden: false,
        type: 'protected',
        menu: { mobile: true, advanced: true },
    },
    {
        path: '/integrations/signals',
        title: 'Signals',
        component: Signals,
        hidden: true,
        type: 'protected',
        menu: {},
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
    },
    {
        path: '/segments/edit/:segmentId',
        title: 'Segments',
        component: EditSegment,
        hidden: false,
        type: 'protected',
        layout: 'main',
        menu: {},
    },
    {
        path: '/segments',
        title: 'Segments',
        component: SegmentTable,
        hidden: false,
        type: 'protected',
        menu: { mobile: true, advanced: true },
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
        title: 'Archived flags',
        component: FeaturesArchiveTable,
        type: 'protected',
        menu: {},
    },

    // Admin
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

export const getRoute = (path: string) =>
    routes.find((route) => route.path === path);

export const baseRoutes = routes.filter((route) => !route.hidden);

const computeRoutes = () => {
    const mainNavRoutes = baseRoutes.filter((route) => route.menu.advanced);
    const adminRoutes = routes.filter((route) => route.menu.adminSettings);
    const mobileRoutes = routes.filter((route) => route.menu.mobile);

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
    return routes.map((route) => {
        return {
            path: route.path,
            flag: route.flag,
            title: route.title,
            menu: route.menu,
            configFlag: route.configFlag,
            notFlag: route.notFlag,
        };
    });
};

export const getRoutes = computeRoutes();
