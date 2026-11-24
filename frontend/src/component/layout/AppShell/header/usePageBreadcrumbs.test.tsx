import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SWRConfig } from 'swr';
import { beforeEach, expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { EntityPage } from './entityPages.ts';
import {
    type PageBreadcrumb,
    usePageBreadcrumbs,
} from './usePageBreadcrumbs.ts';

const server = testServerSetup();

const oss = { versionInfo: { current: { oss: 'version' } } };

const enterprise = {
    versionInfo: { current: { enterprise: 'version' } },
    environment: 'Enterprise',
};

const pro = { ...enterprise, environment: 'Pro' };

const mockUiConfig = (uiConfig: object) =>
    testServerRoute(server, '/api/admin/ui-config', uiConfig);

const mockProjects = (projects: { id: string; name: string }[]) =>
    testServerRoute(server, '/api/admin/projects', { projects });

const mockDefaultProject = () =>
    mockProjects([{ id: 'default', name: 'Default' }]);

beforeEach(() => {
    mockUiConfig(oss);
    mockProjects([]);
});

// Breadcrumbs depend on the ui config and the projects, so they are only
// final once both have loaded.
const loadPageBreadcrumbs = async (
    pathname: string,
    entityPage?: EntityPage,
): Promise<PageBreadcrumb[]> => {
    const { result } = renderHook(
        () => {
            const uiConfig = useUiConfig();
            const projects = useProjects();

            return {
                breadcrumbs: usePageBreadcrumbs(entityPage),
                loaded: !uiConfig.loading && !projects.loading,
            };
        },
        {
            wrapper: ({ children }: { children: ReactNode }) => (
                <SWRConfig
                    value={{ provider: () => new Map(), dedupingInterval: 0 }}
                >
                    <MemoryRouter initialEntries={[pathname]}>
                        {children}
                    </MemoryRouter>
                </SWRConfig>
            ),
        },
    );

    await waitFor(() => expect(result.current.loaded).toBe(true));

    return result.current.breadcrumbs;
};

const workspace: PageBreadcrumb = { label: 'Workspace', to: '/projects' };
const configureWorkspace: PageBreadcrumb = { label: 'Configure workspace' };
const adminSettings: PageBreadcrumb = { label: 'Admin settings' };

test.each([
    '/personal',
    '/personal/some-tab',
])('shows the top-level sidebar item as the only breadcrumb of %s', async (pathname) => {
    expect(await loadPageBreadcrumbs(pathname)).toEqual([
        { label: 'Home', to: '/personal' },
    ]);
});

test('shows Change requests as the only breadcrumb of the change requests page on enterprise', async () => {
    mockUiConfig(enterprise);

    expect(await loadPageBreadcrumbs('/change-requests')).toEqual([
        { label: 'Change requests', to: '/change-requests' },
    ]);
});

test.each([
    ['/projects', 'Projects'],
    ['/search', 'Flags overview'],
    ['/playground', 'Playground'],
])('shows the Workspace section before the sidebar item as breadcrumbs of %s', async (pathname, label) => {
    expect(await loadPageBreadcrumbs(pathname)).toEqual([
        workspace,
        { label, to: pathname },
    ]);
});

test.each([
    ['/insights', 'Analytics'],
    ['/impact-views', 'Impact views'],
])('shows the Workspace section before the sidebar item as breadcrumbs of %s on enterprise', async (pathname, label) => {
    mockUiConfig({ ...enterprise, flags: { impactViews: true } });

    expect(await loadPageBreadcrumbs(pathname)).toEqual([
        workspace,
        { label, to: pathname },
    ]);
});

test.each([
    ['/projects/default', { label: 'Flags', to: '/projects/default' }],
    [
        '/projects/default/features/my-flag',
        { label: 'Flags', to: '/projects/default' },
    ],
    [
        '/projects/default/logs',
        { label: 'Event log', to: '/projects/default/logs' },
    ],
    [
        '/projects/default/settings/environments',
        { label: 'Configure project', to: '/projects/default/settings' },
    ],
])('shows the project before its sidebar item as breadcrumbs of %s', async (pathname, item) => {
    mockUiConfig(enterprise);
    mockDefaultProject();

    expect(await loadPageBreadcrumbs(pathname)).toEqual([
        { label: 'Default', to: '/projects/default' },
        item,
    ]);
});

test('shows only the project as breadcrumb of a project page without a sidebar item', async () => {
    mockDefaultProject();

    expect(await loadPageBreadcrumbs('/projects/default/applications')).toEqual(
        [{ label: 'Default', to: '/projects/default' }],
    );
});

test('shows no breadcrumbs on a project page of a project that is not in the list', async () => {
    mockDefaultProject();

    expect(
        await loadPageBreadcrumbs('/projects/unknown/features/my-flag'),
    ).toEqual([]);
});

test.each([
    ['/admin/users', { label: 'Users', to: '/admin/users' }],
    ['/admin/users/1/edit', { label: 'Users', to: '/admin/users' }],
    ['/history', { label: 'Event log', to: '/history' }],
])('shows the admin settings page without its group as breadcrumbs of %s', async (pathname, page) => {
    expect(await loadPageBreadcrumbs(pathname)).toEqual([adminSettings, page]);
});

test('shows the most specific admin settings page as breadcrumb of a page nested in another', async () => {
    mockUiConfig(enterprise);

    expect(await loadPageBreadcrumbs('/admin/roles/project-roles')).toEqual([
        adminSettings,
        { label: 'Project roles', to: '/admin/roles/project-roles' },
    ]);
});

test.each([
    ['/context', { label: 'Context fields', to: '/context' }],
    ['/context/create', { label: 'Context fields', to: '/context' }],
    ['/applications', { label: 'Applications', to: '/applications' }],
])('shows the Workspace section before the workspace configuration item as breadcrumbs of %s', async (pathname, item) => {
    expect(await loadPageBreadcrumbs(pathname)).toEqual([
        workspace,
        configureWorkspace,
        item,
    ]);
});

test.each([
    '/admin/groups',
    '/release-templates',
    '/change-requests',
    '/insights',
    '/impact-views',
])('shows no breadcrumbs on %s when the sidebar hides it on oss', async (pathname) => {
    mockUiConfig({ ...oss, flags: { impactViews: true } });

    expect(await loadPageBreadcrumbs(pathname)).toEqual([]);
});

test('shows no breadcrumbs on change requests on the Pro plan', async () => {
    mockUiConfig(pro);

    expect(await loadPageBreadcrumbs('/change-requests')).toEqual([]);
});

test('shows no breadcrumbs on impact views when the impactViews flag is off', async () => {
    mockUiConfig(enterprise);

    expect(await loadPageBreadcrumbs('/impact-views')).toEqual([]);
});

test('shows no breadcrumbs on a page without a sidebar item', async () => {
    expect(await loadPageBreadcrumbs('/profile')).toEqual([]);
});

const segmentPage = (name: string | undefined): EntityPage => ({
    pattern: '/segments/edit/:segmentId',
    to: '/segments/edit/3',
    params: { segmentId: '3' },
    useName: () => name,
});

const segmentsBreadcrumbs: PageBreadcrumb[] = [
    workspace,
    configureWorkspace,
    { label: 'Segments', to: '/segments' },
];

test('adds the entity name, linked to the entity, as the last breadcrumb of an entity page', async () => {
    expect(
        await loadPageBreadcrumbs(
            '/segments/edit/3',
            segmentPage('beta-users'),
        ),
    ).toEqual([
        ...segmentsBreadcrumbs,
        { label: 'beta-users', to: '/segments/edit/3' },
    ]);
});

test('adds no breadcrumb for an entity without a known name', async () => {
    expect(
        await loadPageBreadcrumbs('/segments/edit/3', segmentPage(undefined)),
    ).toEqual(segmentsBreadcrumbs);
});

test('shows no breadcrumbs for a named entity on a page without a sidebar item', async () => {
    const flagPage: EntityPage = {
        pattern: '/projects/:projectId/features/:featureId/*',
        to: '/projects/unknown/features/my-flag',
        params: { projectId: 'unknown', featureId: 'my-flag' },
        useName: () => 'my-flag',
    };
    mockDefaultProject();

    expect(
        await loadPageBreadcrumbs(
            '/projects/unknown/features/my-flag',
            flagPage,
        ),
    ).toEqual([]);
});
