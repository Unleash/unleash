import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import FeatureOverviewMetaData from './FeatureOverviewMetaData';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import type { IDependency, IFeatureToggle } from 'interfaces/featureToggle';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
        },
    });
    testServerRoute(
        server,
        '/api/admin/projects/default/features/feature/parents',
        ['some_parent'],
    );
    testServerRoute(
        server,
        '/api/admin/projects/default/features/feature/dependencies',
        {},
        'delete',
        200,
    );
    testServerRoute(server, '/api/admin/projects/default/dependencies', false);
};

const setupOssWithExistingDependencies = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'some value' },
        },
    });
    testServerRoute(server, '/api/admin/projects/default/dependencies', true);
};

const setupChangeRequestApi = () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                requiredApprovals: null,
                changeRequestEnabled: true,
            },
        ],
    );
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending',
        [],
    );
    testServerRoute(
        server,
        '/api/admin/projects/default/environments/development/change-requests',
        {},
        'post',
        200,
    );
};

const setupFeatureApi = (feature: IFeatureToggle) => {
    testServerRoute(
        server,
        '/api/admin/projects/default/features/feature',
        feature,
    );
};

beforeEach(() => {
    setupApi();
});

const route = '/projects/default/features/feature';

test('show dependency dialogue', async () => {
    setupFeatureApi(feature);
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        {
            route,
            permissions: [
                { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
            ],
        },
    );

    const addParentButton = await screen.findByText('Add parent feature');

    addParentButton.click();

    await screen.findByText('Add parent feature dependency');
});

test('show dependency dialogue for OSS with dependencies', async () => {
    setupOssWithExistingDependencies();
    setupFeatureApi({
        name: 'feature',
        project: 'default',
        dependencies: [] as Array<{ feature: string }>,
        children: [] as string[],
    } as IFeatureToggle);
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        {
            route,
            permissions: [
                { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
            ],
        },
    );

    const addParentButton = await screen.findByText('Add parent feature');

    addParentButton.click();

    await screen.findByText('Add parent feature dependency');
});

test('show child', async () => {
    setupFeatureApi({
        name: 'feature',
        project: 'default',
        dependencies: [] as Array<{ feature: string }>,
        children: ['some_child'],
    } as IFeatureToggle);
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        { route },
    );

    await screen.findByText('Children:');
    await screen.findByText('1 feature');
});

test('show children', async () => {
    setupFeatureApi({
        name: 'feature',
        project: 'default',
        dependencies: [] as Array<{ feature: string }>,
        children: ['some_child', 'some_other_child'],
    } as IFeatureToggle);
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        { route },
    );

    await screen.findByText('Children:');
    await screen.findByText('2 features');
});

const feature = {
    name: 'feature',
    project: 'default',
    dependencies: [] as IDependency[],
    children: [] as string[],
} as IFeatureToggle;

test('delete dependency', async () => {
    setupFeatureApi({
        ...feature,
        dependencies: [{ feature: 'some_parent' }],
    });
    render(
        <>
            <ToastRenderer />
            <Routes>
                <Route
                    path={'/projects/:projectId/features/:featureId'}
                    element={<FeatureOverviewMetaData />}
                />
            </Routes>
        </>,
        {
            route,
            permissions: [
                { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
            ],
        },
    );

    await screen.findByText('Dependency:');
    await screen.findByText('some_parent');

    const actionsButton = screen.getByRole('button', {
        name: /Dependency actions/i,
    });
    fireEvent.click(actionsButton);

    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);

    await screen.findByText('Dependency removed');
});

test('delete dependency with change request', async () => {
    setupChangeRequestApi();
    setupFeatureApi({
        ...feature,
        dependencies: [{ feature: 'some_parent' }],
    });
    render(
        <>
            <ToastRenderer />
            <Routes>
                <Route
                    path={'/projects/:projectId/features/:featureId'}
                    element={<FeatureOverviewMetaData />}
                />
            </Routes>
        </>,
        {
            route,
            permissions: [
                /* deliberately no permissions */
            ],
        },
    );

    await screen.findByText('Dependency:');
    await screen.findByText('some_parent');

    const actionsButton = await screen.findByRole('button', {
        name: /Dependency actions/i,
    });
    fireEvent.click(actionsButton);

    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);

    await screen.findByText('Change added to a draft');
});

test('edit dependency', async () => {
    setupFeatureApi({
        ...feature,
        dependencies: [{ feature: 'some_parent', enabled: false }],
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        {
            route,
            permissions: [
                { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
            ],
        },
    );

    await screen.findByText('Dependency:');
    await screen.findByText('some_parent');
    await screen.findByText('Dependency value:');
    await screen.findByText('disabled');

    const actionsButton = await screen.findByRole('button', {
        name: /Dependency actions/i,
    });
    fireEvent.click(actionsButton);

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    await screen.findByText('Add parent feature dependency');
});

test('show variant dependencies', async () => {
    setupFeatureApi({
        ...feature,
        dependencies: [
            {
                feature: 'some_parent',
                enabled: true,
                variants: ['variantA', 'variantB'],
            },
        ],
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        { route },
    );

    const variants = await screen.findByText('2 variants');

    await userEvent.hover(variants);

    await screen.findByText('variantA');
    await screen.findByText('variantB');
});

test('show variant dependency', async () => {
    setupFeatureApi({
        ...feature,
        dependencies: [
            {
                feature: 'some_parent',
                enabled: true,
                variants: ['variantA'],
            },
        ],
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        { route },
    );

    await screen.findByText('variantA');
});

test('show disabled dependency', async () => {
    setupFeatureApi({
        ...feature,
        dependencies: [
            {
                feature: 'some_parent',
                enabled: false,
            },
        ],
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId'}
                element={<FeatureOverviewMetaData />}
            />
        </Routes>,
        { route },
    );

    await screen.findByText('disabled');
});
