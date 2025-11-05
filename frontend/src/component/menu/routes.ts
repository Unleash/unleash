import { FeatureToggleListTable } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import { StrategyView } from 'component/strategies/StrategyView/StrategyView';
import { StrategiesList } from 'component/strategies/StrategiesList/StrategiesList';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import { IntegrationList } from 'component/integrations/IntegrationList/IntegrationList';
import Login from 'component/user/Login/Login';
import { P } from 'component/common/flags';
import { NewUser } from 'component/user/NewUser/NewUser';
import ResetPassword from 'component/user/ResetPassword/ResetPassword';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { ProjectList } from 'component/project/ProjectList/ProjectList';
import { ArchiveProjectList } from 'component/project/ProjectList/ArchiveProjectList';
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
import { SegmentTable } from '../segments/SegmentTable/SegmentTable.jsx';
import { FeaturesArchiveTable } from 'component/archive/FeaturesArchiveTable';
import { LazyPlayground } from 'component/playground/Playground/LazyPlayground';
import { Profile } from 'component/user/Profile/Profile';
import { LazyFeatureView } from 'component/feature/FeatureView/LazyFeatureView';
import { LazyAdmin } from 'component/admin/LazyAdmin';
import { LazyProject } from 'component/project/Project/LazyProject';
import { LoginHistory } from 'component/loginHistory/LoginHistory';
import { FeatureTypesList } from 'component/featureTypes/FeatureTypesList';
import { ViewIntegration } from 'component/integrations/ViewIntegration/ViewIntegration';
import { PaginatedApplicationList } from '../application/ApplicationList/PaginatedApplicationList.jsx';
import { AddonRedirect } from 'component/integrations/AddonRedirect/AddonRedirect';
import { Insights } from '../insights/Insights.jsx';
import { LazyImpactMetricsPage } from '../impact-metrics/LazyImpactMetricsPage.tsx';
import { FeedbackList } from '../feedbackNew/FeedbackList.jsx';
import { Application } from 'component/application/Application';
import { Signals } from 'component/signals/Signals';
import { LazyCreateProject } from '../project/Project/CreateProject/LazyCreateProject.jsx';
import { PersonalDashboard } from '../personalDashboard/PersonalDashboard.jsx';
import { ReleaseManagement } from 'component/releases/ReleaseManagement/ReleaseManagement';
import { CreateReleasePlanTemplate } from 'component/releases/ReleasePlanTemplate/CreateReleasePlanTemplate';
import { EditReleasePlanTemplate } from 'component/releases/ReleasePlanTemplate/EditReleasePlanTemplate';
import { ExploreCounters } from 'component/counters/ExploreCounters/ExploreCounters.js';
import { UnknownFlagsTable } from 'component/unknownFlags/UnknownFlagsTable';
import { ChangeRequests } from 'component/changeRequest/ChangeRequests/ChangeRequests';

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
    // Personal Dashboard
    {
        path: '/personal',
        title: 'Dashboard',
        component: PersonalDashboard,
        type: 'protected',
        menu: { primary: true },
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
        menu: { primary: true },
    },
    {
        path: '/projects-archive',
        title: 'Projects archive',
        component: ArchiveProjectList,
        type: 'protected',
        menu: {},
        enterprise: true,
    },

    // Flags overview
    {
        path: '/search',
        title: 'Flags overview',
        component: FeatureToggleListTable,
        type: 'protected',
        menu: { primary: true },
    },

    // Global change request overview
    {
        path: '/change-requests',
        title: 'Change Requests',
        component: ChangeRequests,
        type: 'protected',
        menu: { primary: true },
        flag: 'globalChangeRequestList',
        enterprise: true,
    },

    // Playground
    {
        path: '/playground',
        title: 'Playground',
        component: LazyPlayground,
        hidden: false,
        type: 'protected',
        menu: { primary: true },
    },

    // Analytics
    {
        path: '/insights',
        title: 'Analytics',
        component: Insights,
        type: 'protected',
        menu: { primary: true },
        enterprise: true,
    },

    // Impact Metrics
    {
        path: '/impact-metrics',
        title: 'Impact metrics',
        component: LazyImpactMetricsPage,
        type: 'protected',
        menu: { primary: true },
        enterprise: true,
        flag: 'impactMetrics',
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
        menu: { main: true },
    },

    // Counters
    {
        path: '/custom-metrics',
        title: 'Custom metrics',
        component: ExploreCounters,
        type: 'protected',
        menu: { main: true },
        flag: 'customMetrics',
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
        menu: { main: true },
    },

    // Feature types
    {
        path: '/feature-toggle-type/*',
        title: 'Feature flag types',
        component: FeatureTypesList,
        type: 'protected',
        menu: { main: true },
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
        menu: { main: true },
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
        menu: { main: true },
        enterprise: true,
    },
    {
        path: '/feedback',
        title: 'Feedback',
        component: FeedbackList,
        type: 'protected',
        flag: 'feedbackPosting',
        menu: {},
    },

    // Release management/plans
    {
        path: '/release-templates',
        title: 'Release templates',
        component: ReleaseManagement,
        type: 'protected',
        menu: { main: true, mode: ['enterprise'] },
    },
    {
        path: '/release-templates/create-template',
        title: 'Create release template',
        parent: '/release-templates',
        component: CreateReleasePlanTemplate,
        type: 'protected',
        menu: { mode: ['enterprise'] },
        enterprise: true,
    },
    {
        path: '/release-templates/edit/:templateId',
        title: 'Edit release template',
        parent: '/release-templates',
        component: EditReleasePlanTemplate,
        type: 'protected',
        menu: { mode: ['enterprise'] },
        enterprise: true,
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
        menu: { main: true },
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
        menu: { main: true },
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
        menu: { main: true },
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

    // Unknown flags
    {
        path: '/unknown-flags',
        title: 'Unknown flags',
        component: UnknownFlagsTable,
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

const getCondensedRoutes = (routes: IRoute[]): INavigationMenuItem[] => {
    return routes.map((route) => {
        return {
            path: route.path,
            flag: route.flag,
            title: route.title,
            menu: route.menu,
            configFlag: route.configFlag,
            notFlag: route.notFlag,
            enterprise: route.enterprise,
        };
    });
};

export const baseRoutes = routes.filter((route) => !route.hidden);
export const getNavRoutes = () => {
    return getCondensedRoutes(baseRoutes.filter((route) => route.menu.main));
};
export const getPrimaryRoutes = () => {
    return getCondensedRoutes(baseRoutes.filter((route) => route.menu.primary));
};
