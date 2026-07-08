import { beforeEach, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router';
import { ProjectFeatureToggles } from './ProjectFeatureToggles.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { BATCH_SELECTED_COUNT } from 'utils/testIds';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

beforeEach(() => {
    localStorage.clear();
});

const setupApi = () => {
    const features = [
        {
            name: 'featureA',
            tags: [{ type: 'backend', value: 'sdk' }],
            type: 'operational',
            createdBy: { id: 1, name: 'author' },
        },
        {
            name: 'featureB',
            type: 'release',
            createdBy: { id: 1, name: 'author' },
        },
    ];
    testServerRoute(server, '/api/admin/search/features', {
        features,
        total: features.length,
    });
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            flagCreator: true,
        },
    });
    testServerRoute(server, '/api/admin/tags', {
        tags: [{ type: 'backend', value: 'sdk' }],
    });
    testServerRoute(server, '/api/admin/projects/default/flag-creators', [
        { id: 1, name: 'AuthorA' },
        { id: 2, name: 'AuthorB' },
    ]);
    testServerRoute(server, '/api/admin/projects/default/status', {
        activityCountByDate: [],
        resources: {
            members: 0,
            apiTokens: 0,
            segments: 0,
        },
        health: {
            current: 0,
        },
        technicalDebt: {
            current: 0,
        },
        lifecycleSummary: {
            initial: { currentFlags: 1, averageDays: null },
            preLive: { currentFlags: 2, averageDays: null },
            live: { currentFlags: 3, averageDays: null },
            completed: { currentFlags: 1, averageDays: null },
            archived: { currentFlags: 0, last30Days: 0 },
        },
        staleFlags: {
            total: 0,
        },
    });
};

test('filters by flag type', async () => {
    setupApi();

    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );
    const featureA = await screen.findByText('featureA');
    const featureARow = featureA.closest('tr')!;
    const icon = within(featureARow).getByTestId('feature-type-icon');

    fireEvent.click(icon);

    await screen.findByText('Flag type');
    await screen.findByText('Operational');
}, 10000);

test('selects project features', async () => {
    setupApi();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );
    await screen.findByText('featureA');
    await screen.findByText('featureB');
    await screen.findByText('Feature flags (2)');

    const [selectAll, selectFeatureA] = screen.queryAllByRole('checkbox');

    // batch select
    selectAll.click();
    let selectedCount = await screen.findByTestId(BATCH_SELECTED_COUNT);
    expect(selectedCount.textContent).toBe('2');

    // batch deselect
    fireEvent.click(selectAll);
    expect(screen.queryByTestId(BATCH_SELECTED_COUNT)).not.toBeInTheDocument();

    // select a single item
    fireEvent.click(selectFeatureA);
    selectedCount = await screen.findByTestId(BATCH_SELECTED_COUNT);
    expect(selectedCount.textContent).toBe('1');

    // deselect a single item
    fireEvent.click(selectFeatureA);
    expect(screen.queryByTestId(BATCH_SELECTED_COUNT)).not.toBeInTheDocument();
}, 10000);

test('filters by tag', async () => {
    setupApi();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );
    const tag = await screen.findByText('backend:sdk');

    fireEvent.click(tag);

    await screen.findByText('include');
    expect(await screen.findAllByText('backend:sdk')).toHaveLength(2);
}, 10000);

test('filters by flag author', async () => {
    setupApi();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );
    const addFilter = await screen.findByText('Add filter');
    fireEvent.click(addFilter);

    const createdBy = await screen.findByText('Created by');
    fireEvent.click(createdBy);

    const authorA = await screen.findByText('AuthorA');
    fireEvent.click(authorA);

    expect(window.location.href).toContain('createdBy=IS%3A1');
}, 10000);

test('Project is onboarded', async () => {
    const projectId = 'default';
    setupApi();
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboardingStatus: {
            status: 'onboarded',
        },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<ProjectFeatureToggles environments={[]} />}
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    expect(screen.queryByText('Project setup')).not.toBeInTheDocument();
}, 10000);

test('Project is not onboarded', async () => {
    const projectId = 'default';
    setupApi();
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboardingStatus: {
            status: 'onboarding-started',
        },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<ProjectFeatureToggles environments={[]} />}
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText('Project setup');
}, 10000);

test('renders lifecycle quick filters', async () => {
    setupApi();

    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText(/All lifecycles/);
    await screen.findByText(/Develop/);
    await screen.findByText(/Rollout production/);
    await screen.findByText(/Cleanup/);
}, 10000);

test('shows onboarding steps when flag is enabled and project is not onboarded', async () => {
    const projectId = 'default';
    setupApi();
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { flagCreator: true },
    });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboardingStatus: { status: 'onboarding-started' },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<ProjectFeatureToggles environments={[]} />}
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );
    await screen.findByText('Project setup');
}, 10000);

test('clears lifecycle filter when switching to archived view', async () => {
    setupApi();
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            flagCreator: true,
        },
    });

    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default?lifecycle=IS%3Alive',
        },
    );

    expect(window.location.href).toContain('lifecycle=IS%3Alive');

    await screen.findByText('featureA');
    const viewArchived = await screen.findByRole('button', {
        name: /View archived flags/i,
    });
    fireEvent.click(viewArchived);

    expect(window.location.href).not.toContain('lifecycle=IS%3Alive');
    expect(window.location.href).toContain('archived=IS%3Atrue');
}, 10000);

test('shows revive and delete actions for archived flags', async () => {
    setupApi();
    testServerRoute(server, '/api/admin/search/features', {
        features: [
            {
                name: 'activeFeature',
                type: 'release',
                createdBy: { id: 1, name: 'author' },
            },
            {
                name: 'archivedFeature',
                type: 'release',
                archivedAt: '2024-01-01T00:00:00.000Z',
                createdBy: { id: 1, name: 'author' },
            },
        ],
        total: 2,
    });

    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
            permissions: [
                { permission: UPDATE_FEATURE, project: 'default' },
                { permission: DELETE_FEATURE, project: 'default' },
            ],
        },
    );

    const archivedFeature = await screen.findByText('archivedFeature');
    const archivedRow = archivedFeature.closest('tr')!;

    fireEvent.click(
        within(archivedRow).getByRole('button', {
            name: 'Feature flag actions',
        }),
    );

    await screen.findByRole('menuitem', { name: 'Revive feature flag' });
    screen.getByRole('menuitem', { name: 'Delete feature flag' });
    expect(
        screen.queryByRole('menuitem', { name: 'Archive' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('menuitem', { name: 'Clone' }),
    ).not.toBeInTheDocument();
}, 10000);

test('rewrites legacy archived view URLs to the archived lifecycle filter', async () => {
    setupApi();
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            archiveInFlagsView: true,
        },
    });

    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default?archived=IS%3Atrue',
        },
    );

    await waitFor(() => {
        expect(window.location.href).not.toContain('archived=IS%3Atrue');
        expect(window.location.href).toContain('lifecycle=IS%3Aarchived');
    });
}, 10000);
