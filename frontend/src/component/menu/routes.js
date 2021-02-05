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
import ListTagTypes from '../../page/tag-types';
import CreateTagType from '../../page/tag-types/create';
import EditTagType from '../../page/tag-types/edit';
import ListTags from '../../page/tags';
import CreateTag from '../../page/tags/create';
import Addons from '../../page/addons';
import AddonsCreate from '../../page/addons/create';
import AddonsEdit from '../../page/addons/edit';
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

    { path: '/tag-types/create', parent: '/tag-types', title: 'Create', component: CreateTagType },
    { path: '/tag-types/edit/:name', parent: '/tag-types', title: ':name', component: EditTagType },
    { path: '/tag-types', title: 'Tag types', icon: 'label', component: ListTagTypes },

    { path: '/tags/create', parent: '/tags', title: 'Create', component: CreateTag },
    { path: '/tags', title: 'Tags', icon: 'label', component: ListTags, hidden: true },

    // Addons
    { path: '/addons/create/:provider', parent: '/addons', title: 'Create', component: AddonsCreate },
    { path: '/addons/edit/:id', parent: '/addons', title: 'Edit', component: AddonsEdit },
    { path: '/addons', title: 'Addons', icon: 'device_hub', component: Addons, hidden: false },

    { path: '/logout', title: 'Sign out', icon: 'exit_to_app', component: LogoutFeatures },
];

export const getRoute = path => routes.find(route => route.path === path);

export const baseRoutes = routes.filter(route => !route.hidden).filter(route => !route.parent);
