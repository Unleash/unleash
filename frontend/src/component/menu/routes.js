import CreateFeatureToggle from '../../page/features/create';
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
import LogoutFeatures from '../../page/user/logout';

export const routes = [
    // Features
    { path: '/features/create', parent: '/features', title: 'Create', component: CreateFeatureToggle },
    { path: '/features/:activeTab/:name', parent: '/features', title: ':name', component: ViewFeatureToggle },
    { path: '/features', title: 'Feature Toggles', icon: 'list', component: Features },

    // Strategies
    { path: '/strategies/create', title: 'Create', parent: '/strategies', component: CreateStrategies },
    {
        path: '/strategies/:activeTab/:strategyName',
        title: ':strategyName',
        parent: '/strategies',
        component: StrategyView,
    },
    { path: '/strategies', title: 'Strategies', icon: 'extension', component: Strategies },

    // History
    { path: '/history/:toggleName', title: ':toggleName', parent: '/history', component: HistoryTogglePage },
    { path: '/history', title: 'Event History', icon: 'history', component: HistoryPage },

    // Archive
    { path: '/archive/:activeTab/:name', title: ':name', parent: '/archive', component: ShowArchive },
    { path: '/archive', title: 'Archived Toggles', icon: 'archive', component: Archive },

    // Applications
    { path: '/applications/:name', title: ':name', parent: '/applications', component: ApplicationView },
    { path: '/applications', title: 'Applications', icon: 'apps', component: Applications },

    { path: '/logout', title: 'Sign out', icon: 'exit_to_app', component: LogoutFeatures },
];

export const getRoute = path => routes.find(route => route.path === path);

export const baseRoutes = routes.filter(route => !route.parent);
