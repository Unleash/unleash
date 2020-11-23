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

export const routes = [
    // Features
    { path: '/features/create', parent: '/features', title: 'Create', component: CreateFeatureToggle },
    { path: '/features/copy/:copyToggle', parent: '/features', title: 'Copy', component: CopyFeatureToggle },
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

    // Context
    { path: '/context/create', parent: '/context', title: 'Create', component: CreateContextField },
    { path: '/context/edit/:name', parent: '/context', title: ':name', component: EditContextField },
    { path: '/context', title: 'Context Fields', icon: 'apps', component: ContextFields, hidden: true },

    // Project
    { path: '/projects/create', parent: '/projects', title: 'Create', component: CreateProject },
    { path: '/projects/edit/:id', parent: '/projects', title: ':id', component: EditProject },
    { path: '/projects', title: 'Projects', icon: 'folder_open', component: ListProjects, hidden: true },

    { path: '/logout', title: 'Sign out', icon: 'exit_to_app', component: LogoutFeatures },
];

export const getRoute = path => routes.find(route => route.path === path);

export const baseRoutes = routes.filter(route => !route.hidden).filter(route => !route.parent);
