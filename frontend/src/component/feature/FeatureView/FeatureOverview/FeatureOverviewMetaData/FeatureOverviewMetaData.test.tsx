import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import FeatureOverviewMetaData from './FeatureOverviewMetaData';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
        },
    });
    testServerRoute(server, '/api/admin/projects/default/features/feature', {});
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
        'api/admin/projects/default/change-requests/pending',
        [],
    );
    testServerRoute(
        server,
        'api/admin/projects/default/environments/development/change-requests',
        {},
        'post',
        200,
    );
};

beforeEach(() => {
    setupApi();
});

const route = '/projects/default/features/feature';

test('show dependency dialogue', async () => {
    render(<FeatureOverviewMetaData />, {
        route,
        permissions: [
            { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
        ],
    });

    const addParentButton = await screen.findByText('Add parent feature');

    addParentButton.click();

    expect(
        screen.getByText('Add parent feature dependency'),
    ).toBeInTheDocument();
});
//
// test('show dependency dialogue for OSS with dependencies', async () => {
//     setupOssWithExistingDependencies();
//     render(<FeatureOverviewMetaData />, {
//         route,
//         permissions: [
//             { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
//         ],
//     });
//
//     const addParentButton = await screen.findByText('Add parent feature');
//
//     addParentButton.click();
//
//     expect(
//         screen.getByText('Add parent feature dependency'),
//     ).toBeInTheDocument();
// });
//
// test('show child', async () => {
//     render(<FeatureOverviewMetaData />, { route});
//
//     await screen.findByText('Children:');
//     await screen.findByText('1 feature');
// });
//
// test('show children', async () => {
//     render(<FeatureOverviewMetaData />, { route});
//
//     await screen.findByText('Children:');
//     await screen.findByText('2 features');
// });
//
// const feature = {
//     name: 'feature',
//     project: 'default',
//     dependencies: [] as IDependency[],
//     children: [] as string[],
// } as IFeatureToggle;
//
// test('delete dependency', async () => {
//     render(
//         <>
//             <ToastRenderer />
//             <FeatureOverviewMetaData />
//         </>,
//         {
//             route,
//             permissions: [
//                 { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
//             ],
//         },
//     );
//
//     await screen.findByText('Dependency:');
//     await screen.findByText('some_parent');
//
//     const actionsButton = screen.getByRole('button', {
//         name: /Dependency actions/i,
//     });
//     userEvent.click(actionsButton);
//
//     const deleteButton = await screen.findByText('Delete');
//     userEvent.click(deleteButton);
//
//     await screen.findByText('Dependency removed');
// });
//
// test('delete dependency with change request', async () => {
//     setupChangeRequestApi();
//     render(
//         <>
//             <ToastRenderer />
//             <FeatureOverviewMetaData />
//         </>,
//         {
//             route,
//             permissions: [
//                 /* deliberately no permissions */
//             ],
//         },
//     );
//
//     await screen.findByText('Dependency:');
//     await screen.findByText('some_parent');
//
//     const actionsButton = await screen.findByRole('button', {
//         name: /Dependency actions/i,
//     });
//     userEvent.click(actionsButton);
//
//     const deleteButton = await screen.findByText('Delete');
//     userEvent.click(deleteButton);
//
//     await screen.findByText('Change added to a draft');
// });
//
// test('edit dependency', async () => {
//     render(<FeatureOverviewMetaData />, {
//         route,
//         permissions: [
//             { permission: 'UPDATE_FEATURE_DEPENDENCY', project: 'default' },
//         ],
//     });
//
//     await screen.findByText('Dependency:');
//     await screen.findByText('some_parent');
//     await screen.findByText('Dependency value:');
//     await screen.findByText('disabled');
//
//     const actionsButton = await screen.findByRole('button', {
//         name: /Dependency actions/i,
//     });
//     userEvent.click(actionsButton);
//
//     const editButton = await screen.findByText('Edit');
//     userEvent.click(editButton);
//
//     await screen.findByText('Add parent feature dependency');
// });
//
// test('show variant dependencies', async () => {
//     render(<FeatureOverviewMetaData />, { route });
//
//     const variants = await screen.findByText('2 variants');
//
//     userEvent.hover(variants);
//
//     await screen.findByText('variantA');
//     await screen.findByText('variantB');
// });
//
// test('show variant dependency', async () => {
//     render(<FeatureOverviewMetaData />, { route });
//
//     await screen.findByText('variantA');
// });
//
// test('show disabled dependency', async () => {
//     render(<FeatureOverviewMetaData />, { route });
//
//     await screen.findByText('disabled');
// });
